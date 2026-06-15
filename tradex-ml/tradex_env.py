"""
TradeX Trading Environment
Custom Gymnasium environment for RL-based trading with PPO.
"""
import gymnasium as gym
from gymnasium import spaces
import numpy as np
import pandas as pd
from typing import Optional, Tuple


class TradeXEnv(gym.Env):
    """
    A stock trading environment for reinforcement learning.

    Observation: OHLCV + technical indicators (normalized vector)
    Action: Discrete(3) — Buy(0), Hold(1), Sell(2)
    Reward: Portfolio PnL with transaction costs
    """
    metadata = {"render_modes": ["human"]}

    def __init__(
        self,
        df: pd.DataFrame,
        feature_columns: Optional[list] = None,
        initial_balance: float = 100000.0,
        transaction_cost: float = 0.001,  # 0.1%
        max_position: int = 100,
        lookback_window: int = 1,
        render_mode: Optional[str] = None,
    ):
        super().__init__()
        self.render_mode = render_mode

        self.df = df.reset_index(drop=True)
        self.initial_balance = initial_balance
        self.transaction_cost = transaction_cost
        self.max_position = max_position
        self.lookback_window = lookback_window

        # Feature columns (exclude non-numeric and label columns)
        if feature_columns is None:
            exclude = {"timestamp", "label_5m", "label_15m", "label_30m"}
            self.feature_columns = [
                c for c in df.columns
                if c not in exclude and df[c].dtype in [np.float64, np.float32, np.int64]
            ]
        else:
            self.feature_columns = feature_columns

        self.n_features = len(self.feature_columns)

        # Spaces
        self.observation_space = spaces.Box(
            low=-np.inf, high=np.inf,
            shape=(self.n_features,), dtype=np.float32
        )
        self.action_space = spaces.Discrete(3)  # Buy, Hold, Sell

        # State tracking
        self.reset()

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        self.current_step = 0
        self.balance = self.initial_balance
        self.position = 0
        self.total_trades = 0
        self.portfolio_values = [self.initial_balance]
        self.trades = []

        obs = self._get_observation()
        return obs, {}

    def _get_observation(self) -> np.ndarray:
        row = self.df.iloc[self.current_step]
        obs = np.array([row[c] for c in self.feature_columns], dtype=np.float32)
        return np.nan_to_num(obs, nan=0.0)

    def step(self, action: int) -> Tuple[np.ndarray, float, bool, bool, dict]:
        current_price = self.df.iloc[self.current_step]["close"]
        prev_price = current_price
        if self.current_step > 0:
            prev_price = self.df.iloc[self.current_step - 1]["close"]

        reward = 0.0
        trade_info = None

        if action == 0:  # Buy
            if self.position < self.max_position:
                cost = current_price * (1 + self.transaction_cost)
                shares_to_buy = min(
                    int(self.balance // cost),
                    self.max_position - self.position
                )
                if shares_to_buy > 0:
                    self.balance -= shares_to_buy * cost
                    self.position += shares_to_buy
                    self.total_trades += 1
                    trade_info = {"action": "buy", "price": current_price, "shares": shares_to_buy}

        elif action == 2:  # Sell
            if self.position > 0:
                revenue = current_price * (1 - self.transaction_cost)
                self.balance += self.position * revenue
                profit = (current_price - prev_price) * self.position
                reward = profit / self.initial_balance * 100
                trade_info = {"action": "sell", "price": current_price, "shares": self.position, "profit": profit}
                self.position = 0
                self.total_trades += 1

        # Move to next step
        self.current_step += 1

        # Calculate portfolio value
        portfolio_value = self.balance + self.position * current_price
        self.portfolio_values.append(portfolio_value)

        # Additional reward from unrealized PnL
        if self.position > 0 and action == 1:  # Holding
            unrealized_pnl = (current_price - prev_price) * self.position
            reward += unrealized_pnl / self.initial_balance * 10

        # Penalty for going negative
        if portfolio_value < 0:
            reward -= 10.0

        # Check if done
        terminated = self.current_step >= len(self.df) - 1
        truncated = False

        if trade_info:
            self.trades.append(trade_info)

        obs = self._get_observation()
        info = {
            "portfolio_value": portfolio_value,
            "position": self.position,
            "balance": self.balance,
            "total_trades": self.total_trades,
        }

        return obs, reward, terminated, truncated, info

    def get_total_return(self) -> float:
        """Calculate total return as percentage."""
        final_value = self.portfolio_values[-1]
        return (final_value - self.initial_balance) / self.initial_balance * 100

    def get_sharpe_ratio(self, risk_free_rate: float = 0.0) -> float:
        """Calculate Sharpe ratio from portfolio returns."""
        returns = pd.Series(self.portfolio_values).pct_change().dropna()
        if returns.std() == 0:
            return 0.0
        excess_returns = returns - risk_free_rate
        return np.sqrt(252) * excess_returns.mean() / excess_returns.std()

    def get_max_drawdown(self) -> float:
        """Calculate maximum drawdown."""
        peak = pd.Series(self.portfolio_values).cummax()
        drawdown = (pd.Series(self.portfolio_values) - peak) / peak
        return drawdown.min() * 100

    def get_metrics(self) -> dict:
        """Get all performance metrics."""
        return {
            "total_return_pct": self.get_total_return(),
            "sharpe_ratio": self.get_sharpe_ratio(),
            "max_drawdown_pct": self.get_max_drawdown(),
            "total_trades": self.total_trades,
            "final_portfolio_value": self.portfolio_values[-1],
        }

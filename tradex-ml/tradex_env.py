"""
TradeX Trading Environment
Custom Gymnasium environment for RL-based trading with PPO.
Supports multiple reward functions, position tracking, and transaction costs.
"""
import gymnasium as gym
from gymnasium import spaces
import numpy as np
import pandas as pd
from typing import Optional, Tuple


REWARD_MODES = ["pnl", "sharpe", "asymmetric"]


class TradeXEnv(gym.Env):
    """
    A stock trading environment for reinforcement learning.

    Observation: OHLCV + technical indicators (normalized vector)
    Action: Discrete(3) — Buy(0), Hold(1), Sell(2)
    Reward: Configurable (PnL, Sharpe, Asymmetric)
    """
    metadata = {"render_modes": ["human"]}

    def __init__(
        self,
        df: pd.DataFrame,
        feature_columns: Optional[list] = None,
        initial_balance: float = 100000.0,
        transaction_cost: float = 0.001,
        slippage: float = 0.0005,
        max_position: int = 100,
        reward_mode: str = "pnl",
        lookback_window: int = 1,
        render_mode: Optional[str] = None,
    ):
        super().__init__()
        self.render_mode = render_mode
        self.reward_mode = reward_mode

        self.df = df.reset_index(drop=True)
        self.initial_balance = initial_balance
        self.transaction_cost = transaction_cost
        self.slippage = slippage
        self.max_position = max_position
        self.lookback_window = lookback_window

        if feature_columns is None:
            exclude = {"timestamp", "label", "risk_label"}
            self.feature_columns = [
                c for c in df.columns
                if c not in exclude and df[c].dtype in [np.float64, np.float32, np.int64]
            ]
        else:
            self.feature_columns = feature_columns

        self.n_features = len(self.feature_columns)
        self.observation_space = spaces.Box(
            low=-np.inf, high=np.inf,
            shape=(self.n_features,), dtype=np.float32
        )
        self.action_space = spaces.Discrete(3)
        self.reset()

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        self.current_step = 0
        self.balance = self.initial_balance
        self.position = 0
        self.position_direction = 0  # -1 short, 0 flat, 1 long
        self.total_trades = 0
        self.portfolio_values = [self.initial_balance]
        self.trades = []
        self.returns_window = []
        return self._get_observation(), {}

    def _get_observation(self) -> np.ndarray:
        row = self.df.iloc[self.current_step]
        obs = np.array([row[c] for c in self.feature_columns], dtype=np.float32)
        return np.nan_to_num(obs, nan=0.0)

    def _get_price(self, step: int = None) -> float:
        if step is None:
            step = self.current_step
        return self.df.iloc[step]["close"]

    def _apply_slippage(self, price: float, is_buy: bool) -> float:
        if is_buy:
            return price * (1 + self.slippage)
        return price * (1 - self.slippage)

    def step(self, action: int) -> Tuple[np.ndarray, float, bool, bool, dict]:
        current_price = self._get_price()
        prev_price = self._get_price(max(0, self.current_step - 1))

        reward = 0.0
        trade_info = None

        if action == 0:  # Buy
            if self.position < self.max_position:
                exec_price = self._apply_slippage(current_price, is_buy=True)
                cost = exec_price * (1 + self.transaction_cost)
                shares_to_buy = min(
                    int(self.balance // cost),
                    self.max_position - self.position
                )
                if shares_to_buy > 0:
                    self.balance -= shares_to_buy * cost
                    self.position += shares_to_buy
                    self.position_direction = 1
                    self.total_trades += 1
                    trade_info = {"action": "buy", "price": exec_price, "shares": shares_to_buy}

        elif action == 2:  # Sell
            if self.position > 0:
                exec_price = self._apply_slippage(current_price, is_buy=False)
                revenue = exec_price * (1 - self.transaction_cost)
                profit = (exec_price - self.position_cost) * self.position if hasattr(self, 'position_cost') else 0
                self.balance += self.position * revenue
                trade_info = {"action": "sell", "price": exec_price, "shares": self.position, "profit": profit}
                self.position = 0
                self.position_direction = 0
                self.total_trades += 1

        # Track position cost basis
        if action == 0 and self.position > 0:
            self.position_cost = current_price

        self.current_step += 1
        new_price = self._get_price()
        portfolio_value = self.balance + self.position * new_price
        self.portfolio_values.append(portfolio_value)

        # Calculate step return
        step_return = (new_price - current_price) / current_price if current_price > 0 else 0
        self.returns_window.append(step_return)

        # Reward based on mode
        if self.reward_mode == "pnl":
            reward = self._reward_pnl(current_price, new_price)
        elif self.reward_mode == "sharpe":
            reward = self._reward_sharpe()
        elif self.reward_mode == "asymmetric":
            reward = self._reward_asymmetric(current_price, new_price)
        else:
            reward = self._reward_pnl(current_price, new_price)

        terminated = self.current_step >= len(self.df) - 1
        truncated = False

        if trade_info:
            self.trades.append(trade_info)

        obs = self._get_observation()
        info = {
            "portfolio_value": portfolio_value,
            "position": self.position,
            "position_direction": self.position_direction,
            "balance": self.balance,
            "total_trades": self.total_trades,
            "step_return": step_return,
        }
        return obs, reward, terminated, truncated, info

    def _reward_pnl(self, old_price: float, new_price: float) -> float:
        if self.position > 0:
            unrealized = (new_price - old_price) * self.position
            return unrealized / self.initial_balance * 100
        return 0.0

    def _reward_sharpe(self) -> float:
        if len(self.returns_window) < 2:
            return 0.0
        window = self.returns_window[-20:]
        mean_ret = np.mean(window)
        std_ret = np.std(window)
        if std_ret == 0:
            return 0.0
        return mean_ret / std_ret * np.sqrt(252)

    def _reward_asymmetric(self, old_price: float, new_price: float) -> float:
        if self.position <= 0:
            return 0.0
        step_return = (new_price - old_price) / old_price if old_price > 0 else 0
        if step_return > 0:
            return step_return * self.position * 1.0  # Full reward for gains
        else:
            return step_return * self.position * 2.0  # Double penalty for losses

    def get_total_return(self) -> float:
        final_value = self.portfolio_values[-1]
        return (final_value - self.initial_balance) / self.initial_balance * 100

    def get_sharpe_ratio(self, risk_free_rate: float = 0.0) -> float:
        returns = pd.Series(self.portfolio_values).pct_change().dropna()
        if returns.std() == 0:
            return 0.0
        excess_returns = returns - risk_free_rate
        return np.sqrt(252) * excess_returns.mean() / excess_returns.std()

    def get_max_drawdown(self) -> float:
        peak = pd.Series(self.portfolio_values).cummax()
        drawdown = (pd.Series(self.portfolio_values) - peak) / peak
        return drawdown.min() * 100

    def get_win_rate(self) -> float:
        sell_trades = [t for t in self.trades if t["action"] == "sell"]
        if not sell_trades:
            return 0.0
        winning = [t for t in sell_trades if t.get("profit", 0) > 0]
        return len(winning) / len(sell_trades) * 100

    def get_metrics(self) -> dict:
        return {
            "total_return_pct": self.get_total_return(),
            "sharpe_ratio": self.get_sharpe_ratio(),
            "max_drawdown_pct": self.get_max_drawdown(),
            "win_rate_pct": self.get_win_rate(),
            "total_trades": self.total_trades,
            "final_portfolio_value": self.portfolio_values[-1],
            "reward_mode": self.reward_mode,
        }

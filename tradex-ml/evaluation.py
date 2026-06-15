"""
TradeX Model Evaluation Metrics
Comprehensive performance metrics for trading models.
"""
import numpy as np
import pandas as pd
from typing import Dict, List, Optional
import json
import os
import logging

log = logging.getLogger(__name__)


def total_return(equity_curve: List[float]) -> float:
    """Total return as percentage."""
    return (equity_curve[-1] - equity_curve[0]) / equity_curve[0] * 100


def cagr(equity_curve: List[float], periods_per_year: int = 252) -> float:
    """Compound Annual Growth Rate."""
    n_periods = len(equity_curve) - 1
    if n_periods == 0 or equity_curve[0] <= 0:
        return 0.0
    return (equity_curve[-1] / equity_curve[0]) ** (periods_per_year / n_periods) - 1


def sharpe_ratio(equity_curve: List[float], risk_free_rate: float = 0.0,
                 periods_per_year: int = 252) -> float:
    """Annualized Sharpe ratio."""
    returns = pd.Series(equity_curve).pct_change().dropna()
    if len(returns) == 0 or returns.std() == 0:
        return 0.0
    excess_returns = returns - risk_free_rate / periods_per_year
    return np.sqrt(periods_per_year) * excess_returns.mean() / excess_returns.std()


def sortino_ratio(equity_curve: List[float], risk_free_rate: float = 0.0,
                  periods_per_year: int = 252) -> float:
    """Annualized Sortino ratio (penalizes only downside volatility)."""
    returns = pd.Series(equity_curve).pct_change().dropna()
    downside_returns = returns[returns < 0]
    if len(downside_returns) == 0 or downside_returns.std() == 0:
        return float("inf") if returns.mean() > 0 else 0.0
    excess_returns = returns - risk_free_rate / periods_per_year
    return np.sqrt(periods_per_year) * excess_returns.mean() / downside_returns.std()


def max_drawdown(equity_curve: List[float]) -> float:
    """Maximum drawdown as percentage."""
    peak = pd.Series(equity_curve).cummax()
    drawdown = (pd.Series(equity_curve) - peak) / peak
    return drawdown.min() * 100


def calmar_ratio(equity_curve: List[float], periods_per_year: int = 252) -> float:
    """Calmar ratio (CAGR / abs(max drawdown))."""
    mdd = abs(max_drawdown(equity_curve) / 100)
    if mdd == 0:
        return float("inf") if cagr(equity_curve) > 0 else 0.0
    return cagr(equity_curve) / mdd


def win_rate(trades: List[Dict]) -> float:
    """Percentage of profitable trades."""
    if not trades:
        return 0.0
    profitable = sum(1 for t in trades if t.get("profit", 0) > 0)
    return profitable / len(trades) * 100


def profit_factor(trades: List[Dict]) -> float:
    """Gross profit / gross loss."""
    gross_profit = sum(t.get("profit", 0) for t in trades if t.get("profit", 0) > 0)
    gross_loss = abs(sum(t.get("profit", 0) for t in trades if t.get("profit", 0) < 0))
    if gross_loss == 0:
        return float("inf") if gross_profit > 0 else 0.0
    return gross_profit / gross_loss


def avg_trade_duration(trades: List[Dict]) -> float:
    """Average trade duration in steps (bars)."""
    durations = [t.get("duration", 0) for t in trades if "duration" in t]
    return np.mean(durations) if durations else 0.0


def trades_per_day(trades: List[Dict], trading_days: int = 252) -> float:
    """Average number of trades per day."""
    if trading_days == 0:
        return 0.0
    return len(trades) / trading_days


def monthly_returns(equity_curve: List[float], dates: Optional[List] = None) -> Dict:
    """Monthly return breakdown."""
    if dates is None:
        dates = pd.date_range(start="2024-01-01", periods=len(equity_curve), freq="D")

    df = pd.DataFrame({"date": dates[:len(equity_curve)], "equity": equity_curve})
    df["date"] = pd.to_datetime(df["date"])
    df["month"] = df["date"].dt.to_period("M")

    monthly = df.groupby("month")["equity"].last().pct_change().dropna()
    return {str(k): round(v * 100, 2) for k, v in monthly.items()}


def compute_all_metrics(equity_curve: List[float], trades: List[Dict] = None,
                        periods_per_year: int = 252) -> Dict:
    """Compute all metrics at once."""
    if trades is None:
        trades = []

    return {
        "total_return_pct": round(total_return(equity_curve), 2),
        "cagr_pct": round(cagr(equity_curve, periods_per_year) * 100, 2),
        "sharpe_ratio": round(sharpe_ratio(equity_curve, periods_per_year=periods_per_year), 2),
        "sortino_ratio": round(sortino_ratio(equity_curve, periods_per_year=periods_per_year), 2),
        "max_drawdown_pct": round(max_drawdown(equity_curve), 2),
        "calmar_ratio": round(calmar_ratio(equity_curve, periods_per_year), 2),
        "win_rate_pct": round(win_rate(trades), 1),
        "profit_factor": round(profit_factor(trades), 2),
        "avg_trade_duration": round(avg_trade_duration(trades), 1),
        "trades_per_day": round(trades_per_day(trades, periods_per_year), 2),
        "total_trades": len(trades),
    }


def save_evaluation_report(metrics: Dict, save_path: str = "models/evaluation.json"):
    """Save evaluation report as JSON."""
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    with open(save_path, "w") as f:
        json.dump(metrics, f, indent=2)
    log.info(f"Evaluation report saved to {save_path}")


# =====================================================
#  BENCHMARK STRATEGIES
# =====================================================

def buy_and_hold_benchmark(prices: List[float]) -> Dict:
    """Buy-and-hold benchmark."""
    equity = [100000.0]
    shares = int(equity[0] / prices[0])
    for p in prices[1:]:
        equity.append(shares * p)
    return compute_all_metrics(equity)


def sma_crossover_benchmark(prices: List[float], short_window: int = 20,
                             long_window: int = 50) -> Dict:
    """Simple SMA crossover benchmark."""
    equity = [100000.0]
    balance = 100000.0
    position = 0
    trades = []

    for i in range(long_window, len(prices)):
        short_sma = np.mean(prices[i - short_window:i])
        long_sma = np.mean(prices[i - long_window:i])

        if short_sma > long_sma and position == 0:
            shares = int(balance / prices[i])
            if shares > 0:
                balance -= shares * prices[i]
                position = shares
                trades.append({"action": "buy", "price": prices[i]})
        elif short_sma < long_sma and position > 0:
            balance += position * prices[i]
            profit = (prices[i] - trades[-1]["price"]) * position
            trades[-1]["profit"] = profit
            position = 0

        equity.append(balance + position * prices[i])

    return compute_all_metrics(equity, trades)


def random_walk_benchmark(prices: List[float], n_simulations: int = 100) -> Dict:
    """Random walk baseline (average of many simulations)."""
    all_metrics = []
    for _ in range(n_simulations):
        equity = [100000.0]
        balance = 100000.0
        position = 0

        for i in range(1, len(prices)):
            action = np.random.choice(["buy", "hold", "sell"])
            if action == "buy" and position == 0:
                shares = int(balance / prices[i])
                if shares > 0:
                    balance -= shares * prices[i]
                    position = shares
            elif action == "sell" and position > 0:
                balance += position * prices[i]
                position = 0
            equity.append(balance + position * prices[i])

        all_metrics.append(compute_all_metrics(equity))

    # Average metrics across simulations
    avg = {}
    for key in all_metrics[0]:
        vals = [m[key] for m in all_metrics]
        avg[key] = round(np.mean(vals), 2)
    return avg

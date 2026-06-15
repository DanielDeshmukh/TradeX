"""
TradeX Backtester
Walk-forward validation for trained RL models.
"""
import os
import sys
import json
import logging
import numpy as np
import pandas as pd
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from feature_engineering import add_all_features, add_labels
from tradex_env import TradeXEnv

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)


def walk_forward_backtest(
    df: pd.DataFrame,
    model,
    train_window: int = 2500,
    test_window: int = 500,
    step: int = 500,
) -> list:
    """Walk-forward backtesting with sliding window."""
    results = []
    total_steps = len(df)

    for start in range(0, total_steps - train_window - test_window, step):
        test_start = start + train_window
        test_end = min(test_start + test_window, total_steps)

        test_data = df.iloc[test_start:test_end].reset_index(drop=True)
        if len(test_data) < 50:
            continue

        env = TradeXEnv(test_data)
        obs, _ = env.reset()

        done = False
        while not done:
            action, _ = model.predict(obs, deterministic=True)
            obs, reward, terminated, truncated, info = env.step(int(action))
            done = terminated or truncated

        metrics = env.get_metrics()
        metrics["window_start"] = str(test_data.iloc[0].get("timestamp", start))
        metrics["window_end"] = str(test_data.iloc[-1].get("timestamp", test_end))
        results.append(metrics)

        log.info(
            f"Window {start}-{test_end}: "
            f"Return={metrics['total_return_pct']:.2f}%, "
            f"Sharpe={metrics['sharpe_ratio']:.2f}, "
            f"MaxDD={metrics['max_drawdown_pct']:.2f}%"
        )

    return results


def aggregate_results(results: list) -> dict:
    """Aggregate walk-forward results."""
    if not results:
        return {}

    returns = [r["total_return_pct"] for r in results]
    sharpes = [r["sharpe_ratio"] for r in results]
    drawdowns = [r["max_drawdown_pct"] for r in results]
    trades = [r["total_trades"] for r in results]

    return {
        "n_windows": len(results),
        "avg_return_pct": np.mean(returns),
        "std_return_pct": np.std(returns),
        "avg_sharpe": np.mean(sharpes),
        "avg_max_drawdown_pct": np.mean(drawdowns),
        "worst_drawdown_pct": min(drawdowns),
        "total_trades": sum(trades),
        "avg_trades_per_window": np.mean(trades),
        "win_rate_pct": sum(1 for r in returns if r > 0) / len(returns) * 100,
    }


def compare_benchmark(results: list, test_df: pd.DataFrame) -> dict:
    """Compare model vs buy-and-hold benchmark."""
    buy_hold_return = (
        (test_df["close"].iloc[-1] - test_df["close"].iloc[0])
        / test_df["close"].iloc[0] * 100
    )

    model_avg_return = np.mean([r["total_return_pct"] for r in results])

    return {
        "buy_hold_return_pct": buy_hold_return,
        "model_avg_return_pct": model_avg_return,
        "alpha": model_avg_return - buy_hold_return,
        "outperformed": model_avg_return > buy_hold_return,
    }


if __name__ == "__main__":
    try:
        from stable_baselines3 import PPO
    except ImportError:
        log.error("stable-baselines3 not installed")
        sys.exit(1)

    import argparse

    parser = argparse.ArgumentParser(description="Backtest TradeX PPO Model")
    parser.add_argument("--model", type=str, required=True, help="Path to trained model")
    parser.add_argument("--data", type=str, required=True, help="Path to test CSV")
    parser.add_argument("--output", type=str, default="models/backtest_results.json")
    args = parser.parse_args()

    # Load data
    df = pd.read_csv(args.data)
    df = add_all_features(df)
    df = add_labels(df)
    df = df.dropna().reset_index(drop=True)

    # Load model
    model = PPO.load(args.model)

    # Run walk-forward backtest
    log.info("Running walk-forward backtest...")
    results = walk_forward_backtest(df, model)

    # Aggregate
    aggregated = aggregate_results(results)
    benchmark = compare_benchmark(results, df)

    output = {"walk_forward": aggregated, "benchmark": benchmark, "windows": results}
    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    with open(args.output, "w") as f:
        json.dump(output, f, indent=2)

    log.info(f"\n=== BACKTEST RESULTS ===\n{json.dumps(aggregated, indent=2)}")
    log.info(f"\n=== BENCHMARK ===\n{json.dumps(benchmark, indent=2)}")
    log.info(f"Results saved to {args.output}")

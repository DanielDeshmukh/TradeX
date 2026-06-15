"""
TradeX Backtester
Walk-forward validation with reports, benchmarks, and performance thresholds.
"""
import os
import sys
import json
import logging
import numpy as np
import pandas as pd
from datetime import datetime

sys.path.insert(0, os.path.dirname(__file__))

from feature_engineering import engineer_features, time_split, load_config
from tradex_env import TradeXEnv

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

PERFORMANCE_THRESHOLDS = {
    "min_sharpe": 1.0,
    "min_win_rate": 50.0,
    "max_drawdown": -15.0,
    "min_return_pct": 0.0,
}


def walk_forward_backtest(
    df: pd.DataFrame,
    model,
    train_window: int = 2500,
    test_window: int = 500,
    step: int = 500,
) -> list:
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
    if not results:
        return {}
    returns = [r["total_return_pct"] for r in results]
    sharpes = [r["sharpe_ratio"] for r in results]
    drawdowns = [r["max_drawdown_pct"] for r in results]
    trades = [r["total_trades"] for r in results]
    win_rates = [r.get("win_rate_pct", 0) for r in results]

    return {
        "n_windows": len(results),
        "avg_return_pct": round(np.mean(returns), 2),
        "std_return_pct": round(np.std(returns), 2),
        "avg_sharpe": round(np.mean(sharpes), 2),
        "avg_max_drawdown_pct": round(np.mean(drawdowns), 2),
        "worst_drawdown_pct": round(min(drawdowns), 2),
        "total_trades": sum(trades),
        "avg_trades_per_window": round(np.mean(trades), 1),
        "win_rate_pct": round(sum(1 for r in returns if r > 0) / len(returns) * 100, 1),
        "avg_win_rate": round(np.mean(win_rates), 1),
    }


def compare_benchmark(results: list, test_df: pd.DataFrame) -> dict:
    buy_hold_return = (
        (test_df["close"].iloc[-1] - test_df["close"].iloc[0])
        / test_df["close"].iloc[0] * 100
    )
    model_avg_return = np.mean([r["total_return_pct"] for r in results])
    return {
        "buy_hold_return_pct": round(buy_hold_return, 2),
        "model_avg_return_pct": round(model_avg_return, 2),
        "alpha": round(model_avg_return - buy_hold_return, 2),
        "outperformed": model_avg_return > buy_hold_return,
    }


def check_performance_thresholds(aggregated: dict) -> dict:
    violations = []
    if aggregated.get("avg_sharpe", 0) < PERFORMANCE_THRESHOLDS["min_sharpe"]:
        violations.append(f"Sharpe {aggregated['avg_sharpe']:.2f} < {PERFORMANCE_THRESHOLDS['min_sharpe']}")
    if aggregated.get("avg_win_rate", 0) < PERFORMANCE_THRESHOLDS["min_win_rate"]:
        violations.append(f"Win rate {aggregated['avg_win_rate']:.1f}% < {PERFORMANCE_THRESHOLDS['min_win_rate']}%")
    if aggregated.get("worst_drawdown_pct", 0) < PERFORMANCE_THRESHOLDS["max_drawdown"]:
        violations.append(f"Max DD {aggregated['worst_drawdown_pct']:.2f}% < {PERFORMANCE_THRESHOLDS['max_drawdown']}%")
    return {
        "passed": len(violations) == 0,
        "violations": violations,
        "thresholds": PERFORMANCE_THRESHOLDS,
    }


def generate_trade_log(results: list) -> list:
    log_entries = []
    for i, r in enumerate(results):
        log_entries.append({
            "window": i + 1,
            "start": r.get("window_start"),
            "end": r.get("window_end"),
            "return_pct": r["total_return_pct"],
            "trades": r["total_trades"],
            "sharpe": r["sharpe_ratio"],
        })
    return log_entries


def generate_monthly_breakdown(results: list) -> dict:
    returns = [r["total_return_pct"] for r in results]
    return {
        "per_window_returns": [round(r, 2) for r in returns],
        "cumulative_return_pct": round(sum(returns), 2),
        "best_window": round(max(returns), 2),
        "worst_window": round(min(returns), 2),
        "positive_windows": sum(1 for r in returns if r > 0),
        "negative_windows": sum(1 for r in returns if r < 0),
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

    df = pd.read_csv(args.data, index_col=0).T
    col_names = df.iloc[:, 0].tolist()
    data = df.iloc[:, 1:].T
    data.columns = col_names
    for c in ["open", "high", "low", "close", "volume"]:
        if c in data.columns:
            data[c] = pd.to_numeric(data[c], errors="coerce")
    data = data.reset_index(drop=True)

    cfg = load_config()
    data = engineer_features(data, config=cfg)

    model = PPO.load(args.model)

    log.info("Running walk-forward backtest...")
    results = walk_forward_backtest(data, model)

    aggregated = aggregate_results(results)
    benchmark = compare_benchmark(results, data)
    thresholds = check_performance_thresholds(aggregated)
    trade_log = generate_trade_log(results)
    monthly = generate_monthly_breakdown(results)

    output = {
        "walk_forward": aggregated,
        "benchmark": benchmark,
        "thresholds": thresholds,
        "monthly_breakdown": monthly,
        "trade_log": trade_log,
        "windows": results,
    }
    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    with open(args.output, "w") as f:
        json.dump(output, f, indent=2)

    log.info(f"\n=== BACKTEST RESULTS ===\n{json.dumps(aggregated, indent=2)}")
    log.info(f"\n=== BENCHMARK ===\n{json.dumps(benchmark, indent=2)}")
    log.info(f"\n=== THRESHOLDS ===\n{json.dumps(thresholds, indent=2)}")
    log.info(f"Results saved to {args.output}")

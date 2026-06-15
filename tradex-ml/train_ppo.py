"""
TradeX PPO Training Script
Trains a PPO agent on historical stock data using Stable-Baselines3.
"""
import os
import sys
import json
import logging
import numpy as np
import pandas as pd
from datetime import datetime

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from feature_engineering import add_all_features, add_labels, time_split
from tradex_env import TradeXEnv

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger(__name__)


def prepare_data(csv_path: str) -> tuple:
    """Load CSV, add features, split into train/val/test."""
    log.info(f"Loading data from {csv_path}")
    df = pd.read_csv(csv_path)

    if "timestamp" not in df.columns:
        raise ValueError("CSV must have a 'timestamp' column")

    log.info(f"Raw data: {len(df)} rows")
    df = add_all_features(df)
    df = add_labels(df)
    df = df.dropna().reset_index(drop=True)
    log.info(f"After features: {len(df)} rows")

    train, val, test = time_split(df)
    return train, val, test


def train_ppo(
    train_df: pd.DataFrame,
    val_df: pd.DataFrame,
    total_timesteps: int = 100_000,
    learning_rate: float = 3e-4,
    n_steps: int = 2048,
    batch_size: int = 64,
    n_epochs: int = 10,
    gamma: float = 0.99,
    gae_lambda: float = 0.95,
    clip_range: float = 0.2,
    ent_coef: float = 0.01,
    model_save_path: str = "models/ppo_baseline",
):
    """Train PPO agent using Stable-Baselines3."""
    try:
        from stable_baselines3 import PPO
        from stable_baselines3.common.vec_env import DummyVecEnv
        from stable_baselines3.common.callbacks import EvalCallback
    except ImportError:
        log.error("stable-baselines3 not installed. Run: pip install stable-baselines3")
        return None

    # Create environments
    def make_env(df, prefix=""):
        def _init():
            env = TradeXEnv(df)
            return env
        return _init

    train_env = DummyVecEnv([make_env(train_df, "train")])
    eval_env = DummyVecEnv([make_env(val_df, "eval")])

    # Model architecture
    policy_kwargs = dict(
        activation_fn="relu",
        net_arch=dict(pi=[128, 128], vf=[128, 128]),
    )

    # Create PPO model
    log.info("Creating PPO model...")
    model = PPO(
        "MlpPolicy",
        train_env,
        learning_rate=learning_rate,
        n_steps=n_steps,
        batch_size=batch_size,
        n_epochs=n_epochs,
        gamma=gamma,
        gae_lambda=gae_lambda,
        clip_range=clip_range,
        ent_coef=ent_coef,
        verbose=1,
        tensorboard_log="logs/",
        policy_kwargs=policy_kwargs,
    )

    # Eval callback
    os.makedirs("models", exist_ok=True)
    eval_callback = EvalCallback(
        eval_env,
        best_model_save_path="models/",
        log_path="logs/",
        eval_freq=5000,
        deterministic=True,
    )

    # Train
    log.info(f"Training PPO for {total_timesteps} timesteps...")
    model.learn(total_timesteps=total_timesteps, callback=eval_callback)

    # Save final model
    os.makedirs(model_save_path, exist_ok=True)
    model.save(f"{model_save_path}/ppo_final")
    log.info(f"Model saved to {model_save_path}/ppo_final")

    return model


def evaluate(model, test_df: pd.DataFrame) -> dict:
    """Evaluate trained model on test data."""
    env = TradeXEnv(test_df)
    obs, _ = env.reset()

    done = False
    while not done:
        action, _ = model.predict(obs, deterministic=True)
        obs, reward, terminated, truncated, info = env.step(int(action))
        done = terminated or truncated

    metrics = env.get_metrics()
    log.info(f"Test Results: {json.dumps(metrics, indent=2)}")
    return metrics


def save_results(metrics: dict, save_path: str = "models/results.json"):
    """Save evaluation results to JSON."""
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    with open(save_path, "w") as f:
        json.dump(metrics, f, indent=2)
    log.info(f"Results saved to {save_path}")


# =====================================================
#  MAIN
# =====================================================

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Train TradeX PPO Agent")
    parser.add_argument("--data", type=str, default="data/historical_data.csv", help="Path to OHLCV CSV")
    parser.add_argument("--timesteps", type=int, default=100_000, help="Total training timesteps")
    parser.add_argument("--lr", type=float, default=3e-4, help="Learning rate")
    parser.add_argument("--save-path", type=str, default="models/ppo_baseline", help="Model save path")
    args = parser.parse_args()

    # Prepare data
    train_df, val_df, test_df = prepare_data(args.data)

    # Train
    model = train_ppo(
        train_df, val_df,
        total_timesteps=args.timesteps,
        learning_rate=args.lr,
        model_save_path=args.save_path,
    )

    if model:
        # Evaluate
        metrics = evaluate(model, test_df)
        save_results(metrics, f"{args.save_path}/results.json")

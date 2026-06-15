"""
TradeX PPO Training Script
Trains a PPO agent on historical stock data using Stable-Baselines3.
Supports configurable hyperparams, curriculum learning, TensorBoard, checkpoints.
"""
import os
import sys
import json
import logging
import numpy as np
import pandas as pd
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from feature_engineering import engineer_features, time_split, load_config
from tradex_env import TradeXEnv, REWARD_MODES

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger(__name__)


# =====================================================
#  DEFAULT HYPERPARAMETERS
# =====================================================
DEFAULT_HYPERPARAMS = {
    "learning_rate": 3e-4,
    "n_steps": 2048,
    "batch_size": 64,
    "n_epochs": 10,
    "gamma": 0.99,
    "gae_lambda": 0.95,
    "clip_range": 0.2,
    "ent_coef": 0.01,
    "vf_coef": 0.5,
    "max_grad_norm": 0.5,
    "net_arch": {"pi": [128, 128], "vf": [128, 128]},
    "activation_fn": "relu",
}

DEFAULT_TRAIN_CONFIG = {
    "total_timesteps": 100_000,
    "eval_freq": 5000,
    "n_eval_episodes": 5,
    "checkpoint_freq": 10000,
    "early_stopping_patience": 10,
    "curriculum_stages": [
        {"timesteps": 50000, "reward_mode": "pnl", "description": "Stage 1: PnL learning"},
        {"timesteps": 50000, "reward_mode": "sharpe", "description": "Stage 2: Risk-adjusted"},
    ],
}


def prepare_data(csv_path: str, config: dict = None) -> tuple:
    """Load CSV, add features, split into train/val/test."""
    log.info(f"Loading data from {csv_path}")
    df = pd.read_csv(csv_path, index_col=0).T
    col_names = df.iloc[:, 0].tolist()
    data = df.iloc[:, 1:].T
    data.columns = col_names
    for c in ["open", "high", "low", "close", "volume"]:
        if c in data.columns:
            data[c] = pd.to_numeric(data[c], errors="coerce")
    data = data.reset_index(drop=True)

    log.info(f"Raw data: {len(data)} rows")
    feat_config = load_config() if config is None else config.get("feature_config", load_config())
    data = engineer_features(data, config=feat_config)
    log.info(f"After features: {len(data)} rows, {data.shape[1]} columns")

    train, val, test = time_split(data)
    log.info(f"Split: train={len(train)}, val={len(val)}, test={len(test)}")
    return train, val, test


def create_env(df: pd.DataFrame, reward_mode: str = "pnl") -> TradeXEnv:
    return TradeXEnv(df, reward_mode=reward_mode)


def train_ppo(
    train_df: pd.DataFrame,
    val_df: pd.DataFrame,
    hyperparams: dict = None,
    train_config: dict = None,
    model_save_path: str = "models/ppo_baseline",
    use_curriculum: bool = False,
):
    """Train PPO agent with configurable hyperparams and optional curriculum."""
    try:
        from stable_baselines3 import PPO
        from stable_baselines3.common.vec_env import DummyVecEnv
        from stable_baselines3.common.callbacks import EvalCallback, CheckpointCallback, BaseCallback
    except ImportError:
        log.error("stable-baselines3 not installed. Run: pip install stable-baselines3")
        return None

    hp = {**DEFAULT_HYPERPARAMS, **(hyperparams or {})}
    cfg = {**DEFAULT_TRAIN_CONFIG, **(train_config or {})}

    os.makedirs(model_save_path, exist_ok=True)
    os.makedirs("logs/", exist_ok=True)

    policy_kwargs = dict(
        activation_fn={"relu": "relu", "tanh": "tanh"}.get(hp["activation_fn"], "relu"),
        net_arch=hp["net_arch"],
    )

    reward_mode = hp.get("reward_mode", "pnl")

    def make_env(df, mode="train"):
        def _init():
            return create_env(df, reward_mode=mode)
        return _init

    train_env = DummyVecEnv([make_env(train_df, reward_mode)])
    eval_env = DummyVecEnv([make_env(val_df, reward_mode)])

    checkpoint_callback = CheckpointCallback(
        save_freq=cfg["checkpoint_freq"],
        save_path=model_save_path,
        name_prefix="ppo_checkpoint",
    )

    eval_callback = EvalCallback(
        eval_env,
        best_model_save_path=model_save_path,
        log_path="logs/",
        eval_freq=cfg["eval_freq"],
        n_eval_episodes=cfg["n_eval_episodes"],
        deterministic=True,
    )

    log.info(f"Creating PPO model (lr={hp['learning_rate']}, arch={hp['net_arch']})")
    model = PPO(
        "MlpPolicy",
        train_env,
        learning_rate=hp["learning_rate"],
        n_steps=hp["n_steps"],
        batch_size=hp["batch_size"],
        n_epochs=hp["n_epochs"],
        gamma=hp["gamma"],
        gae_lambda=hp["gae_lambda"],
        clip_range=hp["clip_range"],
        ent_coef=hp["ent_coef"],
        vf_coef=hp["vf_coef"],
        max_grad_norm=hp["max_grad_norm"],
        verbose=1,
        tensorboard_log="logs/",
        policy_kwargs=policy_kwargs,
    )

    if use_curriculum and cfg.get("curriculum_stages"):
        total = 0
        for stage in cfg["curriculum_stages"]:
            timesteps = stage["timesteps"]
            mode = stage["reward_mode"]
            log.info(f"Curriculum: {stage['description']} ({timesteps} steps, reward={mode})")
            train_env.envs[0].reward_mode = mode
            eval_env.envs[0].reward_mode = mode
            model.learn(total_timesteps=timesteps, callback=[eval_callback, checkpoint_callback], reset_num_timesteps=(total == 0))
            total += timesteps
    else:
        log.info(f"Training PPO for {cfg['total_timesteps']} timesteps...")
        model.learn(total_timesteps=cfg["total_timesteps"], callback=[eval_callback, checkpoint_callback])

    model.save(f"{model_save_path}/ppo_final")
    log.info(f"Model saved to {model_save_path}/ppo_final")

    # Save hyperparams used
    with open(f"{model_save_path}/hyperparams.json", "w") as f:
        json.dump({"hyperparams": hp, "train_config": cfg}, f, indent=2)

    return model


def evaluate(model, test_df: pd.DataFrame, reward_mode: str = "pnl") -> dict:
    """Evaluate trained model on test data."""
    env = create_env(test_df, reward_mode)
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
    parser.add_argument("--data", type=str, default="data/data/14366_1min.csv", help="Path to OHLCV CSV")
    parser.add_argument("--timesteps", type=int, default=100_000, help="Total training timesteps")
    parser.add_argument("--lr", type=float, default=3e-4, help="Learning rate")
    parser.add_argument("--reward-mode", type=str, default="pnl", choices=REWARD_MODES, help="Reward function")
    parser.add_argument("--curriculum", action="store_true", help="Use curriculum learning")
    parser.add_argument("--save-path", type=str, default="models/ppo_baseline", help="Model save path")
    args = parser.parse_args()

    train_df, val_df, test_df = prepare_data(args.data)

    hyperparams = {"learning_rate": args.lr, "reward_mode": args.reward_mode}
    train_config = {"total_timesteps": args.timesteps}

    model = train_ppo(
        train_df, val_df,
        hyperparams=hyperparams,
        train_config=train_config,
        model_save_path=args.save_path,
        use_curriculum=args.curriculum,
    )

    if model:
        metrics = evaluate(model, test_df, args.reward_mode)
        save_results(metrics, f"{args.save_path}/results.json")

import pandas as pd
import numpy as np
import yaml
from pathlib import Path
from typing import List, Optional


def compute_sma(df: pd.DataFrame, period: int, col: str = "close") -> pd.Series:
    return df[col].rolling(window=period, min_periods=1).mean()


def compute_ema(df: pd.DataFrame, period: int, col: str = "close") -> pd.Series:
    return df[col].ewm(span=period, adjust=False).mean()


def compute_rsi(df: pd.DataFrame, period: int = 14, col: str = "close") -> pd.Series:
    delta = df[col].diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.rolling(window=period, min_periods=1).mean()
    avg_loss = loss.rolling(window=period, min_periods=1).mean()
    rs = avg_gain / avg_loss.replace(0, np.nan)
    return 100 - (100 / (1 + rs))


def compute_macd(
    df: pd.DataFrame,
    fast: int = 12,
    slow: int = 26,
    signal: int = 9,
    col: str = "close",
) -> tuple:
    ema_fast = df[col].ewm(span=fast, adjust=False).mean()
    ema_slow = df[col].ewm(span=slow, adjust=False).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()
    histogram = macd_line - signal_line
    return macd_line, signal_line, histogram


def compute_bollinger_bands(
    df: pd.DataFrame, period: int = 20, std_dev: float = 2.0, col: str = "close"
) -> tuple:
    middle = df[col].rolling(window=period, min_periods=1).mean()
    std = df[col].rolling(window=period, min_periods=1).std()
    upper = middle + std_dev * std
    lower = middle - std_dev * std
    return upper, middle, lower


def compute_atr(
    df: pd.DataFrame, period: int = 14, col: str = "close"
) -> pd.Series:
    high = df["high"]
    low = df["low"]
    prev_close = df[col].shift(1)
    tr = pd.concat(
        [high - low, (high - prev_close).abs(), (low - prev_close).abs()], axis=1
    ).max(axis=1)
    return tr.rolling(window=period, min_periods=1).mean()


def compute_obv(df: pd.DataFrame) -> pd.Series:
    obv = [0]
    for i in range(1, len(df)):
        if df["close"].iloc[i] > df["close"].iloc[i - 1]:
            obv.append(obv[-1] + df["volume"].iloc[i])
        elif df["close"].iloc[i] < df["close"].iloc[i - 1]:
            obv.append(obv[-1] - df["volume"].iloc[i])
        else:
            obv.append(obv[-1])
    return pd.Series(obv, index=df.index, name="obv")


def compute_vwap(df: pd.DataFrame) -> pd.Series:
    typical = (df["high"] + df["low"] + df["close"]) / 3
    cumulative_tp_vol = (typical * df["volume"]).cumsum()
    cumulative_vol = df["volume"].cumsum()
    return cumulative_tp_vol / cumulative_vol.replace(0, np.nan)


def compute_stochastic(
    df: pd.DataFrame, k_period: int = 14, d_period: int = 3
) -> tuple:
    low_min = df["low"].rolling(window=k_period, min_periods=1).min()
    high_max = df["high"].rolling(window=k_period, min_periods=1).max()
    k = 100 * (df["close"] - low_min) / (high_max - low_min).replace(0, np.nan)
    d = k.rolling(window=d_period, min_periods=1).mean()
    return k, d


def compute_adx(df: pd.DataFrame, period: int = 14) -> pd.Series:
    plus_dm = df["high"].diff().clip(lower=0)
    minus_dm = (-df["low"].diff()).clip(lower=0)
    atr = compute_atr(df, period)
    plus_di = 100 * (plus_dm.rolling(window=period, min_periods=1).mean() / atr)
    minus_di = 100 * (minus_dm.rolling(window=period, min_periods=1).mean() / atr)
    dx = 100 * (plus_di - minus_di).abs() / (plus_di + minus_di).replace(0, np.nan)
    return dx.rolling(window=period, min_periods=1).mean()


def add_lag_features(
    df: pd.DataFrame, columns: List[str], lags: List[int] = None
) -> pd.DataFrame:
    if lags is None:
        lags = [1, 3, 5]
    for col in columns:
        for lag in lags:
            df[f"{col}_lag{lag}"] = df[col].shift(lag)
    return df


def add_time_features(df: pd.DataFrame) -> pd.DataFrame:
    if "timestamp" in df.columns:
        ts = pd.to_datetime(df["timestamp"])
    elif "date" in df.columns:
        ts = pd.to_datetime(df["date"])
    else:
        ts = df.index if isinstance(df.index, pd.DatetimeIndex) else pd.to_datetime(df.index)
    df["hour"] = ts.dt.hour
    df["day_of_week"] = ts.dt.dayofweek
    df["is_market_open"] = ((df["hour"] >= 9) & (df["hour"] < 15)).astype(int)
    return df


def add_label(
    df: pd.DataFrame, horizon: int = 5, threshold: float = 0.001
) -> pd.DataFrame:
    future_return = df["close"].pct_change(horizon).shift(-horizon)
    df["label"] = 0
    df.loc[future_return > threshold, "label"] = 1
    df.loc[future_return < -threshold, "label"] = -1
    return df


def add_risk_adjusted_label(
    df: pd.DataFrame, horizon: int = 20, min_sharpe: float = 0.5
) -> pd.DataFrame:
    rolling_return = df["close"].pct_change(horizon).shift(-horizon)
    rolling_std = df["close"].pct_change().rolling(horizon).std()
    rolling_sharpe = (rolling_return / rolling_std.replace(0, np.nan)) * np.sqrt(252)
    df["risk_label"] = 0
    df.loc[rolling_sharpe > min_sharpe, "risk_label"] = 1
    df.loc[rolling_sharpe < -min_sharpe, "risk_label"] = -1
    return df


def export_parquet(df: pd.DataFrame, output_path: str) -> None:
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    df.to_parquet(output_path, index=False, engine="pyarrow")
    print(f"Exported {len(df)} rows to {output_path}")


def load_config(config_path: str = None) -> dict:
    if config_path is None:
        config_path = Path(__file__).parent / "feature_config.yaml"
    if not Path(config_path).exists():
        return get_default_config()
    with open(config_path, "r") as f:
        return yaml.safe_load(f)


def get_default_config() -> dict:
    return {
        "sma_periods": [10, 20, 50],
        "ema_periods": [12, 26],
        "rsi_period": 14,
        "macd": {"fast": 12, "slow": 26, "signal": 9},
        "bollinger": {"period": 20, "std_dev": 2.0},
        "atr_period": 14,
        "stochastic": {"k_period": 14, "d_period": 3},
        "adx_period": 14,
        "lag_periods": [1, 3, 5],
        "label_horizon": 5,
        "label_threshold": 0.001,
        "risk_label_horizon": 20,
        "risk_min_sharpe": 0.5,
        "normalization": "zscore",
        "train_ratio": 0.7,
        "val_ratio": 0.15,
    }


def normalize_features(
    df: pd.DataFrame, columns: Optional[List[str]] = None, method: str = "zscore"
) -> pd.DataFrame:
    if columns is None:
        columns = df.select_dtypes(include=[np.number]).columns.tolist()
    for col in columns:
        if method == "zscore":
            mean = df[col].mean()
            std = df[col].std()
            df[f"{col}_norm"] = (df[col] - mean) / std if std > 0 else 0
        elif method == "minmax":
            min_val = df[col].min()
            max_val = df[col].max()
            df[f"{col}_norm"] = (df[col] - min_val) / (max_val - min_val) if max_val > min_val else 0
    return df


def time_split(df: pd.DataFrame, train_ratio: float = 0.7, val_ratio: float = 0.15):
    n = len(df)
    train_end = int(n * train_ratio)
    val_end = int(n * (train_ratio + val_ratio))
    return df.iloc[:train_end], df.iloc[train_end:val_end], df.iloc[val_end:]


def engineer_features(
    df: pd.DataFrame,
    include_lags: bool = True,
    include_time: bool = True,
    include_labels: bool = True,
    include_risk_labels: bool = False,
    normalize: bool = True,
    config: dict = None,
) -> pd.DataFrame:
    if config is None:
        config = get_default_config()
    df = df.copy()

    # Technical indicators
    for period in config.get("sma_periods", [10, 20, 50]):
        df[f"sma_{period}"] = compute_sma(df, period)
    for period in config.get("ema_periods", [12, 26]):
        df[f"ema_{period}"] = compute_ema(df, period)
    df["rsi"] = compute_rsi(df, config.get("rsi_period", 14))
    macd_cfg = config.get("macd", {})
    df["macd"], df["macd_signal"], df["macd_hist"] = compute_macd(
        df, macd_cfg.get("fast", 12), macd_cfg.get("slow", 26), macd_cfg.get("signal", 9)
    )
    bb_cfg = config.get("bollinger", {})
    df["bb_upper"], df["bb_middle"], df["bb_lower"] = compute_bollinger_bands(
        df, bb_cfg.get("period", 20), bb_cfg.get("std_dev", 2.0)
    )
    df["atr"] = compute_atr(df, config.get("atr_period", 14))
    df["obv"] = compute_obv(df)
    df["vwap"] = compute_vwap(df)
    stoch_cfg = config.get("stochastic", {})
    df["stoch_k"], df["stoch_d"] = compute_stochastic(
        df, stoch_cfg.get("k_period", 14), stoch_cfg.get("d_period", 3)
    )
    df["adx"] = compute_adx(df, config.get("adx_period", 14))

    # Price-based features
    df["returns"] = df["close"].pct_change()
    df["log_returns"] = np.log(df["close"] / df["close"].shift(1))
    df["volatility_10"] = df["returns"].rolling(10).std()
    df["volatility_20"] = df["returns"].rolling(20).std()

    if include_lags:
        df = add_lag_features(df, ["close", "volume", "returns", "rsi"],
                              config.get("lag_periods", [1, 3, 5]))

    if include_time:
        df = add_time_features(df)

    if include_labels:
        df = add_label(df, config.get("label_horizon", 5),
                       config.get("label_threshold", 0.001))

    if include_risk_labels:
        df = add_risk_adjusted_label(df, config.get("risk_label_horizon", 20),
                                     config.get("risk_min_sharpe", 0.5))

    if normalize:
        skip = ["label", "risk_label", "hour", "day_of_week", "is_market_open"]
        feature_cols = [c for c in df.select_dtypes(include=[np.number]).columns
                       if c not in skip]
        df = normalize_features(df, feature_cols, config.get("normalization", "zscore"))

    df = df.dropna()
    return df

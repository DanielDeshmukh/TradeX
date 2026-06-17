import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))


class TestFeatureEngineering:
    """Tests for feature_engineering.py"""

    def test_import_feature_engineering(self):
        from feature_engineering import compute_features
        assert callable(compute_features)

    def test_feature_config_loads(self):
        import yaml
        config_path = os.path.join(os.path.dirname(__file__), "feature_config.yaml")
        assert os.path.exists(config_path)
        with open(config_path) as f:
            config = yaml.safe_load(f)
        assert "features" in config or "indicators" in config


class TestDatabaseOperations:
    """Tests for db.py database operations"""

    def test_import_database(self):
        from db import get_connection
        assert callable(get_connection)

    def test_database_connection(self):
        from db import get_connection
        try:
            conn = get_connection()
            assert conn is not None
            conn.close()
        except Exception:
            pytest.skip("Database not available")


class TestSignalEngine:
    """Tests for signal_engine.py"""

    def test_import_signal_engine(self):
        from signal_engine import generate_signals
        assert callable(generate_signals)


class TestEvaluation:
    """Tests for evaluation.py"""

    def test_import_evaluation(self):
        from evaluation import calculate_metrics
        assert callable(calculate_metrics)

    def test_calculate_returns(self):
        import pandas as pd
        import numpy as np
        prices = pd.Series([100, 105, 103, 110, 108])
        returns = prices.pct_change().dropna()
        assert len(returns) == 4
        assert returns.iloc[0] == 0.05


class TestBacktester:
    """Tests for backtester.py"""

    def test_import_backtester(self):
        from backtester import Backtester
        assert callable(Backtester)


class TestEnsemble:
    """Tests for ensemble.py"""

    def test_import_ensemble(self):
        from ensemble import EnsemblePredictor
        assert callable(EnsemblePredictor)


class TestSchema:
    """Tests for schema.sql"""

    def test_schema_file_exists(self):
        schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")
        assert os.path.exists(schema_path)

    def test_schema_has_required_tables(self):
        schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")
        with open(schema_path) as f:
            schema = f.read()
        required_tables = ["candles", "master_symbols", "trading_signals", "features"]
        for table in required_tables:
            assert table in schema, f"Table {table} not found in schema"

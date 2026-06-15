import pandas as pd
import os
import sys
import dotenv

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from db import upsert_master_symbols, init_db

dotenv.load_dotenv()

CSV_PATH = "master_symbols_trimmed.csv"

df = pd.read_csv(CSV_PATH)
required_columns = ["display_name", "symbol_name", "exchange_id", "instrument", "underlying_symbol", "security_id"]
df = df[required_columns]

print("Columns in CSV:", df.columns.tolist())
print(f"First 5 rows:\n{df.head()}")

init_db()

symbols = df.to_dict(orient="records")
inserted = upsert_master_symbols(symbols)
print(f"Inserted {inserted} symbols to PostgreSQL")

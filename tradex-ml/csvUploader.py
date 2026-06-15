import pandas as pd
from supabase import create_client, Client
import os
import dotenv

dotenv.load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
CSV_PATH = "master_symbols_trimmed.csv"
TABLE_NAME = "master_symbols"
CHUNK_SIZE = 500
SKIPPED_CSV = "skipped_rows.csv"

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

df = pd.read_csv(CSV_PATH)
required_columns = ["display_name", "symbol_name", "exchange_id", "instrument", "underlying_symbol", "security_id"]
df = df[required_columns]

print("Columns in CSV:", df.columns)
print("First 5 rows:\n", df.head())

inserted_count = 0
skipped_rows = []

for i in range(0, len(df), CHUNK_SIZE):
    chunk = df.iloc[i:i+CHUNK_SIZE]
    existing = supabase.table(TABLE_NAME).select("security_id").in_("security_id", chunk["security_id"].tolist()).execute()
    existing_ids = [r["security_id"] for r in existing.data] if existing.data else []

    filtered_chunk = chunk[~chunk["security_id"].isin(existing_ids)].to_dict(orient="records")
    duplicates = chunk[chunk["security_id"].isin(existing_ids)]

    if not filtered_chunk:
        print(f"All rows in chunk {i}-{i+CHUNK_SIZE} already exist. Skipping.")
        skipped_rows.append(duplicates)
        continue

    response = supabase.table(TABLE_NAME).insert(filtered_chunk).execute()

    if getattr(response, "data", None) is None:
        print(f"Failed to insert chunk {i}-{i+CHUNK_SIZE}: {response}")
        skipped_rows.append(chunk)
    else:
        inserted_count += len(filtered_chunk)
        print(f"Inserted {len(filtered_chunk)} rows from chunk {i}-{i+CHUNK_SIZE}")
        if not duplicates.empty:
            skipped_rows.append(duplicates)

if skipped_rows:
    skipped_df = pd.concat(skipped_rows)
    skipped_df.to_csv(SKIPPED_CSV, index=False)
    print(f"Skipped {len(skipped_df)} duplicate rows saved to {SKIPPED_CSV}")

print(f"CSV upload completed. Total inserted rows: {inserted_count}")

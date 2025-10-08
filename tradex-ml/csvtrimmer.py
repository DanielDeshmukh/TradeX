import pandas as pd

input_csv = "full_masterlist.csv"
output_csv = "master_symbols_trimmed.csv"

# Columns mapping: New Table Column -> Source CSV Column
columns_mapping = {
    "display_name": "DISPLAY_NAME",
    "symbol_name": "SYMBOL_NAME",
    "exchange_id": "EXCH_ID",
    "instrument": "INSTRUMENT",
    "underlying_symbol": "UNDERLYING_SYMBOL",
    "security_id": "SECURITY_ID"
}

# Load CSV without assuming separator
df = pd.read_csv(input_csv)  # pandas will auto-detect comma or tab

# Strip whitespace from column names and make uppercase for consistency
df.columns = df.columns.str.strip().str.upper()

# Make sure all needed columns exist
missing_cols = [v for v in columns_mapping.values() if v.upper() not in df.columns]
if missing_cols:
    raise ValueError(f"Missing columns in CSV: {missing_cols}")

# Keep only necessary columns and rename them
trimmed_df = df[[v.upper() for v in columns_mapping.values()]].rename(columns={v.upper(): k for k, v in columns_mapping.items()})

# Drop rows with missing mandatory fields
trimmed_df.dropna(subset=["display_name", "symbol_name", "exchange_id", "instrument", "security_id"], inplace=True)

# Ensure security_id is integer
trimmed_df["security_id"] = trimmed_df["security_id"].astype(int)

# Save trimmed CSV
trimmed_df.to_csv(output_csv, index=False)

print(f"Trimmed CSV saved to: {output_csv}")

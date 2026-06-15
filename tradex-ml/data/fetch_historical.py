from dhanhq import dhanhq, DhanContext
import pandas as pd
import dotenv
import os
import json
import logging
import requests
import datetime
import time
from typing import List, Dict, Any

sys_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
import sys
sys.path.insert(0, sys_path)
from db import upsert_candles, count_candles, init_db

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger(__name__)

dotenv.load_dotenv()

CLIENT_ID = os.getenv("DHAN_CLIENT_ID")
ACCESS_TOKEN = os.getenv("DHAN_ACCESS_TOKEN")

if not CLIENT_ID or not ACCESS_TOKEN:
    raise ValueError("Missing Dhan credentials. Check your .env file!")

dhan_context = DhanContext(client_id=CLIENT_ID, access_token=ACCESS_TOKEN)
dhan = dhanhq(dhan_context)

# =====================================================
#  FETCH WISHLIST FROM SUPABASE
# =====================================================
def fetch_wishlist_from_supabase(user_id: str) -> List[Dict[str, Any]]:
    log.warning("Supabase wishlist fetch disabled. Use local security IDs instead.")
    return []

# =====================================================
#  CLEAN SECURITY IDS
# =====================================================
def clean_security_ids(wishlist_data: List[Dict[str, Any]]) -> List[str]:
    return [
        str(item["security_id"])
        for item in wishlist_data
        if item.get("exchange_segment") == "NSE" and item.get("instrument_type") == "EQUITY"
    ]



# =====================================================
#  FETCH AND SAVE HISTORICAL DATA (per-security loop)
# =====================================================
def fetch_and_save_loop(security_id: str, interval="1min", batch_days=90, max_retries=3) -> bool:
    today = datetime.datetime.now().date()
    from_date = today - datetime.timedelta(days=batch_days)
    success = True

    while from_date < today:
        to_date = min(from_date + datetime.timedelta(days=batch_days), today)
        from_date_str, to_date_str = from_date.strftime("%Y-%m-%d"), to_date.strftime("%Y-%m-%d")

        log.info(f"Fetching {interval} data for Security ID {security_id} [{from_date_str} to {to_date_str}]")

        existing_count = count_candles(security_id, interval, f"{from_date_str}T00:00:00", f"{from_date_str}T23:59:59")

        if existing_count >= 20000:
            log.info(f"Existing data sufficient ({existing_count} records). Skipping batch.")
            from_date = to_date
            continue

        response = None
        for attempt in range(1, max_retries + 1):
            try:
                response = dhan.intraday_minute_data(
                    security_id=security_id,
                    exchange_segment="NSE_EQ",
                    instrument_type="EQUITY",
                    from_date=from_date_str,
                    to_date=to_date_str
                )
                break
            except Exception as e:
                log.warning(f"Attempt {attempt}/{max_retries} failed for {security_id}: {e}")
                if attempt < max_retries:
                    time.sleep(2 ** attempt)
                else:
                    log.error(f"All retries exhausted for {security_id} [{from_date_str}-{to_date_str}]")
                    success = False

        if not response or response.get("status") != "success" or not response.get("data"):
            log.warning(f"No data returned for {security_id} [{from_date_str}-{to_date_str}]")
            success = False
            from_date = to_date
            continue

        data = response.get("data")
        df = pd.DataFrame.from_dict(data, orient="index") if isinstance(data, dict) else pd.DataFrame(data)
        df.reset_index(inplace=True)
        os.makedirs("data", exist_ok=True)
        json_path, csv_path = f"data/{security_id}_{interval}.json", f"data/{security_id}_{interval}.csv"
        with open(json_path, "w") as f: json.dump(response, f, indent=4)
        df.to_csv(csv_path, index=False)

        log.info(f"Saved {len(df)} records for {security_id} [{from_date_str}-{to_date_str}]")
        from_date = to_date

    return success

# =====================================================
#  INSERT CANDLES TO SUPABASE
# =====================================================
def insert_candles_to_supabase(security_id: str, interval="1min") -> bool:
    try:
        json_path = f"data/{security_id}_{interval}.json"
        if not os.path.exists(json_path): return False

        with open(json_path) as f: data = json.load(f).get("data", {})
        if not data: return False

        first_field = list(data.values())[0]
        candles = []

        if isinstance(first_field, dict):
            for ts in list(first_field.keys()):
                ts_float = float(ts)
                unit = "ms" if ts_float > 1e10 else "s"
                iso_ts = pd.to_datetime(ts_float, unit=unit).isoformat()
                candles.append({
                    "security_id": security_id,
                    "timeframe": interval,
                    "timestamp": iso_ts,
                    "open": float(data.get("open", {}).get(ts, 0)),
                    "high": float(data.get("high", {}).get(ts, 0)),
                    "low": float(data.get("low", {}).get(ts, 0)),
                    "close": float(data.get("close", {}).get(ts, 0)),
                    "volume": int(float(data.get("volume", {}).get(ts, 0)))
                })
        elif isinstance(first_field, list):
            timestamps = data.get("timestamp", [])
            for i, ts in enumerate(timestamps):
                ts_float = float(ts)
                unit = "ms" if ts_float > 1e10 else "s"
                iso_ts = pd.to_datetime(ts_float, unit=unit).isoformat()
                candles.append({
                    "security_id": security_id,
                    "timeframe": interval,
                    "timestamp": iso_ts,
                    "open": float(data["open"][i]),
                    "high": float(data["high"][i]),
                    "low": float(data["low"][i]),
                    "close": float(data["close"][i]),
                    "volume": int(float(data["volume"][i]))
                })
        else:
            print("Unexpected data format."); return False

        inserted = upsert_candles(candles)
        print(f"Inserted {inserted} candles for {security_id}")
        return True

    except Exception as e:
        print(f"Insert error for {security_id}: {e}")
        return False

# =====================================================
#  MAIN EXECUTION FLOW
# =====================================================
if __name__ == "__main__":
    log.info("=== STARTING HISTORICAL DATA SYNC ===")
    try:
        init_db()
        log.info("Database initialized")
    except Exception as e:
        log.error(f"Database init failed: {e}")
        exit(1)

    security_ids = ["14366", "17963", "2277", "3456", "3499"]
    log.info(f"Using local security IDs: {security_ids}")

    success, skipped, failed = 0, 0, 0
    for idx, sec_id in enumerate(security_ids, 1):
        log.info(f"Processing {idx}/{len(security_ids)}: {sec_id}")
        fetched = fetch_and_save_loop(sec_id)
        if not fetched: log.warning(f"Fetch failed for {sec_id}"); failed += 1; continue

        inserted = insert_candles_to_supabase(sec_id)
        success += 1 if inserted else 0
        failed += 0 if inserted else 1

    log.info(f"=== SYNC COMPLETED === Success: {success} | Failed: {failed}")

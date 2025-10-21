from dhanhq import dhanhq, DhanContext
from supabase import create_client, Client
import pandas as pd
import dotenv
import os
import json
import logging
import requests
import datetime
from typing import List, Dict, Any

# =====================================================
#  LOAD ENVIRONMENT VARIABLES
# =====================================================
dotenv.load_dotenv()

CLIENT_ID = os.getenv("DHAN_CLIENT_ID")
ACCESS_TOKEN = os.getenv("DHAN_ACCESS_TOKEN")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
DEFAULT_USER_ID = os.getenv("SUPABASE_DEFAULT_USER_ID")
EDGE_FUNCTION_WISHLIST_URL = "https://pqrnxozftaccuamdaavi.supabase.co/functions/v1/wishlist"

if not CLIENT_ID or not ACCESS_TOKEN:
    raise ValueError("Missing Dhan credentials. Check your .env file!")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials. Check your .env file!")

# =====================================================
#  INITIALIZE DHAN CONTEXT AND SUPABASE CLIENT
# =====================================================
dhan_context = DhanContext(client_id=CLIENT_ID, access_token=ACCESS_TOKEN)
dhan = dhanhq(dhan_context)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# =====================================================
#  FETCH WISHLIST FROM SUPABASE
# =====================================================
def fetch_wishlist_from_supabase(user_id: str) -> List[Dict[str, Any]]:
    headers = {"Authorization": f"Bearer {SUPABASE_KEY}", "Content-Type": "application/json"}
    payload = {"user_id": user_id, "action": "fetch"}
    try:
        resp = requests.post(EDGE_FUNCTION_WISHLIST_URL, headers=headers, json=payload, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        return data.get("wishlist", []) if isinstance(data.get("wishlist"), list) else []
    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching wishlist: {e}")
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
def fetch_and_save_loop(security_id: str, interval="1min", batch_days=90) -> bool:
    today = datetime.datetime.now().date()
    from_date = today - datetime.timedelta(days=batch_days)
    success = True

    while from_date < today:
        to_date = min(from_date + datetime.timedelta(days=batch_days), today)
        from_date_str, to_date_str = from_date.strftime("%Y-%m-%d"), to_date.strftime("%Y-%m-%d")

        print(f"\nFetching {interval} data for Security ID {security_id}")
        print(f"[DATE RANGE] FROM: {from_date_str} TO: {to_date_str}")

        existing_data = supabase.table("candles")\
            .select("timestamp", count="exact")\
            .eq("security_id", security_id)\
            .eq("timeframe", interval)\
            .gte("timestamp", f"{from_date_str}T00:00:00")\
            .lte("timestamp", f"{to_date_str}T23:59:59")\
            .execute()
        existing_count = getattr(existing_data, "count", 0)

        if existing_count >= 20000:
            print(f"Existing data sufficient ({existing_count} records). Skipping this batch.")
            from_date = to_date  
            continue

        try:
            response = dhan.intraday_minute_data(
                security_id=security_id,
                exchange_segment="NSE_EQ",
                instrument_type="EQUITY",
                from_date=from_date_str,
                to_date=to_date_str
            )
        except Exception as e:
            print(f"Fetch error for {security_id} [{from_date_str} - {to_date_str}]: {e}")
            success = False
            from_date = to_date
            continue

        if not response or response.get("status") != "success" or not response.get("data"):
            print(f"No data returned for {security_id} [{from_date_str} - {to_date_str}]")
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

        print(f"Saved {len(df)} records for {security_id} [{from_date_str} - {to_date_str}]")
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

        batch_size = 1000
        for i in range(0, len(candles), batch_size):
            supabase.table("candles").upsert(candles[i:i+batch_size], on_conflict="security_id,timeframe,timestamp").execute()
        print(f"Inserted {len(candles)} candles for {security_id}")
        return True

    except Exception as e:
        print(f"Insert error for {security_id}: {e}")
        return False

# =====================================================
#  MAIN EXECUTION FLOW
# =====================================================
if __name__ == "__main__":
    print("\n=== STARTING HISTORICAL DATA SYNC ===")
    wishlist = fetch_wishlist_from_supabase(DEFAULT_USER_ID)
    if not wishlist: print("No wishlist found. Exiting."); exit()
    security_ids = clean_security_ids(wishlist)
    if not security_ids: print("No NSE EQUITY IDs. Exiting."); exit()

    success, skipped, failed = 0, 0, 0
    for idx, sec_id in enumerate(security_ids, 1):
        print(f"\nProcessing {idx}/{len(security_ids)}: {sec_id}")
        fetched = fetch_and_save_loop(sec_id)
        if not fetched: print(f"Fetch failed for {sec_id}"); failed += 1; continue

        inserted = insert_candles_to_supabase(sec_id)
        success += 1 if inserted else 0
        failed += 0 if inserted else 1

    print(f"\n=== SYNC COMPLETED ===\nSuccess: {success} | Failed: {failed}")

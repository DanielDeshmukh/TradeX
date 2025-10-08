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
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
DEFAULT_USER_ID = os.getenv("SUPABASE_DEFAULT_USER_ID")
EDGE_FUNCTION_WISHLIST_URL = "https://pqrnxozftaccuamdaavi.supabase.co/functions/v1/wishlist"

if not CLIENT_ID or not ACCESS_TOKEN:
    raise ValueError("Missing Dhan credentials. Check your .env file!")

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    raise ValueError("Missing Supabase credentials. Check your .env file!")


# =====================================================
#  INITIALIZE DHAN CONTEXT AND SUPABASE CLIENT
# =====================================================
dhan_context = DhanContext(client_id=CLIENT_ID, access_token=ACCESS_TOKEN)
dhan = dhanhq(dhan_context)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# =====================================================
#  FUNCTION — FETCH WISHLIST FROM SUPABASE
# =====================================================
def fetch_wishlist_from_supabase(user_id: str) -> List[Dict[str, Any]]:
    """
    Fetches the user's wishlist from the Supabase Edge Function.
    """
    if not SUPABASE_KEY:
        logging.error("SUPABASE_SERVICE_KEY is missing. Cannot authenticate Edge Function call.")
        return []

    logging.info(f"Attempting to fetch wishlist for user: {user_id.split('-')[0]}...")
    headers = {
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    payload = {"user_id": user_id, "action": "fetch"}

    try:
        response = requests.post(EDGE_FUNCTION_WISHLIST_URL, headers=headers, json=payload, timeout=15)
        response.raise_for_status()
        response_data = response.json()

        if "wishlist" in response_data and isinstance(response_data["wishlist"], list):
            wishlist = response_data["wishlist"]
            logging.info(f"Successfully fetched {len(wishlist)} items from Supabase.")
            return wishlist

        elif "error" in response_data:
            logging.error(f"Edge Function returned an error: {response_data['error']}")
        else:
            logging.warning("Edge Function returned an unexpected empty or non-list response.")
        return []

    except requests.exceptions.RequestException as e:
        logging.critical(f"A critical error occurred while calling the Supabase Edge Function: {e}")
        return []

# =====================================================
#  FUNCTION — CLEAN SECURITY IDS
# =====================================================
def clean_security_ids(wishlist_data: List[Dict[str, Any]]) -> List[str]:
    """
    Filters wishlist to return only NSE EQUITY security IDs.
    """
    cleaned_sid_list = []
    for item in wishlist_data:
        print(f"{item.get('display_name')} {item.get('instrument_type')} ({item.get('exchange_segment')}): {item.get('security_id')}")
        if item.get('exchange_segment') == 'NSE' and item.get('instrument_type') == 'EQUITY':
            cleaned_sid_list.append(str(item.get('security_id')))
    print("Cleaned SID List:", cleaned_sid_list)
    return cleaned_sid_list

# =====================================================
#  FUNCTION — FETCH AND SAVE HISTORICAL DATA
# =====================================================
def fetch_and_save_(security_id: str, interval="1min"):
    """
    Fetch historical data from Dhan API and save to CSV/JSON.
    Automatically fetches last 3 months of data, checks for existing data.
    """
    try:
        # Calculate dynamic date range (last 3 months)
        to_date = datetime.datetime.now().date()
        from_date = to_date - datetime.timedelta(days=90)  # Changed from 30 to 90
        
        # Format dates as YYYY-MM-DD
        from_date_str = from_date.strftime("%Y-%m-%d")
        to_date_str = to_date.strftime("%Y-%m-%d")
        
        print(f"\nFetching {interval} data for Security ID {security_id} (NSE_EQ)...")
        print(f"Date range: {from_date_str} to {to_date_str}")
        
        # Check if data already exists in this date range
        existing_data = supabase.table("candles")\
            .select("timestamp", count="exact")\
            .eq("security_id", str(security_id))\
            .eq("timeframe", interval)\
            .gte("timestamp", f"{from_date_str}T00:00:00")\
            .lte("timestamp", f"{to_date_str}T23:59:59")\
            .execute()
        
        existing_count = existing_data.count if hasattr(existing_data, 'count') else 0
        
        if existing_count > 0:
            print(f"Found {existing_count} existing candles in this date range.")
            
            expected_min_candles = 20000  
            if existing_count >= expected_min_candles:
                print(f"Data looks complete ({existing_count} candles). Skipping fetch to save API calls.")
                return True
            else:
                print(f"Will fetch fresh data and upsert (update/insert as needed).")
        
        response = dhan.intraday_minute_data(
            security_id=security_id,
            exchange_segment="NSE_EQ",
            instrument_type="EQUITY",
            from_date=from_date_str,
            to_date=to_date_str
        )

        if not response or response.get("status") != "success":
            print(f"Failed to fetch data for {security_id}: {response}")
            return False

        data = response.get("data", {})
        if not data:
            print(f"No data found for Security ID {security_id}.")
            return False

        if isinstance(data, dict):
            df = pd.DataFrame.from_dict(data, orient="index")
            df.index.name = "datetime"
            df.reset_index(inplace=True)
        elif isinstance(data, list):
            df = pd.DataFrame(data)
        else:
            print(f"Unexpected data format for {security_id}: {type(data)}")
            return False

        os.makedirs("data", exist_ok=True)
        json_path = f"data/{security_id}_{interval}.json"
        csv_path = f"data/{security_id}_{interval}.csv"

        with open(json_path, "w") as f:
            json.dump(response, f, indent=4)
        df.to_csv(csv_path, index=False)

        print(f"Saved {security_id}: {len(df)} records ({from_date_str} to {to_date_str})")
        return True
        
    except Exception as e:
        print(f"Error fetching data for {security_id}: {e}")
        return False

# =====================================================
#  FUNCTION — INSERT CANDLES TO SUPABASE
# =====================================================

def insert_candles_to_supabase(security_id: str, interval="1min"):
    """
    Reads saved CSV file and inserts candle data into Supabase 'candles' table.
    """
    csv_path = f"data/{security_id}_{interval}.csv"
    json_path = f"data/{security_id}_{interval}.json"
    
    try:
        if not os.path.exists(json_path):
            print(f"JSON file not found: {json_path}")
            return False
        
        with open(json_path, "r") as f:
            response = json.load(f)
        
        data = response.get("data", {})
        if not data:
            print(f"No data in JSON for {security_id}")
            return False
        
        print(f"DEBUG: Data type = {type(data)}")
        print(f"DEBUG: First 3 keys = {list(data.keys())[:3] if isinstance(data, dict) else 'not a dict'}")
        
        if isinstance(data, dict):
            field_names = list(data.keys())
            print(f"DEBUG: Fields in data = {field_names}")
            
            first_field = list(data.values())[0]
            print(f"DEBUG: First field type = {type(first_field)}")
            
            if isinstance(first_field, dict):
                timestamps = list(first_field.keys())
                print(f"DEBUG: First 3 timestamps = {timestamps[:3]}")
                
                candles_to_insert = []
                for ts in timestamps:
                    ts_float = float(ts)
                    unit = 'ms' if ts_float > 10_000_000_000 else 's'
                    timestamp_iso = pd.to_datetime(ts_float, unit=unit).isoformat()
                    
                    candle = {
                        "security_id": str(security_id),
                        "timeframe": interval,
                        "timestamp": timestamp_iso,
                        "open": float(data.get("open", {}).get(ts, 0)),
                        "high": float(data.get("high", {}).get(ts, 0)),
                        "low": float(data.get("low", {}).get(ts, 0)),
                        "close": float(data.get("close", {}).get(ts, 0)),
                        "volume": int(float(data.get("volume", {}).get(ts, 0)))
                    }
                    candles_to_insert.append(candle)
            
            elif isinstance(first_field, list):
                timestamps = data.get("timestamp", [])
                print(f"DEBUG: First 3 timestamps = {timestamps[:3]}")
                
                candles_to_insert = []
                for i, ts in enumerate(timestamps):
                    ts_float = float(ts)
                    unit = 'ms' if ts_float > 10_000_000_000 else 's'
                    timestamp_iso = pd.to_datetime(ts_float, unit=unit).isoformat()
                    
                    candle = {
                        "security_id": str(security_id),
                        "timeframe": interval,
                        "timestamp": timestamp_iso,
                        "open": float(data["open"][i]),
                        "high": float(data["high"][i]),
                        "low": float(data["low"][i]),
                        "close": float(data["close"][i]),
                        "volume": int(float(data["volume"][i]))
                    }
                    candles_to_insert.append(candle)
            
            else:
                print(f"Unexpected data structure")
                return False
            
            print(f"Processing {len(candles_to_insert)} candles for {security_id}...")
            print(f"First candle: {candles_to_insert[0]['timestamp']}")
            print(f"Last candle: {candles_to_insert[-1]['timestamp']}")
            
            # Insert in batches
            batch_size = 1000
            total_inserted = 0
            
            for i in range(0, len(candles_to_insert), batch_size):
                batch = candles_to_insert[i:i+batch_size]
                try:
                    result = supabase.table("candles").upsert(
                        batch,
                        on_conflict="security_id,timeframe,timestamp"
                    ).execute()
                    total_inserted += len(batch)
                    print(f"Batch {i//batch_size + 1}: Processed {len(batch)} candles")
                except Exception as e:
                    print(f"Error in batch {i//batch_size + 1}: {e}")
                    continue
            
            print(f"Completed: {total_inserted}/{len(candles_to_insert)} candles\n")
            return True
        
    except Exception as e:
        print(f"Error: {e}\n")
        import traceback
        traceback.print_exc()
        return False



# =====================================================
#  MAIN EXECUTION FLOW
# =====================================================
if __name__ == "__main__":
    print("\n" + "="*60)
    print("STARTING HISTORICAL DATA SYNC")
    print(f"Date: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60 + "\n")
    
    wishlist_data = fetch_wishlist_from_supabase(DEFAULT_USER_ID)

    if not wishlist_data:
        print("No wishlist data found. Exiting.")
        exit()

    cleaned_sid_list = clean_security_ids(wishlist_data)
    
    print(f"\n{'='*60}")
    print(f"Found {len(cleaned_sid_list)} NSE EQUITY securities to process")
    print(f"Security IDs: {cleaned_sid_list}")
    print(f"{'='*60}\n")

    if not cleaned_sid_list:
        print("No valid security IDs found. Exiting.")
        exit()

    success_count = 0
    failed_count = 0
    skipped_count = 0
    
    for idx, sec_id in enumerate(cleaned_sid_list, 1):
        print(f"\n{'='*60}")
        print(f"Processing {idx}/{len(cleaned_sid_list)}: Security ID {sec_id}")
        print(f"{'='*60}")
        
        fetch_success = fetch_and_save_(sec_id)
        
        if not fetch_success:
            print(f"Skipping insert for {sec_id} due to fetch failure\n")
            failed_count += 1
            continue
        
        csv_path = f"data/{sec_id}_1min.csv"
        if not os.path.exists(csv_path):
            print(f"✓ Skipped {sec_id} (data already complete)\n")
            skipped_count += 1
            success_count += 1
            continue
        
        insert_success = insert_candles_to_supabase(sec_id)
        
        if insert_success:
            success_count += 1
        else:
            failed_count += 1
    
    print("\n" + "="*60)
    print("SYNC COMPLETED")
    print(f"Success: {success_count}/{len(cleaned_sid_list)}")
    print(f"Skipped (already complete): {skipped_count}/{len(cleaned_sid_list)}")
    print(f"Failed: {failed_count}/{len(cleaned_sid_list)}")
    print("="*60 + "\n")
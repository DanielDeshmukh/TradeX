# =====================================================
#  IMPORTS & ENV SETUP
# =====================================================
import os
import time
import json
import dotenv
from datetime import datetime
from dhanhq import DhanContext, MarketFeed, dhanhq
from supabase import create_client, Client
from fetch_historical import fetch_wishlist_from_supabase, clean_security_ids

dotenv.load_dotenv()

# =====================================================
#  ENVIRONMENT VARIABLES
# =====================================================
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")  
USER_ID = os.getenv("SUPABASE_DEFAULT_USER_ID")

CLIENT_ID = os.getenv("DHAN_CLIENT_ID")
ACCESS_TOKEN = os.getenv("DHAN_ACCESS_TOKEN")

# =====================================================
#  INITIALIZE CLIENTS
# =====================================================
dhan_context = DhanContext(CLIENT_ID, ACCESS_TOKEN)
dhan = dhanhq(dhan_context)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

print("Dhan context initialized successfully.")
print("Supabase client initialized successfully.")

# =====================================================
#  SETUP INSTRUMENTS
# =====================================================
def setup_instruments(user_id: str):
    """Fetch wishlist, clean IDs, and prepare for market feed subscription."""
    wishlist_data = fetch_wishlist_from_supabase(user_id)
    security_ids = clean_security_ids(wishlist_data)

    instruments = [(MarketFeed.NSE, sec_id, MarketFeed.Quote) for sec_id in security_ids]
    print(f"Loaded {len(instruments)} instruments for live feed.")
    return instruments


# =====================================================
#  DATA PROCESSING
# =====================================================
FIELDS = ["security_id", "volume", "open", "close", "high", "low"]
TIMEFRAME = "1min"

def filter_quote_data(response):
    """
    Filters raw MarketFeed data and adds timestamp & timeframe.
    Returns dict keyed by security_id.
    """
    if not response:
        return {}

    if not isinstance(response, list):
        response = [response]

    filtered = {}
    now = datetime.utcnow().isoformat() + "Z"

    for item in response:
        if item.get("type") == "Quote Data":
            sec_id = str(item.get("security_id"))
            filtered_item = {key: item.get(key, 0) for key in FIELDS}
            filtered_item.update({
                "timestamp": now,
                "timeframe": TIMEFRAME,
            })
            filtered[sec_id] = filtered_item

    return filtered


def insert_candles_to_supabase(candles: dict):
    """Upserts live candles into Supabase 'candles' table."""
    if not candles:
        return

    rows = []
    for candle in candles.values():
        try:
            rows.append({
                "security_id": candle["security_id"],
                "timeframe": candle["timeframe"],
                "timestamp": candle["timestamp"],
                "open": float(candle["open"]),
                "high": float(candle["high"]),
                "low": float(candle["low"]),
                "close": float(candle["close"]),
                "volume": int(candle["volume"]),
            })
        except Exception as e:
            print(f"Error preparing candle for {candle.get('security_id')}: {e}")

    if not rows:
        return

    try:
        supabase.table("candles").upsert(rows).execute()
        print(f"Inserted {len(rows)} candles into Supabase.")
    except Exception as e:
        print(f"Supabase insert error: {e}")


# =====================================================
#  LIVE MARKET FEED LOOP
# =====================================================
def run_market_feed():
    """Main loop to run Dhan market feed and sync to Supabase."""
    instruments = setup_instruments(USER_ID)
    data_stream = MarketFeed(dhan_context, instruments, version="v2")

    print("Starting live market feed...")
    try:
        while True:
            data_stream.run_forever()
            raw_data = data_stream.get_data()
            filtered_data = filter_quote_data(raw_data)
            if filtered_data:
                insert_candles_to_supabase(filtered_data)
                print(json.dumps(filtered_data, indent=2))
            time.sleep(1)
    except KeyboardInterrupt:
        print("Stopping feed gracefully...")
    except Exception as e:
        print(f"Runtime error: {e}")
    finally:
        data_stream.close()
        print("Market feed closed.")


# =====================================================
#  ENTRY POINT
# =====================================================
if __name__ == "__main__":
    run_market_feed()

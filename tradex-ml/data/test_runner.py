# ======================== ⚡ LIVE MARKET FEEDER ⚡ (FINAL, CLEANED) ===========================
# This version implements the fix for the run_forever() issue by adding a time.sleep(2)
# before the call to ensure the internal WebSocket thread starts correctly.

# ======================== IMPORTS & SETUP ===========================
import os
import sys
import dotenv
import requests
import time  # 💡 NEW: Import time for the fix
from typing import List, Dict, Any
from dhanhq import dhanhq, DhanContext, MarketFeed

# Load environment variables
dotenv.load_dotenv()

# --- Credentials ---
DHAN_CLIENT_ID: str = os.getenv("DHAN_CLIENT_ID")
DHAN_ACCESS_TOKEN: str = os.getenv("DHAN_ACCESS_TOKEN")
SUPABASE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY")
DEFAULT_USER_ID: str = os.getenv("SUPABASE_DEFAULT_USER_ID")

# --- Endpoints ---
EDGE_FUNCTION_WISHLIST_URL = "https://pqrnxozftaccuamdaavi.supabase.co/functions/v1/wishlist"

# ======================== CLIENT INITIALIZATION & DEBUG ======================
dhan_context = None
dhan = None

try:
    if not DHAN_CLIENT_ID or not DHAN_ACCESS_TOKEN:
        raise ValueError("Missing Dhan credentials.")
        
    dhan_context = DhanContext(DHAN_CLIENT_ID, DHAN_ACCESS_TOKEN)
    dhan = dhanhq(dhan_context) 
    print("✅ DhanHQ client initialized.")
except Exception as e:
    print(f"❌ ERROR: Failed to initialize Dhan client: {e}")
    sys.exit(1)


def debug_check_rest_api():
    """Checks token validity using the get_fund_limits REST API call."""
    global dhan
    print("\n--- DEBUG: Checking Token Validity via REST API (get_fund_limits) ---")
    try:
        limits = dhan.get_fund_limits()
        if limits.get('status') == 'success':
            print("✅ REST API CHECK SUCCESS: Token is VALID.")
            return True
        else:
            print(f"❌ REST API CHECK FAILURE: Token is INVALID or Restricted. Response: {limits}")
            sys.exit(1)
    except Exception as e:
        print(f"❌ REST API CHECK FAILED: Network or client issue. Error: {e}")
        sys.exit(1)


def fetch_wishlist(user_id: str) -> List[Dict[str, Any]]:
    # (Simplified fetch_wishlist function for completeness)
    if not SUPABASE_KEY: return []
    headers = {"Authorization": f"Bearer {SUPABASE_KEY}", "Content-Type": "application/json"}
    payload = {"user_id": user_id, "action": "fetch"}
    try:
        response = requests.post(EDGE_FUNCTION_WISHLIST_URL, headers=headers, json=payload, timeout=10)
        response.raise_for_status()
        response_data = response.json()
        if "wishlist" in response_data and isinstance(response_data["wishlist"], list):
            print(f"✅ Fetched {len(response_data['wishlist'])} items.")
            return [
                {"security_id": item.get("security_id"), "exchange_segment": item.get("exchange_segment"), "display_name": item.get("display_name")}
                for item in response_data["wishlist"]
            ]
        return []
    except Exception as e:
        print(f"❌ CRITICAL ERROR calling Wishlist Edge Function: {e}")
        return []

# ======================== CORE FUNCTION: LIVE FEED (NEW DHAN STRUCTURE) ====================

def start_live_feed_dhan_spec(wishlist_items: List[Dict[str, Any]]):
    """
    Sets up and runs the MarketFeed using Dhan's provided structure (list of tuples + version="v2").
    """
    global dhan_context
    
    if not wishlist_items:
        print("\nAborting live feed: Wishlist is empty.")
        return

    # --- 1. Prepare Scrips in DHAN-SPECIFIC TUPLE FORMAT ---
    instruments: List[tuple] = []
    print("\n--- 2. Preparing Scrips in DHAN TUPLE FORMAT (FIXED SEGMENT MAPPING) ---")
    
    # Define scrips that might cause issues (USDINR: 50, Vivo: 208433)
    BLACKLISTED_SECURITY_IDS = ["50", "208433"] 
    
    for item in wishlist_items:
        segment = item.get('exchange_segment')
        security_id = item.get('security_id')
        display_name = item.get('display_name', 'UNKNOWN')
        
        if security_id in BLACKLISTED_SECURITY_IDS:
            print(f"   🚫 Skipping Blacklisted Scrip: {display_name} ({security_id})")
            continue
            
        # Map the 'NSE_EQ' segment string to the MarketFeed.NSE_EQ constant
        if segment in ["NSE_EQ", "NSE"] and security_id:
            instruments.append((MarketFeed.NSE_EQ, security_id, MarketFeed.Ticker))
            instruments.append((MarketFeed.NSE_EQ, security_id, MarketFeed.Full))
            print(f"   Adding {display_name} ({security_id}) for Ticker and Full updates.")
        elif security_id: # Catch any others if segment not specified but ID exists
            print(f"   ⚠️ WARNING: Segment {segment} for {security_id} is unmapped. Skipping.")
    
    if not instruments:
        print("⚠️ No valid scrips left to subscribe to.")
        return

    # --- 2. Initialize MarketFeed with Explicit Version ---
    version = "v2"
    
    try:
        data = MarketFeed(dhan_context, instruments, version)
    except Exception as e:
        print(f"❌ ERROR: Failed to initialize MarketFeed. Error: {e}")
        return

    # --- 3. Define Callbacks ---
    def on_connect(instance):
        print("\n⭐ MarketFeed WebSocket Connection SUCCESS! (Using DHAN V2 Spec) ⭐")
        print(f"Total packets subscribed: {len(instruments)}")

    def on_message(data):
        security_id = data.get('securityId')
        ltp = data.get('lastTradedPrice')
        if security_id and ltp is not None:
            print(f"🔴 LIVE: {security_id} | LTP: {ltp}")
        
    def on_error(instance):
        print(f"\n❌ MarketFeed ERROR: {instance.error}")

    data.on_connect = on_connect
    data.on_message = on_message
    data.on_error = on_error
    
    print(f"\n--- 3. Starting Live Feed (Run until Ctrl+C, Attempting Version {version}) ---")
    
    # --- 4. Run (with the FIX) ---
    try:
        # 💡 FIX: Add a small, blocking sleep to allow the internal WebSocket thread to start.
        print("  💡 FIX APPLIED: Waiting 2 seconds for WebSocket thread to fully initialize...")
        time.sleep(2) 
        
        # run_forever() blocks execution and keeps the connection open
        data.run_forever()
    except KeyboardInterrupt:
        print("\nGracefully shutting down Live Feed.")
    except Exception as e:
        print(f"\nFATAL RUNTIME ERROR: {e}")
    # Removed data.disconnect() to avoid the RuntimeWarning


# ======================== EXECUTION =========================
if __name__ == "__main__":
    
    if not DEFAULT_USER_ID:
        sys.exit(1)
    
    debug_check_rest_api()
    
    print("\n--- STARTING LIVE MARKET FEEDER ---")

    # 1. Fetch the wishlist
    wishlist_items = fetch_wishlist(DEFAULT_USER_ID)
    
    # 2. Start the live feed using the new structure
    if wishlist_items:
        start_live_feed_dhan_spec(wishlist_items)
    else:
        print("\nCould not retrieve necessary data. Live feed will not start.")

    print("\n--- PROGRAM COMPLETE ---")
    
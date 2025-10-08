# data/wishlist_fetcher.py

# ======================== IMPORTS ===========================
from dhanhq import dhanhq, DhanContext
from supabase import create_client, Client # Retained in case of future direct Supabase use
import requests
import dotenv
import os
import json
from typing import List, Dict, Any

# ======================== CONFIGURATION =====================
# Load environment variables from .env file
dotenv.load_dotenv()

# Supabase Configuration
# Note: SUPABASE_KEY is assumed to be the Service Key required for Edge Function Auth
SUPABASE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY")
SUPABASE_URL: str = os.getenv("SUPABASE_URL") # Required for create_client, though unused below
DEFAULT_USER_ID: str = os.getenv("SUPABASE_DEFAULT_USER_ID")

# Dhan Configuration (Retained for setup, though not used in the final core logic)
DHAN_ACCESS_TOKEN: str = os.getenv("DHAN_ACCESS_TOKEN")
DHAN_CLIENT_ID: str = os.getenv("DHAN_CLIENT_ID")

# Edge Function Endpoint
EDGE_FUNCTION_WISHLIST_URL = "https://pqrnxozftaccuamdaavi.supabase.co/functions/v1/wishlist"

# ======================== CLIENT SETUP ======================
# Initialize Supabase client (Retained for a complete environment setup)
try:
    supabase: Client = create_client(SUPABASE_URL, os.getenv("SUPABASE_ANON_KEY"))
except Exception as e:
    print(f"Warning: Could not initialize Supabase client. Direct DB access disabled. Error: {e}")
    supabase = None

# Initialize Dhan client (Retained for a complete environment setup)
try:
    dhan_context = DhanContext(DHAN_CLIENT_ID, DHAN_ACCESS_TOKEN)
    dhan = dhanhq(dhan_context)
except Exception as e:
    print(f"Warning: Could not initialize Dhan client. API access disabled. Error: {e}")
    dhan = None

# ======================== CORE LOGIC: WISHLIST ====================

def fetch_wishlist_via_edge_function(user_id: str) -> List[Dict[str, Any]]:
    """
    Fetches the user's wishlist from the Supabase Edge Function.
    
    Returns a clean list of dictionaries containing only necessary stock details.
    """
    if not SUPABASE_KEY:
        print("ERROR: SUPABASE_SERVICE_KEY is missing. Cannot authenticate Edge Function call.")
        return []

    print("\n--- Starting Wishlist Fetch ---")
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
            wishlist_items = response_data["wishlist"]
            print(f"Successfully fetched {len(wishlist_items)} items from Edge Function.")
            
            clean_wishlist = [
                {
                    "security_id": item.get("security_id"),
                    "display_name": item.get("display_name"),
                    "exchange_segment": item.get("exchange_segment"),
                    "instrument_type": item.get("instrument_type"),
                }
                for item in wishlist_items
            ]
            return clean_wishlist

        elif "error" in response_data:
            print(f"Edge Function returned an error: {response_data['error']}")
            return []

        print("Edge Function returned an unexpected empty or non-list response.")
        return []

    except requests.exceptions.RequestException as e:
        print(f"CRITICAL ERROR calling Wishlist Edge Function: {e}")
        return []

def display_wishlist(wishlist: List[Dict[str, Any]], user_id: str):
    """Prints the fetched and cleaned wishlist in a readable format."""
    print("\n" + "=" * 50)
    print(f"| FINAL CLEANED WISHLIST FOR USER: {user_id.split('-')[0]}... |")
    print("=" * 50)
    
    if not wishlist:
        print("| No wishlist items were fetched. |")
        print("=" * 50)
        return

    print(f"| Total Items: {len(wishlist)}")
    print("-" * 50)
    
    for i, item in enumerate(wishlist):
        sid = item.get("security_id", "N/A")
        name = item.get("display_name", "N/A")
        segment = item.get("exchange_segment", "N/A")
        itype = item.get("instrument_type", "N/A")
        
        print(f"{i+1:3d}. {name:20s} (ID: {sid}) | Seg: {segment:8s} | Type: {itype}")

    print("=" * 50)

# ======================== EXECUTION =========================
if __name__ == "__main__":
    
    if not DEFAULT_USER_ID:
        print("Execution aborted: DEFAULT_USER_ID is not set in environment.")
    else:
        # 1. Fetch the wishlist
        wishlist_items = fetch_wishlist_via_edge_function(DEFAULT_USER_ID)
        
        # 2. Display the cleaned data
        display_wishlist(wishlist_items, DEFAULT_USER_ID)

    print("\n--- PROGRAM COMPLETE ---")
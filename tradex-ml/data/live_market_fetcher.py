# ======================== IMPORTS ===========================
import os
import sys
import time
import requests
import dotenv
import logging
from typing import List, Dict, Any, Tuple

from dhanhq import DhanContext, MarketFeed

# ======================== CONFIGURATION =====================
# Load environment variables from .env file
dotenv.load_dotenv()

# --- Logging Setup ---
# Configure logging for clear, well-mannered output
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

# --- Dhan Configuration ---
DHAN_CLIENT_ID: str = os.getenv("DHAN_CLIENT_ID")
DHAN_ACCESS_TOKEN: str = os.getenv("DHAN_ACCESS_TOKEN")

# --- Supabase Configuration ---
SUPABASE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY")
DEFAULT_USER_ID: str = os.getenv("SUPABASE_DEFAULT_USER_ID")
EDGE_FUNCTION_WISHLIST_URL = "https://pqrnxozftaccuamdaavi.supabase.co/functions/v1/wishlist"

# ======================== CORE LOGIC ========================

def fetch_wishlist_from_supabase(user_id: str) -> List[Dict[str, Any]]:
    """
    Fetches the user's wishlist from the Supabase Edge Function.
    
    Args:
        user_id (str): The ID of the user whose wishlist is to be fetched.
        
    Returns:
        A list of dictionaries representing securities, or an empty list on failure.
    """
    if not SUPABASE_KEY:
        logging.error("SUPABASE_SERVICE_KEY is missing. Cannot authenticate Edge Function call.")
        return []

    logging.info(f"Attempting to fetch wishlist for user: {user_id.split('-')[0]}...")
    headers = {
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application "
    }
    payload = {"user_id": user_id, "action": "fetch"}

    try:
        response = requests.post(EDGE_FUNCTION_WISHLIST_URL, headers=headers, json=payload, timeout=15)
        response.raise_for_status()
        
        response_data = response.json()

        if "wishlist" in response_data and isinstance(response_data["wishlist"], list):
            wishlist = response_data["wishlist"]
            logging.info(f"Successfully fetched {len(wishlist)} items from Supabase Edge Function.")
            return wishlist
            
        elif "error" in response_data:
            logging.error(f"Edge Function returned an error: {response_data['error']}")
        else:
            logging.warning("Edge Function returned an unexpected empty or non-list response.")
        return []

    except requests.exceptions.RequestException as e:
        logging.critical(f"A critical error occurred while calling the Supabase Edge Function: {e}")
        return []

def prepare_instruments_for_feed(wishlist: List[Dict[str, Any]]) -> List[Tuple]:
    """
    Converts the wishlist data into the format required by DhanHQ's MarketFeed.
    
    Args:
        wishlist (list): The list of securities fetched from Supabase.
        
    Returns:
        A list of tuples formatted for the MarketFeed subscription.
    """
    # CORRECTED: Using the library's specific, prefixed constant names
    exchange_map = {
        "NSE_EQ": MarketFeed.NSE_EQ,
        "BSE_EQ": MarketFeed.BSE_EQ,
        "NSE_CURR": MarketFeed.NSE_CURRENCY,
        "MCX_COMM": MarketFeed.MCX_COMMODITY,
    }
    
    instruments = []
    logging.info("Preparing instruments for the live feed subscription...")
    
    for item in wishlist:
        security_id = item.get("security_id")
        exchange_segment = item.get("exchange_segment")
        display_name = item.get("display_name", "N/A")

        if not security_id or not exchange_segment:
            logging.warning(f"Skipping '{display_name}': missing 'security_id' or 'exchange_segment'.")
            continue

        exchange_constant = exchange_map.get(exchange_segment)
        if not exchange_constant:
            logging.warning(f"Skipping '{display_name}': unknown exchange segment '{exchange_segment}'.")
            continue
            
        instruments.append((exchange_constant, security_id, MarketFeed.Quote))
    
    logging.info(f"Successfully prepared {len(instruments)} instruments for subscription.")
    return instruments

# ======================== FEED HANDLERS =========================

def on_connect(instance):
    """Callback triggered on successful WebSocket connection."""
    logging.info("Connection established. Listening for live data... (Press Ctrl+C to stop)")

def on_message(instance, message):
    """Callback triggered on receiving a new message from the WebSocket."""
    logging.info(f"Received Data: {message}")

def on_error(instance, error):
    """Callback triggered on a WebSocket error."""
    logging.error(f"WebSocket Error: {error}")

def on_close(instance, code, reason):
    """Callback triggered when the WebSocket connection is closed."""
    logging.warning(f"Connection closed: Code={code}, Reason={reason}")

# ======================== MAIN EXECUTION =========================

def main():
    """Main function to run the application."""
    if not all([DHAN_CLIENT_ID, DHAN_ACCESS_TOKEN, DEFAULT_USER_ID]):
        logging.critical("Execution aborted: Required environment variables are not set.")
        sys.exit(1)

    wishlist_items = fetch_wishlist_from_supabase(DEFAULT_USER_ID)
    if not wishlist_items:
        logging.error("No wishlist items were fetched. Exiting program.")
        return

    instruments_to_subscribe = prepare_instruments_for_feed(wishlist_items)
    if not instruments_to_subscribe:
        logging.error("No valid instruments to subscribe to after processing the wishlist. Exiting.")
        return

    market_feed = None
    try:
        logging.info("Initializing DhanHQ context...")
        dhan_context = DhanContext(DHAN_CLIENT_ID, DHAN_ACCESS_TOKEN)
        
        logging.info(f"Connecting to MarketFeed for {len(instruments_to_subscribe)} instruments...")
        market_feed = MarketFeed(
            dhan_context,
            instruments_to_subscribe,
            on_connect=on_connect,
            on_message=on_message,
            on_error=on_error,
            on_close=on_close
        )
        market_feed.run_forever()

    except KeyboardInterrupt:
        logging.info("KeyboardInterrupt detected. Closing connection gracefully...")
    except Exception as e:
        logging.error(f"An unexpected error occurred in the main execution block: {e}")
    finally:
        if market_feed:
            market_feed.close()
        logging.info("--- PROGRAM COMPLETE ---")

if __name__ == "__main__":
    main()
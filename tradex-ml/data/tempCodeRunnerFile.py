
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
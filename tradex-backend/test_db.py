from database import get_connection

conn = get_connection()
cur = conn.cursor()
cur.execute("SELECT COUNT(*) as count FROM candles")
print(f"Candles: {cur.fetchone()['count']}")
cur.execute("SELECT COUNT(*) as count FROM master_symbols")
print(f"Symbols: {cur.fetchone()['count']}")
conn.close()

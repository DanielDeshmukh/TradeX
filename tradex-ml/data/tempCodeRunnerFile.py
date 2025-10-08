from dhanhq import DhanContext, MarketFeed
import dotenv
import os
import time

dotenv.load_dotenv()

client_id = os.getenv("DHAN_CLIENT_ID")
access_token = os.getenv("DHAN_ACCESS_TOKEN")

# Initialize context properly with variables (not strings)
dhan_context = DhanContext(client_id, access_token)

instruments = [

    (MarketFeed.NSE, "1333", MarketFeed.Quote),

]

version = "v2"

data = MarketFeed(dhan_context, instruments, version)

try:
    data.run_forever()
    while True:
        response = data.get_data()
        if response:
            print(response)
        time.sleep(1)

except KeyboardInterrupt:
    print("Interrupted. Closing connection gracefully...")
    data.close()   # Graceful shutdown

except Exception as e:
    print("Error:", e)
    data.close()

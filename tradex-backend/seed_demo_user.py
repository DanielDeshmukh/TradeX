from database import fetch_one, execute

# Demo user settings
DEMO_USER_ID = "demo-user"

# Insert demo settings
execute("""
    INSERT INTO user_settings (user_id, theme, currency, timezone, language)
    VALUES (%s, 'tradex', 'INR', 'Asia/Kolkata', 'en')
    ON CONFLICT (user_id) DO NOTHING
""", (DEMO_USER_ID,))

# Insert demo profile
execute("""
    INSERT INTO user_profiles (user_id, display_name, email, bio)
    VALUES (%s, 'Demo Trader', 'demo@tradex.dev', 'Learning to trade with AI-powered insights')
    ON CONFLICT (user_id) DO NOTHING
""", (DEMO_USER_ID,))

print("Demo user settings and profile created successfully")

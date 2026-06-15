# TradeX — Project Goals & Roadmap

> **AI-Powered SaaS Trading Platform for the Indian Stock Market**
> Target: Beginner retail investors (ages 18–35)

---

## Current State Summary

| Area | Status | Details |
|------|--------|---------|
| Frontend (React) | **~95%** | All components built, design system complete, mobile layout, lazy loading, vendor splitting, vitest configured |
| ML Pipeline (Python) | **~80%** | Feature engineering, PPO training, backtesting, signal engine, ensemble model all built. Needs real training data + actual model training |
| Database | **PostgreSQL (local)** | Migrated from Supabase for ML data. Schema ready (candles, signals, features, master_symbols). Auth still on Supabase |
| Data Collected | **5 symbols × ~375 candles** | 14366, 17963, 2277, 3456, 3499. Need 100+ symbols for production |
| Dhan Subscription | **Not available** | Using collected/sample data for development |
| Supabase Backend | **Auth only** | ML data moved to PostgreSQL. Frontend auth, Edge Functions, Storage still on Supabase |
| CI/CD | **GitHub Actions** | Lint + build on PR. Vercel config ready |
| Testing | **Vitest setup** | Button tests written. Need full component + integration coverage |

---

## Git Branches (all preserved, none deleted)

```
main                                    ← production-ready
├── phase-2-design-system               ← merged
├── phase-4-feature-engineering         ← merged
├── phase-5-ppo-model                   ← merged
├── phase-6-backtesting                 ← merged
├── phase-7-signal-engine               ← merged
├── phase-8-15-frontend-complete        ← merged
├── phase-16-20-complete                ← merged
└── migration-supabase-to-postgres      ← merged
```

---

## What's Done (Phases 1–20)

### Phase 1: Foundation Cleanup ✅
- Fixed filename bugs (double-dot, typos)
- Removed unused files + dependencies
- All hardcoded URLs → env variables
- Single ToastContainer, single ReactDOM import

### Phase 2: Design System ✅
- Tailwind CSS variables for 4 themes (TradeX, Claude, Nvidia, Ollama)
- 9 base UI components: Button, Card, Modal, Input, Select, Badge, Tooltip, Skeleton, Toast
- ~130 hardcoded colors replaced with theme tokens across 28 files
- Glass-morphism + gradient utility classes

### Phase 3: Data Pipeline ✅
- `requirements.txt` with all ML deps
- `data_validator.py` (gap detection, zero-volume, duplicates, outliers)
- Retry logic with exponential backoff
- Logging instead of print()

### Phase 4: Feature Engineering ✅
- `feature_engineering.py` — 20+ indicators (SMA, EMA, RSI, MACD, Bollinger, ATR, VWAP, OBV, Stochastic, ADX)
- Lag features, time features, label generation
- Risk-adjusted labels (Sharpe-based)
- Parquet export, `feature_config.yaml`
- Config-driven pipeline

### Phase 5: ML/RL Model ✅
- `tradex_env.py` — Gymnasium env, Discrete(3) action space, 3 reward modes (PnL, Sharpe, asymmetric)
- Slippage modeling, position tracking (long/short/flat)
- `train_ppo.py` — Configurable hyperparams, curriculum learning, TensorBoard, checkpoint saving
- PPO with Stable-Baselines3

### Phase 6: Backtesting ✅
- `backtester.py` — Walk-forward validation
- `evaluation.py` — CAGR, Sortino, Calmar, profit factor, win rate
- 3 benchmarks (buy-and-hold, SMA crossover, random walk)
- Performance thresholds, trade log, monthly breakdown
- JSON report output

### Phase 7: Signal Engine ✅
- `signal_engine.py` — Load model, compute features, generate signals
- Supabase migration SQL for `trading_signals` + `signal_accuracy` tables
- `get-signals` Edge Function
- Periodic signal generation, accuracy tracking

### Phase 8: Signal Display ✅
- `SignalBadge.jsx` — BUY/SELL/HOLD with confidence + pulse animation
- `AIDashboard.jsx` — Live signal stats, signal list
- Signal column in WishlistTable

### Phase 9: Charting ✅
- SMA, EMA, Bollinger Bands, VWAP indicator overlays
- Buy/sell signal markers
- `ChartControls.jsx` — Chart type, timeframe, indicator toggles
- `CrosshairTooltip.jsx` — OHLCV + indicators + IST time

### Phase 10: Mobile ✅
- `BottomNav.jsx` — Mobile tab bar
- `MobileWatchlist.jsx` — Card-based layout
- `MobileLayout.jsx` — Wrapper with bottom nav
- `MobileSettings.jsx` — Mobile-optimized settings
- Mobile gate removed from App.jsx

### Phase 11: Security ✅
- `security.js` — Session refresh, rate limiting, input sanitization, CSRF, audit logging
- `useAuth.js` — Centralized auth state (import path fixed)
- `PrivacyPolicy.jsx`, `TermsOfService.jsx`

### Phase 12: Notifications ✅
- `NotificationCenter.jsx` — Bell icon, unread badge, dropdown
- `PriceAlerts.jsx` — Set above/below targets, modal, active/triggered lists
- `NotificationPreferences.jsx` — Toggle switches for 6 types

### Phase 13: Payments ✅
- `SubscriptionPlan.jsx` — Free/Pro/Elite tiers, ₹499/₹1499 pricing
- `BillingHistory.jsx` — Payment history table

### Phase 14: Social ✅
- `ProfileStats.jsx` — Portfolio value, return, trades, win rate
- `Leaderboard.jsx` — Top traders, achievement badges
- `ActivityHeatmap.jsx` — GitHub-style contribution grid

### Phase 15: Learning ✅
- `Learn.jsx` — 6 chapters (stock market, candlesticks, indicators, risk, sentiment, trading plan)
- Progress tracking, chapter navigation
- `TradingGlossary.jsx` — 36 searchable trading terms

### Phase 16: Performance ✅
- `React.lazy` + `Suspense` for heavy routes
- Vendor chunk splitting in vite.config.js (react, charting, UI, data)

### Phase 17: Testing ✅
- `vitest.config.js` — jsdom environment
- `Button.test.jsx` — 3 basic tests
- test scripts in package.json

### Phase 18: DevOps ✅
- `.github/workflows/ci.yml` — Lint + build on PR/push
- `vercel.json` — Deployment config

### Phase 19: Analytics ✅
- `analytics.js` — localStorage-based event tracking

### Phase 20: Advanced AI ✅
- `ensemble.py` — Combines PPO + SMA crossover with weighted voting

---

## What's NOT Done (Remaining to 100%)

### 🔴 Critical (Must complete for launch)

1. **Database Setup**
   - [ ] Install PostgreSQL locally or on a server
   - [ ] Create database: `CREATE DATABASE tradex;`
   - [ ] Run schema: `psql -U postgres -d tradex -f tradex-ml/schema.sql`
   - [ ] Add `PG_PASSWORD` to `tradex-ml/.env`
   - [ ] Test connection with `python tradex-ml/db.py`

2. **Data Collection (Real Data)**
   - [ ] Get Dhan API subscription (₹200/month for historical data)
   - [ ] Fetch 100+ NSE equity symbols × 6 months 1-min data
   - [ ] Store in PostgreSQL `candles` table
   - [ ] Validate data integrity (gaps, duplicates, outliers)

3. **Train the PPO Model**
   - [ ] Run: `python tradex-ml/train_ppo.py --data data/data/14366_1min.csv --timesteps 100000`
   - [ ] Train on all 5 symbols, iterate on hyperparams
   - [ ] Run backtesting: `python tradex-ml/backtester.py --model models/ppo_baseline/ppo_final --data data/data/14366_1min.csv`
   - [ ] Achieve Sharpe > 1.0, Win Rate > 50%

4. **Wire Components into App.jsx Routes**
   - [ ] Add routes for: PrivacyPolicy, TermsOfService, BillingHistory, TradingGlossary
   - [ ] Add routes for: MobileSettings, NotificationPreferences
   - [ ] Connect CrosshairTooltip to Chart component
   - [ ] Wire BottomNav to actual page navigation

5. **Frontend-PostgreSQL Integration**
   - [ ] Create FastAPI backend (or Supabase Edge Functions) that connects to PostgreSQL
   - [ ] API endpoints: `/candles`, `/signals`, `/features`, `/symbols`
   - [ ] Replace Supabase data queries in frontend with API calls

### 🟡 Important (Should complete before beta)

6. **Testing**
   - [ ] Write tests for: Chart, WishlistTable, Settings, Login, Register
   - [ ] Write integration tests for auth flow
   - [ ] Write Python tests for feature_engineering, tradex_env, backtester
   - [ ] Run `npm test` and `python -m pytest` in CI

7. **Mobile Responsiveness**
   - [ ] Test on iPhone SE, iPhone 14, Samsung Galaxy S21, Pixel 7
   - [ ] Fix any layout issues
   - [ ] Add PWA manifest + service worker

8. **Error Handling**
   - [ ] Add error boundaries in React
   - [ ] Add try/catch in all API calls
   - [ ] Add fallback UI for loading failures

9. **Performance**
   - [ ] Lazy load all routes (not just heavy ones)
   - [ ] Add React Query for data caching
   - [ ] Debounce chart resize
   - [ ] Virtual scrolling for large lists

### 🟢 Nice to Have (Can ship without)

10. **Advanced Features**
    - [ ] Sentiment analysis (news + social media)
    - [ ] Candlestick pattern detection
    - [ ] Natural language queries ("What's the trend for Reliance?")
    - [ ] Risk scoring per security

11. **Monetization**
    - [ ] Razorpay integration
    - [ ] Subscription management flow
    - [ ] Referral credit system
    - [ ] Promo code support

12. **Community**
    - [ ] User search/discovery
    - [ ] Follow other traders
    - [ ] Community watchlists

---

## Quick Start (What to do right now)

```bash
# 1. Setup PostgreSQL
psql -U postgres -c "CREATE DATABASE tradex;"
psql -U postgres -d tradex -f tradex-ml/schema.sql

# 2. Configure .env
cd tradex-ml
echo "PG_PASSWORD=your_postgres_password" >> .env

# 3. Test DB connection
python -c "from db import init_db; init_db(); print('DB OK')"

# 4. Load existing data into PostgreSQL
python -c "
import json, pandas as pd
from db import upsert_candles
for sym in ['14366','17963','2277','3456','3499']:
    df = pd.read_csv(f'data/data/{sym}_1min.csv', index_col=0).T
    cols = df.iloc[:,0].tolist()
    data = df.iloc[:,1:].T; data.columns = cols
    for c in ['open','high','low','close','volume']:
        data[c] = pd.to_numeric(data[c], errors='coerce')
    data = data.reset_index(drop=True)
    data['security_id'] = sym
    data['timeframe'] = '1min'
    candles = data[['security_id','timeframe','timestamp','open','high','low','close','volume']].to_dict('records')
    n = upsert_candles(candles)
    print(f'{sym}: {n} candles inserted')
"

# 5. Train PPO model
python train_ppo.py --data data/data/14366_1min.csv --timesteps 50000

# 6. Run backtest
python backtester.py --model models/ppo_baseline/ppo_final --data data/data/14366_1min.csv

# 7. Start frontend
cd ../tradex-frontend
npm install
npm run dev
```

---

## File Structure

```
TradeX/
├── .github/workflows/ci.yml          ← CI/CD
├── .gitignore
├── PROJECT_GOALS.md                  ← This file
├── supabase/
│   ├── functions/get-signals/index.ts ← Edge Function
│   └── migrations/                    ← SQL migrations
├── tradex-frontend/
│   ├── src/
│   │   ├── components/               ← 35+ React components
│   │   ├── context/ThemeContext.jsx   ← 4-theme system
│   │   ├── hooks/useAuth.js          ← Auth state
│   │   ├── utils/security.js         ← Security utilities
│   │   └── App.jsx                   ← Routes + lazy loading
│   ├── vitest.config.js
│   └── vite.config.js                ← Vendor chunk splitting
└── tradex-ml/
    ├── db.py                         ← PostgreSQL module
    ├── schema.sql                    ← Database schema
    ├── feature_engineering.py        ← 20+ indicators
    ├── tradex_env.py                 ← Gymnasium env
    ├── train_ppo.py                  ← PPO training
    ├── backtester.py                 ← Walk-forward validation
    ├── evaluation.py                 ← Metrics + benchmarks
    ├── signal_engine.py              ← Signal generation
    ├── ensemble.py                   ← PPO + SMA ensemble
    ├── feature_config.yaml           ← Feature parameters
    └── data/data/                    ← 5 symbols CSV + JSON
```

---

*Last updated: June 2026*
*Project: TradeX — AI-Powered Trading Platform*
*15 commits on main, 7 phase branches preserved*

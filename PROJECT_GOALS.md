# TradeX — Project Goals & Roadmap

> **AI-Powered SaaS Trading Platform for the Indian Stock Market**
> Target: Beginner retail investors (ages 18–35)

---

## Current State Summary

| Area | Status | Details |
|------|--------|---------|
| Frontend (React) | **~95%** | All components built, design system complete, mobile layout, lazy loading, vendor splitting |
| Backend (FastAPI) | **~70%** | API endpoints working, CORS configured, live_feed endpoint |
| ML Pipeline (Python) | **~90%** | Feature engineering (22 indicators), Random Forest trained (73.6%), 116K signals generated |
| Database | **PostgreSQL (local)** | 116,250 candles loaded, 116,250 features, 116,250 signals |
| Data Collected | **5 symbols × 23,250 candles** | RELIANCE, TCS, INFY, HDFCBANK, ICICIBANK |
| Testing | **125 tests** | 24/68 components tested (35%) |
| CI/CD | **GitHub Actions** | Lint + build on PR |
| Demo Mode | **Active** | Mock Supabase client for offline testing |
| CLI | **tradex** | tradex run, tradex test-user |

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
├── migration-supabase-to-postgres      ← merged
├── feature/routing-pages               ← merged
├── feature/error-handling              ← merged
├── feature/component-tests             ← merged
├── feature/database-setup              ← merged
├── feature/lint-fixes                  ← merged
├── phase-1-more-tests                  ← merged
├── phase-2-performance                 ← merged
├── phase-3-fastapi-backend             ← merged
├── phase-4-pwa-setup                   ← merged
├── phase-5-database-setup              ← merged
├── feature/ml-pipeline                 ← merged
```

---

## What's Done (Phases 1–20 + Additional)

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
- `tradex_env.py` — Gymnasium env, Discrete(3) action space, 3 reward modes
- Slippage modeling, position tracking
- `train_ppo.py` — Configurable hyperparams, curriculum learning, TensorBoard
- PPO with Stable-Baselines3

### Phase 6: Backtesting ✅
- `backtester.py` — Walk-forward validation
- `evaluation.py` — CAGR, Sortino, Calmar, profit factor, win rate
- 3 benchmarks, performance thresholds, trade log

### Phase 7: Signal Engine ✅
- `signal_engine.py` — Load model, compute features, generate signals
- Supabase migration SQL
- `get-signals` Edge Function

### Phase 8: Signal Display ✅
- `SignalBadge.jsx` — BUY/SELL/HOLD with confidence + pulse animation
- `AIDashboard.jsx` — Live signal stats, signal list
- Signal column in WishlistTable

### Phase 9: Charting ✅
- SMA, EMA, Bollinger Bands, VWAP indicator overlays
- Buy/sell signal markers
- `ChartControls.jsx`, `CrosshairTooltip.jsx`

### Phase 10: Mobile ✅
- `BottomNav.jsx`, `MobileWatchlist.jsx`, `MobileLayout.jsx`, `MobileSettings.jsx`
- Mobile gate removed from App.jsx

### Phase 11: Security ✅
- `security.js` — Session refresh, rate limiting, input sanitization, CSRF, audit logging
- `useAuth.js` — Centralized auth state
- `PrivacyPolicy.jsx`, `TermsOfService.jsx`

### Phase 12: Notifications ✅
- `NotificationCenter.jsx`, `PriceAlerts.jsx`, `NotificationPreferences.jsx`

### Phase 13: Payments ✅
- `SubscriptionPlan.jsx` — Free/Pro/Elite tiers
- `BillingHistory.jsx` — Payment history table

### Phase 14: Social ✅
- `ProfileStats.jsx`, `Leaderboard.jsx`, `ActivityHeatmap.jsx`

### Phase 15: Learning ✅
- `Learn.jsx` — 6 chapters, progress tracking
- `TradingGlossary.jsx` — 36 searchable trading terms

### Phase 16: Performance ✅
- `React.lazy` + `Suspense`, vendor chunk splitting

### Phase 17: Testing ✅ (Initial)
- `vitest.config.js`, 73 tests across 12 files

### Phase 18: DevOps ✅
- `.github/workflows/ci.yml`, `vercel.json`

### Phase 19: Analytics ✅
- `analytics.js` — localStorage-based event tracking

### Phase 20: Advanced AI ✅
- `ensemble.py` — PPO + SMA crossover ensemble

### Phase 21: Routing & Navigation ✅
- 8 new routes, BottomNav wired to useNavigate/useLocation
- CrosshairTooltip integrated into Chart

### Phase 22: Error Handling ✅
- ErrorBoundary.jsx, NotFoundPage.jsx, NetworkErrorPage.jsx, AuthErrorPage.jsx
- Wrapped App.jsx Routes with ErrorBoundary

### Phase 23: Component Tests (Batch 1) ✅
- 21 tests: SignalBadge, Card, BottomNav, Button

### Phase 24: Database Setup ✅
- PostgreSQL running, tradex database created
- Schema applied (6 tables, 12 indexes)
- 116,250 candles loaded from JSON

### Phase 25: Backend API ✅
- FastAPI with CORS, 4 route modules
- POST /live_feed endpoint matching frontend expectations
- GET /api/candles, /api/symbols, /api/signals

### Phase 26: PWA Setup ✅
- manifest.json, service-worker.js, SVG icons
- index.html meta tags

### Phase 27: Performance Optimization ✅
- Lazy load all 17 route components
- React Query provider (30s staleTime)
- Debounce chart resize (200ms)
- Virtual scrolling for TradingGlossary

### Phase 28: Component Tests (Batch 2) ✅
- 52 new tests: DemoBanner, Footer, SplashScreen, MiniModal, MobileComingSoon, ErrorBoundary, PrivacyPolicy, TermsOfService, ProfileStats, Input, Select

### Phase 29: Demo Mode & CLI ✅
- Mock Supabase client for offline testing
- tradex CLI (tradex.bat, tradex.ps1)
- DemoBanner component, Login shows demo credentials
- Test user: test@tradex.dev / TradeX123!

### Phase 30: ML Pipeline ✅
- Feature engineering: 22 technical indicators
- Random Forest model: 73.6% accuracy
- Signal generation: 116,250 buy/sell/hold signals
- GET /api/signals/all endpoint

---

## What's NOT Done (Remaining to 100%)

### Phase 31: Wire Signals to Dashboard
- Connect /api/signals/all to MainPage
- Display signal badges next to each symbol
- Real-time signal updates
- Signal history chart

### Phase 32: Dashboard Live Data
- Wire candle data from backend to ChartPage
- Live price updates from API
- Portfolio value calculation
- Watchlist with live prices

### Phase 33: Alert System Backend
- Price alert API endpoints (CRUD)
- Alert trigger logic (price crosses threshold)
- Notification delivery (in-app + email)
- Alert history tracking

### Phase 34: Alert System Frontend
- PriceAlerts connected to backend
- Alert notification delivery
- Alert management (edit/delete)
- Push notification support

### Phase 35: User Settings Backend
- User preferences API (theme, notifications, currency)
- Settings persistence in PostgreSQL
- Profile update endpoints
- Account deletion endpoint

### Phase 36: Profile & Settings Wiring
- ProfileHeader connected to backend
- ContactInfo save/load from API
- MobileSettings backend integration
- NotificationPreferences persistence

### Phase 37: Billing Backend
- Subscription status API
- Payment history API
- Plan upgrade/downgrade logic
- Promo code validation

### Phase 38: Billing Frontend Wiring
- SubscriptionPlan connected to backend
- BillingHistory loading from API
- ReferralCode backend integration
- Payment flow (mock)

### Phase 39: Search & Filter
- Symbol search API with debounce
- Watchlist CRUD endpoints
- Symbol filtering (sector, market cap)
- Recent searches history

### Phase 40: Leaderboard Backend
- Leaderboard API endpoint
- Ranking algorithm (return, win rate, streak)
- Achievement system
- Weekly/monthly rankings

### Phase 41: Learning Backend
- Course progress API
- Quiz system endpoints
- Certificate generation
- Learning path recommendations

### Phase 42: Advanced Chart Features
- Multi-timeframe analysis
- Drawing tools (trendlines, fibonacci)
- Chart comparison (multiple symbols)
- Export chart as image

### Phase 43: Test Coverage (Batch 3)
- Chart, ChartContainer, ChartPage tests
- Settings, ProfilePage, ProfileHeader tests
- Notifications, NotificationCenter tests
- WishlistTable, MobileWatchlist tests

### Phase 44: Test Coverage (Batch 4)
- TradingGlossary, Learn tests
- Leaderboard, ActivityHeatmap tests
- AIDashboard, PriceAlerts tests
- BillingHistory, SubscriptionPlan tests

### Phase 45: Test Coverage (Batch 5)
- FullscreenChartPage, ChartTypeModal tests
- TimeFrameModal, ShortcutModal tests
- ForgotPassword, MagicLink, UpdatePassword tests
- TradeXLanding, MainPage tests

### Phase 46: Integration Tests
- Auth flow end-to-end tests
- Chart data loading tests
- Signal generation pipeline tests
- API endpoint integration tests

### Phase 47: Python ML Tests
- Feature engineering unit tests
- Model training tests
- Signal generation tests
- Database operations tests

### Phase 48: Error Handling Hardening
- API error response standardization
- Frontend error boundary expansion
- Retry logic for failed API calls
- Offline fallback UI

### Phase 49: Security Audit
- Rate limiting on all endpoints
- Input validation (Pydantic models)
- SQL injection prevention verification
- XSS protection audit

### Phase 50: Performance Optimization (Backend)
- Database query optimization
- API response caching (Redis)
- Connection pooling
- Background task queue

### Phase 51: Performance Optimization (Frontend)
- Image optimization (WebP)
- Service worker caching strategy
- Critical CSS inlining
- Bundle size analysis

### Phase 52: Deployment (Backend)
- Docker containerization
- Railway/Render deployment
- Environment variable configuration
- Health check endpoints

### Phase 53: Deployment (Frontend)
- Vercel deployment
- Custom domain setup
- SSL certificate
- CDN configuration

### Phase 54: Monitoring & Logging
- Sentry error tracking
- API request logging
- Performance monitoring
- Uptime monitoring

### Phase 55: Documentation
- API documentation (OpenAPI/Swagger)
- Developer setup guide
- Deployment guide
- User guide

### Phase 56: Beta Testing
- Invite beta users
- Collect feedback
- Bug fixes
- Performance tuning

---

## Phase Execution Plan

| Phase | Name | Commits | Tasks |
|-------|------|---------|-------|
| 31 | Wire Signals to Dashboard | 1 | 5 |
| 32 | Dashboard Live Data | 2 | 8 |
| 33 | Alert System Backend | 1 | 6 |
| 34 | Alert System Frontend | 1 | 5 |
| 35 | User Settings Backend | 1 | 6 |
| 36 | Profile & Settings Wiring | 1 | 5 |
| 37 | Billing Backend | 1 | 5 |
| 38 | Billing Frontend Wiring | 1 | 5 |
| 39 | Search & Filter | 1 | 5 |
| 40 | Leaderboard Backend | 1 | 5 |
| 41 | Learning Backend | 1 | 5 |
| 42 | Advanced Chart Features | 2 | 8 |
| 43 | Test Coverage (Batch 3) | 1 | 5 |
| 44 | Test Coverage (Batch 4) | 1 | 5 |
| 45 | Test Coverage (Batch 5) | 1 | 5 |
| 46 | Integration Tests | 1 | 5 |
| 47 | Python ML Tests | 1 | 5 |
| 48 | Error Handling Hardening | 1 | 5 |
| 49 | Security Audit | 1 | 5 |
| 50 | Performance (Backend) | 1 | 5 |
| 51 | Performance (Frontend) | 1 | 5 |
| 52 | Deployment (Backend) | 1 | 5 |
| 53 | Deployment (Frontend) | 1 | 5 |
| 54 | Monitoring & Logging | 1 | 5 |
| 55 | Documentation | 1 | 5 |
| 56 | Beta Testing | 1 | 5 |

**Total: 26 phases, 26 commits, ~140 tasks**

---

*Last updated: June 16, 2026*
*Project: TradeX — AI-Powered Trading Platform*
*18 phase branches preserved, 0 deleted*

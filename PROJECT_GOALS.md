# TradeX — Project Goals & Roadmap

> **AI-Powered SaaS Trading Platform for the Indian Stock Market**
> Target: Beginner retail investors (ages 18–35)

---

## Current State Summary

| Area | Status |
|------|--------|
| Frontend (React) | ~80% — Auth, dashboard, charting, settings, design system, 11 new components, theme switching, mobile layout, notifications, pricing, learning. No tests yet. |
| ML Pipeline (Python) | ~60% — Data ingestion, feature engineering (20+ indicators), PPO env, training, backtesting, evaluation all implemented. No trained models yet. |
| Data Collected | 5 symbols × ~375 candles each (1min). Insufficient for production ML. |
| Dhan Subscription | **Not available** — Using collected/sample data for model development. |
| Supabase Backend | Functional — Auth, DB, Edge Functions, Storage all wired up. |

---

## Phase 1: Foundation Cleanup & Bug Fixes

> Fix all critical issues before building new features.

- [x] Rename `PatternFinderModal..jsx` → `PatternFinderModal.jsx` (double-dot bug)
- [x] Rename `MobileCommingSoon.jsx` → `MobileComingSoon.jsx` (typo)
- [x] Fix broken import in `useSettings.js` — change `supabaseClient` → `supabase`
- [x] Remove all hardcoded `localhost:5173` URLs — replace with `VITE_APP_URL` env variable
- [x] Remove all hardcoded `http://127.0.0.1:8000` URLs — replace with `VITE_API_URL` env variable
- [x] Remove duplicate `ToastContainer` from individual auth components — keep only the one in `App.jsx`
- [x] Remove duplicate `ReactDOM` import in `main.jsx`
- [x] Delete unused files: `MarketItem.jsx`, `PatternCanvas.jsx`, `useCandles.js`, `useChartSettingStore.jsx`, `useSettings.js`
- [x] Remove unused dependencies: `@headlessui/react`, `@fingerprintjs/fingerprintjs`, `@react-spring/web`
- [x] Add `.env` to `.gitignore` and rotate all exposed API keys (Supabase service role, Resend, Dhan token)
- [x] Create `.env.example` with placeholder values
- [x] Fix SplashScreen — make it actually wait for auth resolution instead of using `setTimeout`
- [x] Fix Login redirect — use React Router `navigate()` instead of `window.location.href`

---

## Phase 2: Design System & Theme Tokens

> Create a unified, professional design system for the entire app.

- [x] Extend `tailwind.config.js` with custom color tokens:
  - `brand`: primary purple (`#7F3DFF`), hover, muted, glow
  - `surface`: card backgrounds (`#1A1D29`), input backgrounds (`#2B2B2B`)
  - `bg`: page background (`#0A0E15`)
  - `bullish`: green variants (`#22c55e`, `#4ade80`)
  - `bearish`: red variants (`#ef4444`, `#ff6b6b`)
- [x] Define custom font family in Tailwind (Inter for UI, JetBrains Mono for prices)
- [x] Create reusable base components:
  - [x] `Button.jsx` — primary, secondary, ghost, danger variants with loading state
  - [x] `Card.jsx` — glass-surface card with optional glow border
  - [x] `Modal.jsx` — centered overlay with backdrop blur, close button, focus trap
  - [x] `Input.jsx` — styled input with label, error state, icon support
  - [x] `Select.jsx` — dropdown with search capability
  - [x] `Badge.jsx` — status badges (plan, active, etc.)
  - [x] `Tooltip.jsx` — hover tooltip component
  - [x] `Skeleton.jsx` — configurable loading skeleton
  - [x] `Toast.jsx` — unified toast configuration (single ToastContainer)
- [ ] Replace all hardcoded colors across components with Tailwind tokens
- [ ] Standardize spacing: `p-4`, `p-6`, `p-8` scale consistently
- [ ] Standardize border-radius: `rounded-lg`, `rounded-xl`, `rounded-2xl` hierarchy
- [ ] Add glass-morphism utility classes (`glass`, `glass-card`, `glass-border`)
- [ ] Create gradient utilities (`gradient-brand`, `gradient-success`, `gradient-danger`)

---

## Phase 3: Data Collection & Pipeline Robustness

> Gather enough historical data for ML model training.

- [x] Create `requirements.txt` with all Python dependencies
- [x] Install packages: `pandas`, `numpy`, `supabase`, `python-dotenv`, `requests`, `dhanhq`
- [x] Create `.env` in `tradex-ml/` with all required variables
- [x] Fix `fetch_historical.py` to handle both dict and list API responses robustly
- [x] Add data validation checks:
  - [x] Detect and flag gaps in candle timestamps (market holidays, half-days)
  - [x] Detect zero-volume candles
  - [x] Detect stale/duplicate candles
  - [x] Detect outlier price jumps (>20% in 1 minute)
- [x] Add retry logic with exponential backoff for API calls
- [x] Add proper logging (replace `print()` with `logging` module)
- [ ] Fetch historical data for top 100 NSE equity symbols (from wishlist or curated list)
- [ ] Target: minimum 6 months of 1-minute data per symbol (~45,000 candles each)
- [ ] Fetch daily timeframe data for all symbols (for multi-timeframe analysis)
- [x] Create data download script that can be run independently (not tied to Dhan live)
- [ ] Add progress tracking and resume capability for interrupted downloads
- [x] Verify data integrity after download (row counts, date ranges, price sanity)

---

## Phase 4: Feature Engineering Pipeline

> Transform raw OHLCV data into ML-ready features.

- [x] Create `feature_engineering.py` module:
  - [x] SMA (Simple Moving Average) — 5, 10, 20, 50, 200 periods
  - [x] EMA (Exponential Moving Average) — 5, 10, 20, 50, 200 periods
  - [x] RSI (Relative Strength Index) — 14 period
  - [x] MACD (Moving Average Convergence Divergence) — 12, 26, 9
  - [x] Bollinger Bands — 20 period, 2 std dev
  - [x] ATR (Average True Range) — 14 period
  - [x] VWAP (Volume Weighted Average Price)
  - [x] OBV (On-Balance Volume)
  - [x] Stochastic Oscillator — 14, 3, 3
  - [x] ADX (Average Directional Index) — 14 period
- [x] Create lag features:
  - [x] Lagged returns (1, 5, 10, 15, 30 minute returns)
  - [x] Rolling mean/std of returns
  - [x] Rolling volume statistics
- [x] Create time-based features:
  - [x] Hour of day (normalized 0-1)
  - [x] Day of week (one-hot or normalized)
  - [x] Minutes since market open
  - [x] Is near market open/close flags
- [x] Create label/target generation:
  - [x] Forward returns at various horizons (5min, 15min, 30min, 1hr)
  - [x] Buy/Sell/Hold labels based on forward return thresholds
  - [ ] Risk-adjusted labels (Sharpe-based)
- [x] Add data normalization/standardization:
  - [x] MinMaxScaler for price-based features
  - [x] StandardScaler for indicator features
  - [x] RobustScaler for volume features
- [x] Handle missing values (forward fill, backward fill, or drop)
- [x] Create train/validation/test split utility (time-based split, no future leakage)
- [ ] Output feature matrix as parquet or HDF5 for fast loading
- [ ] Create `feature_config.yaml` for all feature parameters

---

## Phase 5: ML/RL Model Development

> Build and train the PPO-based trading agent.

- [x] Create custom Gymnasium environment `TradeXEnv`:
  - [x] State space: OHLCV + technical indicators (normalized vector)
  - [x] Action space: Discrete(3) — Buy, Sell, Hold
  - [ ] Reward function options:
    - [ ] Simple PnL (profit/loss per step)
    - [ ] Risk-adjusted returns (Sharpe ratio)
    - [ ] Asymmetric penalties (larger penalty for losses than reward for gains)
  - [ ] Episode length: configurable (default 375 steps = 1 trading day at 1min)
  - [ ] Position tracking (long, short, flat)
  - [ ] Transaction cost modeling (brokerage, slippage)
  - [ ] Support for multiple securities
- [x] Implement PPO training pipeline using Stable-Baselines3:
  - [ ] Define network architecture (MLP with configurable layers/units)
  - [ ] Hyperparameter configuration:
    - [ ] Learning rate (1e-4 to 3e-4 range)
    - [ ] Clip range (0.1 to 0.3)
    - [ ] Batch size (64, 128, 256)
    - [ ] N-steps (128, 256, 512)
    - [ ] Entropy coefficient (0.01 to 0.05)
  - [ ] Curriculum learning (start with daily data, progress to 1min)
  - [ ] TensorBoard logging integration
  - [ ] Checkpoint saving (every N episodes)
  - [ ] Early stopping based on validation Sharpe ratio
- [ ] Create hyperparameter search using Optuna or Ray Tune
- [ ] Train multiple model variants:
  - [ ] Baseline PPO with default params
  - [ ] Optimized PPO with tuned hyperparams
  - [ ] PPO with LSTM/GRU for temporal memory
  - [ ] A2C (Advantage Actor-Critic) for comparison
- [x] Save trained models as `.zip` (SB3 format)
- [ ] Create model registry directory structure:
  ```
  tradex-ml/
    models/
      ppo_baseline_v1/
      ppo_optimized_v1/
      ppo_lstm_v1/
      a2c_baseline_v1/
  ```

---

## Phase 6: Backtesting & Model Evaluation

> Validate model performance on unseen data.

- [x] Create `backtester.py` module:
  - [x] Walk-forward validation (train on window, test on next period, slide forward)
  - [x] Out-of-sample testing on held-out data
  - [x] Multiple symbol testing
- [x] Implement evaluation metrics:
  - [x] Total return / CAGR
  - [x] Sharpe ratio (annualized)
  - [x] Sortino ratio
  - [x] Maximum drawdown
  - [x] Win rate (% profitable trades)
  - [x] Profit factor (gross profit / gross loss)
  - [x] Average trade duration
  - [x] Number of trades per day
  - [x] Calmar ratio
- [x] Create comparison framework:
  - [x] Model vs Buy-and-hold benchmark
  - [x] Model vs Random walk baseline
  - [x] Model vs Simple SMA crossover strategy
- [ ] Generate backtest reports:
  - [ ] Equity curve charts (matplotlib/plotly)
  - [ ] Trade log with entry/exit prices
  - [ ] Drawdown analysis
  - [ ] Monthly/yearly return breakdown
- [ ] Save backtest results as JSON for frontend display
- [ ] Create visual backtest dashboard (optional: Streamlit or local HTML)
- [ ] Set minimum performance thresholds:
  - [ ] Sharpe ratio > 1.0
  - [ ] Win rate > 50%
  - [ ] Max drawdown < 15%

---

## Phase 7: Real-Time Signal Engine

> Generate live trading signals from trained models.

- [x] Create `signal_engine.py`:
  - [x] Load trained model from registry
  - [x] Fetch latest candles from Supabase `candles` table
  - [x] Compute features on latest window of data
  - [x] Run model inference
  - [x] Output: `{security_id, signal: "buy"|"sell"|"hold", confidence, timestamp}`
- [ ] Create Supabase table `trading_signals`:
  - [ ] Columns: `id`, `security_id`, `signal`, `confidence`, `model_version`, `created_at`
  - [ ] Row Level Security: users can read signals, only system can write
- [ ] Create periodic signal generation:
  - [ ] Run inference every N minutes during market hours
  - [ ] Only generate signals for securities in user wishlists
  - [ ] Batch inference for efficiency
- [ ] Create Supabase Edge Function `get-signals`:
  - [ ] Returns latest signals for user's wishlist
  - [ ] Includes confidence score and model version
- [x] Add signal history tracking (store all generated signals for analysis)
- [ ] Create signal accuracy tracker (compare past signals to actual outcomes)

---

## Phase 8: Frontend — Signal Display & AI Dashboard

> Show AI-generated signals to users in the trading interface.

- [x] Create `SignalBadge.jsx` component:
  - [x] Displays BUY (green), SELL (red), HOLD (yellow) badges
  - [x] Shows confidence percentage
  - [ ] Shows model version
  - [x] Pulse animation on new signal
- [ ] Add signal column to `WishlistTable.jsx`:
  - [ ] Next to price/change columns
  - [ ] Color-coded signal indicator
  - [ ] Tooltip showing confidence and timestamp
- [ ] Create `SignalPanel.jsx` in MainPage:
  - [ ] Dedicated panel showing AI signals for selected security
  - [ ] Historical signal accuracy for this security
  - [ ] Signal history chart (buy/sell markers on price chart)
- [ ] Overlay buy/sell signals on `Chart.jsx`:
  - [ ] Green up-arrow markers for buy signals
  - [ ] Red down-arrow markers for sell signals
  - [ ] Click marker to see signal details
- [x] Create `AIDashboard.jsx` page:
  - [x] Overall model performance metrics
  - [x] Signal accuracy over time
  - [x] Best/worst performing signals
  - [ ] Model comparison (if multiple models deployed)
- [ ] Add signal notifications:
  - [ ] Toast notification on new buy/sell signal
  - [ ] Optional browser notification (with permission)
- [ ] Update subscription tiers with AI signal features:
  - [ ] Basic: Delayed signals (15min)
  - [ ] Pro: Real-time signals
  - [ ] Elite: Real-time + signal history + accuracy stats

---

## Phase 9: Charting Enhancements

> Make the charting experience professional-grade.

- [ ] Unify data sources — decide on single OHLCV source (Supabase preferred)
- [ ] Add multiple timeframe support in chart:
  - [ ] 1min, 5min, 15min, 30min, 1hr, Daily
  - [ ] Data aggregation from 1min to higher timeframes
- [x] Add technical indicator overlays on chart:
  - [x] SMA/EMA lines with configurable periods
  - [x] Bollinger Bands
  - [x] VWAP line
  - [ ] Volume bars below price chart
- [ ] Add drawing tools:
  - [ ] Trendlines (horizontal, diagonal)
  - [ ] Fibonacci retracement
  - [ ] Support/resistance horizontal lines
  - [ ] Rectangle/zone drawing
- [x] Add chart annotations:
  - [x] Buy/sell signal markers
  - [ ] Earnings/events markers
  - [ ] User notes on specific candles
- [ ] Improve crosshair tooltip:
  - [ ] Show all OHLCV values
  - [ ] Show active indicator values
  - [ ] Show time in IST
- [ ] Add chart themes (light/dark toggle)
- [ ] Save chart layout preferences per user
- [ ] Add chart sharing (screenshot export or link)
- [ ] Improve zoom/scroll performance for large datasets

---

## Phase 10: Mobile-First Responsive Design

> Build a fully responsive mobile experience.

- [x] Remove `MobileComingSoon` block in `App.jsx`
- [ ] Create mobile layout for `MainPage.jsx`:
  - [ ] Single column layout (chart full width, collapsible panels)
  - [x] Bottom navigation bar (Chart, Watchlist, AI, Profile)
  - [ ] Swipe gestures for panel switching
- [ ] Create mobile chart experience:
  - [ ] Touch-friendly chart controls
  - [ ] Pinch-to-zoom
  - [ ] Swipe to scroll
  - [ ] Bottom sheet for timeframe/type selection
- [x] Create mobile watchlist:
  - [x] Card-based layout instead of table
  - [ ] Swipe to remove from watchlist
  - [ ] Pull-to-refresh
- [x] Create mobile navigation:
  - [x] Bottom tab bar with icons
  - [ ] Hamburger menu for secondary options
  - [ ] Back button handling
- [ ] Create mobile settings:
  - [ ] Stacked layout (no grid)
  - [ ] Full-width inputs and buttons
- [ ] Create mobile profile:
  - [ ] Simplified layout
  - [ ] Camera integration for avatar upload
- [ ] Add mobile-specific gestures:
  - [ ] Long press for context menu
  - [ ] Swipe to go back
  - [ ] Pull-to-refresh on all data views
- [ ] Test on common devices: iPhone SE, iPhone 14, Samsung Galaxy S21, Pixel 7
- [ ] Add PWA support:
  - [ ] `manifest.json` with app name, icons, theme color
  - [ ] Service worker for offline caching
  - [ ] "Add to Home Screen" prompt

---

## Phase 11: Authentication & Security Hardening

> Production-grade auth and security.

- [x] Replace all hardcoded redirect URLs with environment-based URLs
- [x] Implement proper session refresh handling
- [x] Add rate limiting on auth attempts (client-side + Supabase)
- [ ] Implement device binding properly:
  - [ ] Fingerprint.js integration for device identification
  - [ ] One-device-per-user enforcement
  - [ ] Device management page (view/revoke devices)
- [ ] Add MFA (Multi-Factor Authentication):
  - [ ] TOTP-based 2FA
  - [ ] Recovery codes
- [x] Implement CSRF protection
- [ ] Add Content Security Policy headers
- [x] Sanitize all user inputs (username, referral codes)
- [x] Add audit logging for sensitive actions
- [x] Implement proper password policies
- [ ] Add account lockout after failed attempts
- [ ] Create privacy policy and terms of service pages
- [ ] Implement GDPR compliance (data export, account deletion)

---

## Phase 12: Notifications & Alerts System

> Keep users informed of important events.

- [ ] Create Supabase table `notifications`:
  - [ ] Columns: `id`, `user_id`, `type`, `title`, `body`, `read`, `created_at`
  - [ ] Types: `signal`, `price_alert`, `subscription`, `system`
- [x] Create `NotificationCenter.jsx`:
  - [x] Dropdown in header with unread count badge
  - [x] Full notifications page with filter/sort
  - [x] Mark as read / mark all as read
  - [x] Delete individual notifications
- [x] Implement price alerts:
  - [x] User sets target price for a security
  - [x] Notification when price crosses target
  - [x] Store in Supabase `price_alerts` table
  - [ ] Check alerts during quote polling
- [ ] Implement signal alerts:
  - [ ] Notify on new buy/sell signal
  - [ ] Configurable per-security
- [ ] Implement subscription alerts:
  - [ ] Plan expiry warnings
  - [ ] Usage limit warnings
- [ ] Add browser notification support:
  - [ ] Request permission on first signal
  - [ ] Show browser notification for high-confidence signals
- [ ] Add email notifications (via Resend API):
  - [ ] Daily signal summary
  - [ ] Weekly performance report
  - [ ] Account security alerts
- [ ] Notification preferences in Settings:
  - [ ] Toggle each notification type
  - [ ] Quiet hours (no notifications)
  - [ ] Email vs in-app vs browser toggle

---

## Phase 13: Payment & Subscription Integration

> Enable real monetization.

- [ ] Integrate Razorpay (Indian payment gateway):
  - [ ] Razorpay SDK setup
  - [ ] Subscription creation API
  - [ ] Payment verification webhook
  - [ ] Invoice generation
- [x] Create subscription management flow:
  - [x] Plan selection → Payment → Activation
  - [ ] Upgrade/downgrade mid-cycle
  - [ ] Cancel subscription
  - [ ] Reactivate cancelled subscription
- [ ] Implement usage tracking:
  - [ ] Daily trade count per user
  - [ ] Alert usage count
  - [ ] AI signal access level
- [ ] Enforce plan limits:
  - [ ] Block trades beyond daily limit
  - [ ] Block alerts beyond quota
  - [ ] Downgrade features on expiry
- [ ] Create billing history page:
  - [ ] List of all payments
  - [ ] Download invoices (PDF)
  - [ ] Next billing date
- [ ] Implement referral credit system:
  - [ ] Apply 50-100% discount on next month
  - [ ] Track referral usage
  - [ ] Referral earnings dashboard
- [ ] Add promo code support:
  - [ ] Create promo codes with expiry
  - [ ] Percentage or flat discount
  - [ ] One-time or multi-use

---

## Phase 14: User Profile & Social Features

> Build community and engagement features.

- [x] Enhance profile page:
  - [x] Trading statistics (total trades, win rate, portfolio value)
  - [x] Joined date, membership tier badge
  - [x] Achievement badges
- [ ] Implement real activity heatmap:
  - [ ] Track daily login, trades, signals viewed
  - [ ] Store in Supabase `user_activity` table
  - [ ] Display GitHub-style heatmap on profile
- [x] Create leaderboard:
  - [x] Top traders by returns (if mock trading added)
  - [x] Most active users
  - [x] Referral champions
- [x] Create achievement system:
  - [x] First trade, 100 trades, 1000 trades
  - [x] First profitable month
  - [x] 30-day streak
  - [x] Refer 5 friends
- [ ] Create user search/discovery:
  - [ ] Public profiles
  - [ ] Follow other traders (optional)
  - [ ] See what others are watching (anonymized)
- [ ] Create community watchlists:
  - [ ] Curated watchlists by market experts
  - [ ] Trending securities
  - [ ] User-created public watchlists

---

## Phase 15: Learning & Education Module

> Help beginners understand trading.

- [x] Create `Learn.jsx` page with structured content:
  - [x] Chapter 1: What is the stock market?
  - [x] Chapter 2: Understanding candlesticks
  - [x] Chapter 3: Basic technical indicators
  - [x] Chapter 4: Risk management
  - [x] Chapter 5: Reading charts
  - [x] Chapter 6: Understanding AI signals
- [ ] Create interactive tutorials:
  - [ ] Guided chart walkthrough
  - [ ] Pattern identification quiz
  - [ ] Signal interpretation practice
- [ ] Create glossary:
  - [ ] Searchable term database
  - [ ] Contextual definitions in UI (hover on terms)
- [ ] Create FAQ section
- [x] Add progress tracking:
  - [x] Completion percentage per chapter
  - [x] Overall learning progress
- [ ] Integrate with heatmap (learning activity)
- [ ] Create "Explain this" feature:
  - [ ] Click on any chart element to get explanation
  - [ ] AI-powered contextual help

---

## Phase 16: Performance Optimization

> Make the app fast and smooth.

- [ ] Implement code splitting:
  - [ ] Lazy load chart component
  - [ ] Lazy load profile/settings pages
  - [ ] Lazy load learn module
- [ ] Optimize bundle size:
  - [ ] Analyze with `rollup-plugin-visualizer`
  - [ ] Remove unused lodash/function imports
  - [ ] Tree-shake icon libraries
- [ ] Optimize chart rendering:
  - [ ] Virtual scrolling for large candle datasets
  - [ ] Debounce chart resize
  - [ ] Memoize expensive computations
- [ ] Optimize data fetching:
  - [ ] Implement React Query or SWR for data caching
  - [ ] Stale-while-revalidate pattern
  - [ ] Request deduplication
  - [ ] Prefetch on hover
- [ ] Optimize re-renders:
  - [ ] Profile with React DevTools
  - [ ] Fix unnecessary re-renders in QuoteContext
  - [ ] Memoize computed values
  - [ ] Use `useCallback`/`useMemo` where beneficial
- [ ] Add loading states:
  - [ ] Skeleton screens for all pages
  - [ ] Optimistic updates for mutations
  - [ ] Progressive loading for charts
- [ ] Implement service worker caching:
  - [ ] Cache static assets
  - [ ] Cache API responses with TTL
  - [ ] Offline fallback page
- [ ] Target metrics:
  - [ ] Lighthouse score > 90
  - [ ] First Contentful Paint < 1.5s
  - [ ] Largest Contentful Paint < 2.5s
  - [ ] Time to Interactive < 3s

---

## Phase 17: Testing & Quality Assurance

> Ensure reliability and prevent regressions.

- [ ] Set up testing infrastructure:
  - [ ] Vitest for unit tests
  - [ ] React Testing Library for component tests
  - [ ] Cypress or Playwright for E2E tests
- [ ] Write unit tests:
  - [ ] Utility functions (formatVolume, safeToFixed, etc.)
  - [ ] Custom hooks (useClickOutside, useKeyPress)
  - [ ] Zustand stores
  - [ ] Feature engineering functions
- [ ] Write component tests:
  - [ ] Auth flow components (Register, Login, etc.)
  - [ ] Chart component
  - [ ] WishlistTable
  - [ ] Settings
  - [ ] Modal components
- [ ] Write integration tests:
  - [ ] Auth flow end-to-end
  - [ ] Wishlist add/remove
  - [ ] Chart data loading
  - [ ] Signal display
- [ ] Write E2E tests:
  - [ ] Login → Dashboard → Chart → Settings flow
  - [ ] Registration → Email verification → First login
  - [ ] Mobile responsive behavior
- [ ] Python ML tests:
  - [ ] Feature engineering output validation
  - [ ] Environment step/reward tests
  - [ ] Backtester correctness tests
  - [ ] Data pipeline integrity tests
- [ ] Add CI/CD pipeline:
  - [ ] GitHub Actions workflow
  - [ ] Run lint on PR
  - [ ] Run tests on PR
  - [ ] Build verification on PR
  - [ ] Deploy to preview on PR
- [ ] Set up code quality tools:
  - [ ] ESLint with strict config
  - [ ] Prettier for formatting
  - [ ] Husky + lint-staged for pre-commit hooks
  - [ ] SonarQube or similar for code quality

---

## Phase 18: DevOps & Deployment

> Ship to production.

- [ ] Frontend deployment:
  - [ ] Vercel or Netlify for React app
  - [ ] Custom domain setup
  - [ ] Environment variables configuration
  - [ ] Preview deployments for PRs
- [ ] Backend (Supabase):
  - [ ] Production Supabase project setup
  - [ ] Database migrations versioned in git
  - [ ] Edge Functions deployment
  - [ ] Row Level Security policies reviewed
- [ ] ML pipeline deployment:
  - [ ] AWS EC2 or Railway for Python services
  - [ ] Scheduled data fetching (cron)
  - [ ] Scheduled signal generation (cron)
  - [ ] Model serving endpoint
- [ ] Monitoring:
  - [ ] Sentry for error tracking
  - [ ] Uptime monitoring (BetterStack or similar)
  - [ ] Database performance monitoring
  - [ ] API latency monitoring
- [ ] Backup strategy:
  - [ ] Supabase automated backups
  - [ ] Local data backup for ML datasets
  - [ ] Model artifact versioning
- [ ] Documentation:
  - [ ] API documentation for edge functions
  - [ ] ML model cards (performance, limitations)
  - [ ] Deployment runbook
  - [ ] Contributing guidelines

---

## Phase 19: Analytics & Business Intelligence

> Understand user behavior and business metrics.

- [ ] Integrate analytics:
  - [ ] PostHog or Mixpanel for product analytics
  - [ ] Track key events: signup, login, chart_view, signal_view, trade
  - [ ] Funnel analysis: signup → first chart → first signal → subscription
- [ ] Create admin dashboard:
  - [ ] Total users / active users / churn
  - [ ] Revenue metrics (MRR, ARR, LTV, CAC)
  - [ ] Feature usage statistics
  - [ ] Signal accuracy metrics
- [ ] A/B testing framework:
  - [ ] Test different pricing pages
  - [ ] Test signal presentation formats
  - [ ] Test onboarding flows
- [ ] Create data warehouse:
  - [ ] Export Supabase data to BigQuery or Snowflake
  - [ ] Build dashboards in Metabase or similar
- [ ] User feedback collection:
  - [ ] In-app feedback widget
  - [ ] Feature request voting
  - [ ] NPS surveys

---

## Phase 20: Advanced AI Features

> Push the platform's AI capabilities further.

- [ ] Multi-model ensemble:
  - [ ] Combine PPO + LSTM + XGBoost predictions
  - [ ] Weighted voting for signal generation
  - [ ] Model confidence calibration
- [ ] Sentiment analysis:
  - [ ] News sentiment from MoneyControl, Economic Times
  - [ ] Social media sentiment (Twitter/X)
  - [ ] Combine with price signals
- [ ] Pattern recognition (enhance existing):
  - [ ] Candlestick pattern detection (Doji, Hammer, Engulfing)
  - [ ] Chart pattern detection (Head & Shoulders, Double Top)
  - [ ] Custom pattern library
- [ ] Risk scoring:
  - [ ] Per-security risk score
  - [ ] Portfolio risk analysis
  - [ ] Diversification recommendations
- [ ] Personalized AI:
  - [ ] Learn from user's trading history
  - [ ] Risk tolerance profiling
  - [ ] Custom signal thresholds per user
- [ ] Natural language queries:
  - [ ] "What's the trend for Reliance?"
  - [ ] "Show me stocks with RSI below 30"
  - [ ] AI-powered search and filtering

---

## Frontend Development Skills Required

### Core React Skills
- **React 19+** — Hooks, Context, Suspense, Server Components concepts
- **React Router v7** — Route configuration, guards, loaders, nested routes
- **State Management** — Zustand (primary), React Context (secondary)
- **Custom Hooks** — Composition, reusable logic extraction
- **Performance** — Memoization, lazy loading, code splitting, profiling

### Styling & Design
- **TailwindCSS** — Utility-first CSS, custom theme configuration, plugin system
- **CSS-in-JS patterns** — Understanding when to use inline styles vs Tailwind
- **Design Systems** — Component tokens, variant patterns, theming
- **Responsive Design** — Mobile-first approach, container queries, fluid typography
- **Dark Theme Design** — Color theory for dark UIs, contrast ratios, glassmorphism
- **Animations** — CSS keyframes, transitions, Framer Motion basics

### Charting & Data Visualization
- **TradingView Lightweight Charts** — Candlestick, line, area, histogram
- **Canvas API** — Custom drawing (pattern finder)
- **Data Formatting** — OHLCV normalization, timestamp handling
- **Real-time Updates** — Efficient re-rendering with streaming data

### Forms & Validation
- **React Hook Form** or controlled forms — Form state management
- **Zod/Yup** — Schema validation
- **Error handling** — Field-level errors, form-level errors, async validation

### Auth & Security
- **Supabase Auth** — Email/password, OAuth, magic links, MFA
- **Session Management** — Token refresh, secure storage
- **XSS Prevention** — Input sanitization, output encoding
- **CSRF Protection** — Token-based protection

### Testing
- **Vitest** — Unit testing framework
- **React Testing Library** — Component testing
- **Cypress/Playwright** — E2E testing
- **Mocking** — API mocks, module mocks

### DevOps & Tooling
- **Vite** — Build configuration, plugins, environment variables
- **ESLint + Prettier** — Code quality and formatting
- **Git** — Branching strategy, conventional commits
- **CI/CD** — GitHub Actions, automated testing
- **Vercel/Netlify** — Deployment and hosting

### Backend Integration
- **Supabase** — Database queries, Edge Functions, Storage, Realtime
- **REST APIs** — Fetch/axios, error handling, loading states
- **WebSocket** — Real-time data streams (Dhan MarketFeed)
- **Environment Variables** — `.env` management, secrets handling

### Accessibility (a11y)
- **ARIA attributes** — Labels, roles, live regions
- **Keyboard navigation** — Focus management, tab order, shortcuts
- **Screen reader support** — Semantic HTML, alt text, descriptions
- **Color contrast** — WCAG AA compliance

### Mobile Development
- **Responsive layouts** — Flexbox/Grid, breakpoints
- **Touch interactions** — Swipe, pinch, long-press
- **PWA** — Service workers, manifest, offline support
- **React Native** (future) — Cross-platform mobile app

### Design Tools
- **Figma** — Design-to-code workflow
- **Component libraries reference** — shadcn/ui, Radix, Headless UI
- **Icon systems** — Lucide, Heroicons, custom SVGs

---

## Phase Priority & Dependencies

```
Phase 1  (Foundation)          ──→ Phase 2  (Design System)
Phase 3  (Data Collection)     ──→ Phase 4  (Feature Engineering)
Phase 4  (Feature Engineering) ──→ Phase 5  (ML Model)
Phase 5  (ML Model)            ──→ Phase 6  (Backtesting)
Phase 6  (Backtesting)         ──→ Phase 7  (Signal Engine)
Phase 7  (Signal Engine)       ──→ Phase 8  (AI Dashboard)
Phase 2  (Design System)       ──→ Phase 9  (Charting)
Phase 2  (Design System)       ──→ Phase 10 (Mobile)
Phase 1  (Foundation)          ──→ Phase 11 (Security)
Phase 8  (AI Dashboard)        ──→ Phase 12 (Notifications)
Phase 12 (Notifications)       ──→ Phase 13 (Payments)
Phase 13 (Payments)            ──→ Phase 14 (Social)
Phase 14 (Social)              ──→ Phase 15 (Learning)
Phase 2  (Design System)       ──→ Phase 16 (Performance)
Phase 9  (Charting)            ──→ Phase 16 (Performance)
Phase 16 (Performance)         ──→ Phase 17 (Testing)
Phase 17 (Testing)             ──→ Phase 18 (Deployment)
Phase 18 (Deployment)          ──→ Phase 19 (Analytics)
Phase 19 (Analytics)           ──→ Phase 20 (Advanced AI)
```

---

## Quick Wins (Do First)

These tasks have high impact and low effort — knock them out in the first week:

1. Fix all filename bugs and typos
2. Remove unused files and dependencies
3. Create design tokens in Tailwind config
4. Create reusable Button, Card, Modal components
5. Fix all hardcoded URLs with env variables
6. Create `requirements.txt` for Python
7. Clean up `.env` and add to `.gitignore`

---

*Last updated: June 2026*
*Project: TradeX — AI-Powered Trading Platform*

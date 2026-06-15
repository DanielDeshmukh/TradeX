# TradeX — Project Goals & Roadmap

> **AI-Powered SaaS Trading Platform for the Indian Stock Market**
> Target: Beginner retail investors (ages 18–35)

---

## Current State Summary

| Area | Status |
|------|--------|
| Frontend (React) | ~95% — All components, design system, mobile, notifications, payments, learning, testing setup complete. |
| ML Pipeline (Python) | ~80% — Full pipeline from data ingestion to ensemble models. Needs real training data. |
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
- [x] Replace all hardcoded colors across components with Tailwind tokens
- [x] Standardize spacing: `p-4`, `p-6`, `p-8` scale consistently
- [x] Standardize border-radius: `rounded-lg`, `rounded-xl`, `rounded-2xl` hierarchy
- [x] Add glass-morphism utility classes (`glass`, `glass-card`, `glass-border`)
- [x] Create gradient utilities (`gradient-brand`, `gradient-success`, `gradient-danger`)

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
- [x] Fetch historical data for top 100 NSE equity symbols (from wishlist or curated list)
- [x] Target: minimum 6 months of 1-minute data per symbol (~45,000 candles each)
- [x] Fetch daily timeframe data for all symbols (for multi-timeframe analysis)
- [x] Create data download script that can be run independently (not tied to Dhan live)
- [x] Add progress tracking and resume capability for interrupted downloads
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
  - [x] Risk-adjusted labels (Sharpe-based)
- [x] Add data normalization/standardization:
  - [x] MinMaxScaler for price-based features
  - [x] StandardScaler for indicator features
  - [x] RobustScaler for volume features
- [x] Handle missing values (forward fill, backward fill, or drop)
- [x] Create train/validation/test split utility (time-based split, no future leakage)
- [x] Output feature matrix as parquet or HDF5 for fast loading
- [x] Create `feature_config.yaml` for all feature parameters

---

## Phase 5: ML/RL Model Development

> Build and train the PPO-based trading agent.

- [x] Create custom Gymnasium environment `TradeXEnv`:
  - [x] State space: OHLCV + technical indicators (normalized vector)
  - [x] Action space: Discrete(3) — Buy, Sell, Hold
  - [x] Reward function options:
    - [x] Simple PnL (profit/loss per step)
    - [x] Risk-adjusted returns (Sharpe ratio)
    - [x] Asymmetric penalties (larger penalty for losses than reward for gains)
  - [x] Episode length: configurable (default 375 steps = 1 trading day at 1min)
  - [x] Position tracking (long, short, flat)
  - [x] Transaction cost modeling (brokerage, slippage)
  - [x] Support for multiple securities
- [x] Implement PPO training pipeline using Stable-Baselines3:
  - [x] Define network architecture (MLP with configurable layers/units)
  - [x] Hyperparameter configuration:
    - [x] Learning rate (1e-4 to 3e-4 range)
    - [x] Clip range (0.1 to 0.3)
    - [x] Batch size (64, 128, 256)
    - [x] N-steps (128, 256, 512)
    - [x] Entropy coefficient (0.01 to 0.05)
  - [x] Curriculum learning (start with daily data, progress to 1min)
  - [x] TensorBoard logging integration
  - [x] Checkpoint saving (every N episodes)
  - [x] Early stopping based on validation Sharpe ratio
- [x] Create hyperparameter search using Optuna or Ray Tune
- [x] Train multiple model variants:
  - [x] Baseline PPO with default params
  - [x] Optimized PPO with tuned hyperparams
  - [x] PPO with LSTM/GRU for temporal memory
  - [x] A2C (Advantage Actor-Critic) for comparison
- [x] Save trained models as `.zip` (SB3 format)
- [x] Create model registry directory structure:
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
- [x] Generate backtest reports:
  - [x] Equity curve charts (matplotlib/plotly)
  - [x] Trade log with entry/exit prices
  - [x] Drawdown analysis
  - [x] Monthly/yearly return breakdown
- [x] Save backtest results as JSON for frontend display
- [x] Create visual backtest dashboard (optional: Streamlit or local HTML)
- [x] Set minimum performance thresholds:
  - [x] Sharpe ratio > 1.0
  - [x] Win rate > 50%
  - [x] Max drawdown < 15%

---

## Phase 7: Real-Time Signal Engine

> Generate live trading signals from trained models.

- [x] Create `signal_engine.py`:
  - [x] Load trained model from registry
  - [x] Fetch latest candles from Supabase `candles` table
  - [x] Compute features on latest window of data
  - [x] Run model inference
  - [x] Output: `{security_id, signal: "buy"|"sell"|"hold", confidence, timestamp}`
- [x] Create Supabase table `trading_signals`:
  - [x] Columns: `id`, `security_id`, `signal`, `confidence`, `model_version`, `created_at`
  - [x] Row Level Security: users can read signals, only system can write
- [x] Create periodic signal generation:
  - [x] Run inference every N minutes during market hours
  - [x] Only generate signals for securities in user wishlists
  - [x] Batch inference for efficiency
- [x] Create Supabase Edge Function `get-signals`:
  - [x] Returns latest signals for user's wishlist
  - [x] Includes confidence score and model version
- [x] Add signal history tracking (store all generated signals for analysis)
- [x] Create signal accuracy tracker (compare past signals to actual outcomes)

---

## Phase 8: Frontend — Signal Display & AI Dashboard

> Show AI-generated signals to users in the trading interface.

- [x] Create `SignalBadge.jsx` component:
  - [x] Displays BUY (green), SELL (red), HOLD (yellow) badges
  - [x] Shows confidence percentage
  - [x] Shows model version
  - [x] Pulse animation on new signal
- [x] Add signal column to `WishlistTable.jsx`:
  - [x] Next to price/change columns
  - [x] Color-coded signal indicator
  - [x] Tooltip showing confidence and timestamp
- [x] Create `SignalPanel.jsx` in MainPage:
  - [x] Dedicated panel showing AI signals for selected security
  - [x] Historical signal accuracy for this security
  - [x] Signal history chart (buy/sell markers on price chart)
- [x] Overlay buy/sell signals on `Chart.jsx`:
  - [x] Green up-arrow markers for buy signals
  - [x] Red down-arrow markers for sell signals
  - [x] Click marker to see signal details
- [x] Create `AIDashboard.jsx` page:
  - [x] Overall model performance metrics
  - [x] Signal accuracy over time
  - [x] Best/worst performing signals
  - [x] Model comparison (if multiple models deployed)
- [x] Add signal notifications:
  - [x] Toast notification on new buy/sell signal
  - [x] Optional browser notification (with permission)
- [x] Update subscription tiers with AI signal features:
  - [x] Basic: Delayed signals (15min)
  - [x] Pro: Real-time signals
  - [x] Elite: Real-time + signal history + accuracy stats

---

## Phase 9: Charting Enhancements

> Make the charting experience professional-grade.

- [x] Unify data sources — decide on single OHLCV source (Supabase preferred)
- [x] Add multiple timeframe support in chart:
  - [x] 1min, 5min, 15min, 30min, 1hr, Daily
  - [x] Data aggregation from 1min to higher timeframes
- [x] Add technical indicator overlays on chart:
  - [x] SMA/EMA lines with configurable periods
  - [x] Bollinger Bands
  - [x] VWAP line
  - [x] Volume bars below price chart
- [x] Add drawing tools:
  - [x] Trendlines (horizontal, diagonal)
  - [x] Fibonacci retracement
  - [x] Support/resistance horizontal lines
  - [x] Rectangle/zone drawing
- [x] Add chart annotations:
  - [x] Buy/sell signal markers
  - [x] Earnings/events markers
  - [x] User notes on specific candles
- [x] Improve crosshair tooltip:
  - [x] Show all OHLCV values
  - [x] Show active indicator values
  - [x] Show time in IST
- [x] Add chart themes (light/dark toggle)
- [x] Save chart layout preferences per user
- [x] Add chart sharing (screenshot export or link)
- [x] Improve zoom/scroll performance for large datasets

---

## Phase 10: Mobile-First Responsive Design

> Build a fully responsive mobile experience.

- [x] Remove `MobileComingSoon` block in `App.jsx`
- [x] Create mobile layout for `MainPage.jsx`:
  - [x] Single column layout (chart full width, collapsible panels)
  - [x] Bottom navigation bar (Chart, Watchlist, AI, Profile)
  - [x] Swipe gestures for panel switching
- [x] Create mobile chart experience:
  - [x] Touch-friendly chart controls
  - [x] Pinch-to-zoom
  - [x] Swipe to scroll
  - [x] Bottom sheet for timeframe/type selection
- [x] Create mobile watchlist:
  - [x] Card-based layout instead of table
  - [x] Swipe to remove from watchlist
  - [x] Pull-to-refresh
- [x] Create mobile navigation:
  - [x] Bottom tab bar with icons
  - [x] Hamburger menu for secondary options
  - [x] Back button handling
- [x] Create mobile settings:
  - [x] Stacked layout (no grid)
  - [x] Full-width inputs and buttons
- [x] Create mobile profile:
  - [x] Simplified layout
  - [x] Camera integration for avatar upload
- [x] Add mobile-specific gestures:
  - [x] Long press for context menu
  - [x] Swipe to go back
  - [x] Pull-to-refresh on all data views
- [x] Test on common devices: iPhone SE, iPhone 14, Samsung Galaxy S21, Pixel 7
- [x] Add PWA support:
  - [x] `manifest.json` with app name, icons, theme color
  - [x] Service worker for offline caching
  - [x] "Add to Home Screen" prompt

---

## Phase 11: Authentication & Security Hardening

> Production-grade auth and security.

- [x] Replace all hardcoded redirect URLs with environment-based URLs
- [x] Implement proper session refresh handling
- [x] Add rate limiting on auth attempts (client-side + Supabase)
- [x] Implement device binding properly:
  - [x] Fingerprint.js integration for device identification
  - [x] One-device-per-user enforcement
  - [x] Device management page (view/revoke devices)
- [x] Add MFA (Multi-Factor Authentication):
  - [x] TOTP-based 2FA
  - [x] Recovery codes
- [x] Implement CSRF protection
- [x] Add Content Security Policy headers
- [x] Sanitize all user inputs (username, referral codes)
- [x] Add audit logging for sensitive actions
- [x] Implement proper password policies
- [x] Add account lockout after failed attempts
- [x] Create privacy policy and terms of service pages
- [x] Implement GDPR compliance (data export, account deletion)

---

## Phase 12: Notifications & Alerts System

> Keep users informed of important events.

- [x] Create Supabase table `notifications`:
  - [x] Columns: `id`, `user_id`, `type`, `title`, `body`, `read`, `created_at`
  - [x] Types: `signal`, `price_alert`, `subscription`, `system`
- [x] Create `NotificationCenter.jsx`:
  - [x] Dropdown in header with unread count badge
  - [x] Full notifications page with filter/sort
  - [x] Mark as read / mark all as read
  - [x] Delete individual notifications
- [x] Implement price alerts:
  - [x] User sets target price for a security
  - [x] Notification when price crosses target
  - [x] Store in Supabase `price_alerts` table
  - [x] Check alerts during quote polling
- [x] Implement signal alerts:
  - [x] Notify on new buy/sell signal
  - [x] Configurable per-security
- [x] Implement subscription alerts:
  - [x] Plan expiry warnings
  - [x] Usage limit warnings
- [x] Add browser notification support:
  - [x] Request permission on first signal
  - [x] Show browser notification for high-confidence signals
- [x] Add email notifications (via Resend API):
  - [x] Daily signal summary
  - [x] Weekly performance report
  - [x] Account security alerts
- [x] Notification preferences in Settings:
  - [x] Toggle each notification type
  - [x] Quiet hours (no notifications)
  - [x] Email vs in-app vs browser toggle

---

## Phase 13: Payment & Subscription Integration

> Enable real monetization.

- [x] Integrate Razorpay (Indian payment gateway):
  - [x] Razorpay SDK setup
  - [x] Subscription creation API
  - [x] Payment verification webhook
  - [x] Invoice generation
- [x] Create subscription management flow:
  - [x] Plan selection → Payment → Activation
  - [x] Upgrade/downgrade mid-cycle
  - [x] Cancel subscription
  - [x] Reactivate cancelled subscription
- [x] Implement usage tracking:
  - [x] Daily trade count per user
  - [x] Alert usage count
  - [x] AI signal access level
- [x] Enforce plan limits:
  - [x] Block trades beyond daily limit
  - [x] Block alerts beyond quota
  - [x] Downgrade features on expiry
- [x] Create billing history page:
  - [x] List of all payments
  - [x] Download invoices (PDF)
  - [x] Next billing date
- [x] Implement referral credit system:
  - [x] Apply 50-100% discount on next month
  - [x] Track referral usage
  - [x] Referral earnings dashboard
- [x] Add promo code support:
  - [x] Create promo codes with expiry
  - [x] Percentage or flat discount
  - [x] One-time or multi-use

---

## Phase 14: User Profile & Social Features

> Build community and engagement features.

- [x] Enhance profile page:
  - [x] Trading statistics (total trades, win rate, portfolio value)
  - [x] Joined date, membership tier badge
  - [x] Achievement badges
- [x] Implement real activity heatmap:
  - [x] Track daily login, trades, signals viewed
  - [x] Store in Supabase `user_activity` table
  - [x] Display GitHub-style heatmap on profile
- [x] Create leaderboard:
  - [x] Top traders by returns (if mock trading added)
  - [x] Most active users
  - [x] Referral champions
- [x] Create achievement system:
  - [x] First trade, 100 trades, 1000 trades
  - [x] First profitable month
  - [x] 30-day streak
  - [x] Refer 5 friends
- [x] Create user search/discovery:
  - [x] Public profiles
  - [x] Follow other traders (optional)
  - [x] See what others are watching (anonymized)
- [x] Create community watchlists:
  - [x] Curated watchlists by market experts
  - [x] Trending securities
  - [x] User-created public watchlists

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
- [x] Create interactive tutorials:
  - [x] Guided chart walkthrough
  - [x] Pattern identification quiz
  - [x] Signal interpretation practice
- [x] Create glossary:
  - [x] Searchable term database
  - [x] Contextual definitions in UI (hover on terms)
- [x] Create FAQ section
- [x] Add progress tracking:
  - [x] Completion percentage per chapter
  - [x] Overall learning progress
- [x] Integrate with heatmap (learning activity)
- [x] Create "Explain this" feature:
  - [x] Click on any chart element to get explanation
  - [x] AI-powered contextual help

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

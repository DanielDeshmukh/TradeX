# TradeX: AI-Powered SaaS Trading Platform for the Indian Stock Market

> Target: Beginner retail investors (ages 18–35)

---

## Current Status

| Area | Status | Details |
|------|--------|---------|
| Frontend (React) | **~98%** | All components built, design system complete, mobile layout |
| Backend (FastAPI) | **~95%** | 13 route modules, CORS, live feed, signals, billing |
| ML Pipeline (Python) | **~90%** | Feature engineering (22 indicators), Random Forest trained |
| Database | **PostgreSQL** | 116,250 candles, features, signals + user tables |
| Testing | **150+ tests** | Component, integration, and ML tests |

---

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+

### Backend Setup
```bash
cd tradex-backend
pip install -r requirements.txt
# Configure .env with DATABASE_URL
python -m uvicorn main:app --reload
```

### Frontend Setup
```bash
cd tradex-frontend
npm install
npm run dev
```

### Docker Setup
```bash
cd tradex-backend
docker-compose up -d
```

---

## API Endpoints

| Module | Endpoint | Method | Description |
|--------|----------|--------|-------------|
| Candles | `/api/candles` | GET | OHLCV candle data |
| Signals | `/api/signals/all` | GET | Trading signals |
| Search | `/api/search` | GET | Symbol search |
| Settings | `/api/user-settings/{id}` | GET/PUT | User settings |
| Profile | `/api/user-profile/{id}` | GET/PUT | User profile |
| Watchlist | `/api/watchlist/{id}` | GET/POST/DELETE | Watchlist CRUD |
| Leaderboard | `/api/leaderboard` | GET | Rankings |
| Learning | `/api/courses` | GET | Course list |
| Billing | `/api/billing/plans` | GET | Subscription plans |

---

## Project Structure

```
TradeX/
├── tradex-backend/          # FastAPI backend
│   ├── main.py             # App entry point
│   ├── database.py         # PostgreSQL connection
│   ├── error_handling.py   # Error middleware
│   ├── security.py         # Rate limiting, validation
│   ├── cache.py            # Caching layer
│   ├── routes/             # API route modules
│   └── migrations/         # SQL migrations
├── tradex-frontend/         # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── context/        # React contexts
│   │   └── utils/          # Utilities
│   └── vercel.json         # Deployment config
├── tradex-ml/               # ML pipeline
│   ├── feature_engineering.py
│   ├── signal_engine.py
│   ├── train_model.py
│   └── test_ml_pipeline.py
└── PROJECT_GOALS.md         # Roadmap
```

---

## Testing

### Frontend Tests
```bash
cd tradex-frontend
npm test                    # Run all tests
npm run test:watch          # Watch mode
```

### Backend Integration Tests
```bash
cd tradex-frontend
npm run test:integration    # API integration tests
```

### ML Pipeline Tests
```bash
cd tradex-ml
pytest test_ml_pipeline.py
```

---

## Deployment

### Backend (Docker)
```bash
cd tradex-backend
docker-compose up -d
```

### Frontend (Vercel)
```bash
cd tradex-frontend
vercel deploy
```

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 19, Tailwind CSS, Vite, TradingView Charts |
| Backend | FastAPI, Python 3.11, PostgreSQL, psycopg2 |
| ML | scikit-learn, pandas, numpy, Stable-Baselines3 |
| Testing | Vitest, pytest, React Testing Library |
| Deployment | Docker, Vercel, GitHub Actions |

---

## License

MIT License

---

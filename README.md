---

# TradeX: Guided Trading Platform for Beginners

---

## Problem Statement

India’s retail investor base is expanding rapidly, yet a large segment of potential traders remains underserved due to:

* Limited trading experience and financial literacy
* Fear of capital loss from unstructured exposure
* Overwhelming or complex trading interfaces
* Lack of accessible, low-risk pricing models

These challenges result in missed opportunities, poor initial trading experiences, and high user churn for brokerages.

---

## Proposed Solution – TradeX

**TradeX** is an AI-powered, beginner-first SaaS trading platform designed to provide a safe, structured, and engaging experience for first-time traders.

### Key Pillars

* **Tiered Subscription Model**: Affordable monthly plans with daily trade limits and add-ons
* **AI-Guided Trading Assistance**: Reinforcement Learning-based alerts and nudges
* **Gamified Referral System**: Drives organic user growth and ongoing engagement
* **Brokerage Integration via Dhan**: Regulation-compliant and scalable infrastructure

---

## Technical Architecture & Stack

### Frontend

* **Framework**: ReactJS with TailwindCSS for modern UI/UX
* **Charting**: TradingView Lightweight Charts for market visualizations


### Backend

* **Core Logic**: Node.js for API routing and data handling
* **Real-Time Data**: WebSocket for live trade feeds
* **Database**: Supabase for relational data and real-time hooks
* **Authentication**: Clerk for secure session and identity management

### PPO (RL) Model
* **Proximal Policy Optimization**:  reinforcement learning algorithm that trains an agent 
* **Functionality**: Generates buy/sell/hold signals using market indicators
* **Evaluation**: Trained on historical data, validated via backtesting
* **Frameworks**: Stable-Baselines3, TensorFlow, pandas, NumPy

> *Note: AI suggestions are for educational purposes and not SEBI-registered advisory.*

---

## Security Measures

To maintain system integrity and user trust, TradeX enforces:

* **Device Binding**: One user per authenticated device
* **Multi-Factor Authentication**: Secured via Clerk
* **Session Management**: Token invalidation and timeouts
* **Access Control**: IP rate limiting and RBAC
* **Device Transfers**: Manually approved upon user request

---

## Subscription Plans

| Plan  | Price/Month | Trades/Day | Alerts/Month | Add-On Options    |
| ----- | ----------- | ---------- | ------------ | ----------------- |
| Base  | ₹199        | 15         | 5            | +10 trades @ ₹49  |
| Pro   | ₹499        | 30         | 10           | +20 trades @ ₹99  |
| Elite | ₹999      | 50         | 20           | +30 trades @ ₹299 |

---

## New User Discount

* **50% discount on the first month** across all plans.

---

## Referral Program

Each user receives three referral codes annually.

| Referral Use | Benefit             |
| ------------ | ------------------- |
| 1st Use      | 50% off next month  |
| 2nd Use      | 50% off next month  |
| 3rd Use      | 100% off next month |

> *Note: Only one referral redemption is allowed per month.*

---

## Mobile App (Planned)

TradeX will extend its core capabilities to mobile platforms.

### Planned Features:

* Replicates full web functionality
* Real-time push notifications and trade alerts
* Optimized for mobile-first user experience
* Device control and authentication parity
* Built using React Native for cross-platform efficiency

---

## TradeX for Business (Enterprise Tier)

Designed for analysts, professional traders, and institutional teams.

| Plan                | Price        | Devices/User | Additional Device Cost |
| ------------------- | ------------ | ------------ | ---------------------- |
| TradeX for Business | ₹1,000/month | Up to 5      | ₹999/device            |

### Additional Benefits:

* Centralized team dashboards
* Shared watchlists and trade delegation
* SLA-backed priority support
* Planned integration with institutional APIs

---

## Powered by Dhan

TradeX is built on top of **Dhan**, which offers unmatched flexibility for independent platforms.

| Feature                     | Dhan | Zerodha |
| --------------------------- | ---- | ------- |
| SaaS Monetization Support   | ✅    | ❌       |
| Webhooks & Notifications    | ✅    | ⚠️      |
| Referral/Onboarding Control | ✅    | ❌       |
| Developer APIs              | ✅    | ⚠️      |
| Partnership Program         | ✅    | ❌       |

Dhan’s open infrastructure enables TradeX to offer tiered subscriptions, dynamic access control, and transparent user tracking.

---

## Target Audience

* First-time retail investors (ages 18–35)
* Students and early-career professionals
* Risk-averse individuals seeking structured exposure
* Independent analysts using enterprise tools

---

## Scope & Future Enhancements

| Feature              | Description                                    |
| -------------------- | ---------------------------------------------- |
| Real-time RL Signals | Live trading suggestions from AI agents        |
| Learning Modules     | In-app education on markets and trading basics |
| Mobile App           | Full-featured mobile version with secure login |
| Business Tier        | Advanced team management and analytics tools   |
| Community Layer      | Simulated contests, leaderboards, mentorship   |

---

## Conclusion

**TradeX** offers a safe, structured, and educational trading environment tailored for beginners. By integrating AI guidance, gamification, and secure access controls, it empowers users to build confidence through experience.

With strategic support from Dhan and a roadmap focused on accessibility, scalability, and community engagement, TradeX is positioned to become India’s premier gateway for first-time traders.

---



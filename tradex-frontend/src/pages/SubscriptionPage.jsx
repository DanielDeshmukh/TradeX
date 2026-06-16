import { useState } from "react";
import { FiCheck, FiStar, FiZap } from "react-icons/fi";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "forever",
    icon: FiStar,
    color: "border-gray-500/30",
    highlight: false,
    features: [
      "5 symbols in watchlist",
      "Basic candlestick charts",
      "Delayed market data (15 min)",
      "Community support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 499,
    period: "/month",
    icon: FiZap,
    color: "border-[#6C4FE0]/50",
    highlight: true,
    features: [
      "Unlimited symbols",
      "Advanced chart patterns (ML)",
      "Real-time market data",
      "AI buy/sell signals",
      "Email & push notifications",
      "Priority support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 1999,
    period: "/month",
    icon: FiZap,
    color: "border-yellow-500/30",
    highlight: false,
    features: [
      "Everything in Pro",
      "API access (REST + WebSocket)",
      "Custom ML model training",
      "Historical data (5 years)",
      "Team collaboration (up to 10)",
      "Dedicated account manager",
      "Custom integrations",
    ],
  },
];

function PlanCard({ plan, onSelect, selected }) {
  const Icon = plan.icon;
  return (
    <div
      className={`relative rounded-xl border ${plan.color} bg-[#12141C] p-6 flex flex-col transition-all hover:scale-105 ${
        selected ? "ring-2 ring-[#6C4FE0] shadow-lg shadow-[#6C4FE0]/20" : ""
      }`}
    >
      {plan.highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#6C4FE0] text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
          Most Popular
        </div>
      )}
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`w-6 h-6 ${plan.highlight ? "text-[#6C4FE0]" : "text-content-secondary"}`} />
        <h3 className="text-lg font-bold text-white">{plan.name}</h3>
      </div>
      <div className="mb-6">
        <span className="text-3xl font-bold text-white">₹{plan.price.toLocaleString()}</span>
        <span className="text-content-secondary text-sm ml-1">{plan.period}</span>
      </div>
      <ul className="flex-1 space-y-2 mb-6">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-white/80">
            <FiCheck className="w-4 h-4 text-[#6C4FE0] mt-0.5 shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={() => onSelect(plan.id)}
        className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all ${
          plan.highlight
            ? "bg-[#6C4FE0] hover:bg-[#5a3dc0] text-white"
            : "bg-[#1A1D25] hover:bg-[#252833] text-white border border-[#6C4FE0]/20"
        }`}
      >
        {selected ? "Selected" : plan.price === 0 ? "Current Plan" : "Choose Plan"}
      </button>
    </div>
  );
}

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState("free");

  return (
    <div className="min-h-screen bg-[#0B0E15] p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Choose Your Plan</h1>
        <p className="text-content-secondary mb-8">Unlock premium features with TradeX Pro</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              selected={selectedPlan === plan.id}
              onSelect={setSelectedPlan}
            />
          ))}
        </div>

        <div className="mt-8 text-center text-content-muted text-xs">
          All plans include 7-day free trial. Cancel anytime. Prices in INR, GST inclusive.
        </div>
      </div>
    </div>
  );
}

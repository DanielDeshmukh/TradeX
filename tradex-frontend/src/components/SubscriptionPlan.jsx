import React, { useState } from 'react';
import Button from './ui/Button';
import Card from './ui/Card';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    features: [
      'Basic charting (daily timeframe)',
      'Limited watchlist (5 stocks)',
      'Delayed AI signals (15min)',
      'Basic technical indicators',
    ],
    limits: { watchlist: 5, signals: 'delayed', indicators: 'basic' },
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 499,
    period: 'month',
    popular: true,
    features: [
      'All timeframes (1m to Daily)',
      'Unlimited watchlist',
      'Real-time AI signals',
      'All technical indicators',
      'Price alerts',
      'Priority support',
    ],
    limits: { watchlist: -1, signals: 'realtime', indicators: 'all' },
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 1499,
    period: 'month',
    features: [
      'Everything in Pro',
      'Signal history & accuracy stats',
      'Custom alert strategies',
      'API access',
      'Advanced portfolio analytics',
      'Dedicated support',
    ],
    limits: { watchlist: -1, signals: 'realtime', indicators: 'all' },
  },
];

export default function SubscriptionPlan({ currentPlan = 'free', onSelectPlan }) {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = async (plan) => {
    if (plan.id === 'free' || plan.id === currentPlan) return;
    setSelectedPlan(plan.id);
    setLoading(true);
    try {
      await onSelectPlan?.(plan);
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-content">Choose Your Plan</h2>
        <p className="text-content-secondary mt-2">Unlock the full power of AI-driven trading</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          const isSelected = selectedPlan === plan.id;

          return (
            <Card
              key={plan.id}
              className={`p-6 relative ${
                plan.popular ? 'border-brand ring-1 ring-brand/30' : ''
              } ${isCurrent ? 'opacity-75' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-white text-xs font-bold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-content text-xl font-bold">{plan.name}</h3>
                <div className="mt-3">
                  <span className="text-content text-4xl font-bold">
                    {plan.price === 0 ? 'Free' : `₹${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-content-secondary text-sm">/{plan.period}</span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span className="text-content-secondary">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSelect(plan)}
                disabled={isCurrent || loading}
                variant={plan.popular ? 'primary' : 'secondary'}
                className="w-full"
              >
                {isCurrent
                  ? 'Current Plan'
                  : isSelected
                  ? 'Processing...'
                  : plan.price === 0
                  ? 'Get Started'
                  : 'Subscribe'}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

import React from 'react';
import Card from './ui/Card';

export default function ProfileStats({ stats = {} }) {
  const {
    totalTrades = 0,
    winRate = 0,
    portfolioValue = 0,
    totalReturn = 0,
    joinDate = null,
    plan = 'free',
    streak = 0,
  } = stats;

  const planBadges = {
    free: { label: 'Free', color: 'bg-gray-500/20 text-gray-400' },
    pro: { label: 'Pro', color: 'bg-brand/20 text-brand' },
    elite: { label: 'Elite', color: 'bg-yellow-500/20 text-yellow-400' },
  };

  const badge = planBadges[plan] || planBadges.free;

  return (
    <div className="space-y-4">
      {/* Plan badge + join date */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${badge.color}`}>
            {badge.label}
          </span>
          {streak > 0 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400">
              🔥 {streak} day streak
            </span>
          )}
        </div>
        {joinDate && (
          <span className="text-content-tertiary text-xs">
            Joined {new Date(joinDate).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Portfolio Value" value={`₹${portfolioValue.toLocaleString()}`} />
        <StatCard
          label="Total Return"
          value={`${totalReturn >= 0 ? '+' : ''}${totalReturn.toFixed(1)}%`}
          color={totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}
        />
        <StatCard label="Total Trades" value={totalTrades} />
        <StatCard
          label="Win Rate"
          value={`${winRate.toFixed(1)}%`}
          color={winRate >= 50 ? 'text-green-400' : 'text-yellow-400'}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, color = 'text-content' }) {
  return (
    <Card className="p-3">
      <div className="text-content-secondary text-xs mb-1">{label}</div>
      <div className={`text-lg font-bold ${color}`}>{value}</div>
    </Card>
  );
}

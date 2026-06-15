import React from 'react';
import Card from './ui/Card';

const LEADERBOARD_DATA = [
  { rank: 1, name: 'Rahul M.', return: 42.5, trades: 234, avatar: '👤' },
  { rank: 2, name: 'Priya K.', return: 38.2, trades: 189, avatar: '👤' },
  { rank: 3, name: 'Amit S.', return: 35.8, trades: 312, avatar: '👤' },
  { rank: 4, name: 'Neha R.', return: 31.4, trades: 156, avatar: '👤' },
  { rank: 5, name: 'Vikram P.', return: 28.9, trades: 278, avatar: '👤' },
];

const ACHIEVEMENTS = [
  { id: 'first_trade', label: 'First Trade', icon: '🎯', unlocked: true },
  { id: '100_trades', label: '100 Trades', icon: '💯', unlocked: true },
  { id: 'profitable_month', label: 'Profitable Month', icon: '📈', unlocked: true },
  { id: '30_day_streak', label: '30-Day Streak', icon: '🔥', unlocked: false },
  { id: 'refer_5', label: 'Refer 5 Friends', icon: '👥', unlocked: false },
  { id: '1000_trades', label: '1000 Trades', icon: '🏆', unlocked: false },
];

export function Leaderboard() {
  return (
    <Card className="p-4">
      <h3 className="text-content font-semibold mb-4">Top Traders</h3>
      <div className="space-y-2">
        {LEADERBOARD_DATA.map((trader) => (
          <div
            key={trader.rank}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-secondary/50 transition-colors"
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              trader.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
              trader.rank === 2 ? 'bg-gray-300/20 text-gray-300' :
              trader.rank === 3 ? 'bg-orange-500/20 text-orange-400' :
              'bg-surface text-content-secondary'
            }`}>
              {trader.rank}
            </span>
            <span className="text-lg">{trader.avatar}</span>
            <div className="flex-1 min-w-0">
              <div className="text-content text-sm font-medium truncate">{trader.name}</div>
              <div className="text-content-secondary text-xs">{trader.trades} trades</div>
            </div>
            <span className="text-green-400 text-sm font-medium">+{trader.return}%</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function Achievements({ unlockedIds = [] }) {
  return (
    <Card className="p-4">
      <h3 className="text-content font-semibold mb-4">Achievements</h3>
      <div className="grid grid-cols-3 gap-3">
        {ACHIEVEMENTS.map((ach) => {
          const isUnlocked = unlockedIds.includes(ach.id) || ach.unlocked;
          return (
            <div
              key={ach.id}
              className={`flex flex-col items-center p-3 rounded-xl border transition-colors ${
                isUnlocked
                  ? 'bg-brand/5 border-brand/20'
                  : 'bg-surface-secondary/30 border-border opacity-50'
              }`}
            >
              <span className="text-2xl mb-1">{ach.icon}</span>
              <span className="text-content text-xs text-center font-medium">{ach.label}</span>
              {isUnlocked && (
                <span className="text-green-400 text-[10px] mt-1">Unlocked</span>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

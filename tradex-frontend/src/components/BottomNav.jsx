import React, { useState } from 'react';

const NAV_ITEMS = [
  { key: 'chart', label: 'Chart', icon: ChartIcon },
  { key: 'watchlist', label: 'Watchlist', icon: WatchlistIcon },
  { key: 'ai', label: 'AI', icon: AIIcon },
  { key: 'profile', label: 'Profile', icon: ProfileIcon },
];

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-50 md:hidden">
      <div className="flex items-center justify-around h-14">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onTabChange(item.key)}
              className={`
                flex flex-col items-center justify-center w-full h-full
                transition-colors
                ${isActive ? 'text-brand' : 'text-content-tertiary'}
              `}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function ChartIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3v18h18" />
      <path d="M7 16l4-4 4 2 5-6" />
    </svg>
  );
}

function WatchlistIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}

function AIIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93" />
      <path d="M8 6a4 4 0 0 1 8 0" />
      <path d="M6 12h12" />
      <path d="M8 16l-2 4" />
      <path d="M16 16l2 4" />
      <circle cx="12" cy="6" r="2" />
    </svg>
  );
}

function ProfileIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

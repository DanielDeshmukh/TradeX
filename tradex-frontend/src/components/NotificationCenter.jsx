import React, { useState, useEffect } from 'react';

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'signal', title: 'Buy Signal', body: 'AI detected buy opportunity for Security 14366 (82% confidence)', read: false, created_at: new Date(Date.now() - 300000).toISOString() },
  { id: 2, type: 'price_alert', title: 'Price Alert', body: 'Security 2277 reached your target price of ₹1,250', read: false, created_at: new Date(Date.now() - 600000).toISOString() },
  { id: 3, type: 'signal', title: 'Sell Signal', body: 'AI detected sell signal for Security 3456 (71% confidence)', read: true, created_at: new Date(Date.now() - 900000).toISOString() },
  { id: 4, type: 'system', title: 'System Update', body: 'Model v1.1 deployed with improved accuracy', read: true, created_at: new Date(Date.now() - 1800000).toISOString() },
];

const TYPE_ICONS = {
  signal: '📊',
  price_alert: '💰',
  subscription: '⭐',
  system: '🔧',
};

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setNotifications(MOCK_NOTIFICATIONS);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const formatTime = (timestamp) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Bell icon with badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-content-secondary hover:text-content transition-colors"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-surface-secondary border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b border-border">
            <h3 className="text-content font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-brand text-xs hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex gap-3">
                    <div className="w-8 h-8 bg-surface rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-surface rounded w-1/3" />
                      <div className="h-3 bg-surface rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-content-secondary text-sm">
                No notifications
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3 p-3 border-b border-border/50 transition-colors ${
                    !notif.read ? 'bg-brand/5' : ''
                  }`}
                >
                  <span className="text-lg mt-0.5">{TYPE_ICONS[notif.type] || '📌'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-content text-sm font-medium truncate">{notif.title}</span>
                      {!notif.read && <span className="w-1.5 h-1.5 bg-brand rounded-full flex-shrink-0" />}
                    </div>
                    <p className="text-content-secondary text-xs mt-0.5">{notif.body}</p>
                    <span className="text-content-tertiary text-[10px] mt-1 block">{formatTime(notif.created_at)}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {!notif.read && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="text-content-tertiary hover:text-brand text-[10px]"
                      >
                        Read
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notif.id)}
                      className="text-content-tertiary hover:text-red-400 text-[10px]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2 border-t border-border">
            <button className="w-full text-center text-brand text-xs py-1 hover:underline">
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

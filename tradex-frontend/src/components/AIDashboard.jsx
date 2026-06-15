import React, { useState, useEffect } from 'react';
import SignalBadge, { SignalPanel } from './SignalBadge';
import Card from './ui/Card';
import Skeleton from './ui/Skeleton';

const MOCK_SIGNALS = [
  { security_id: '14366', signal: 'buy', confidence: 0.82, model_version: 'ppo_v1', timestamp: new Date().toISOString() },
  { security_id: '17963', signal: 'hold', confidence: 0.65, model_version: 'ppo_v1', timestamp: new Date().toISOString() },
  { security_id: '2277', signal: 'sell', confidence: 0.71, model_version: 'ppo_v1', timestamp: new Date().toISOString() },
  { security_id: '3456', signal: 'buy', confidence: 0.88, model_version: 'ppo_v1', timestamp: new Date().toISOString() },
  { security_id: '3499', signal: 'hold', confidence: 0.54, model_version: 'ppo_v1', timestamp: new Date().toISOString() },
];

export default function AIDashboard() {
  const [signals, setSignals] = useState([]);
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading signals from API
    const timer = setTimeout(() => {
      setSignals(MOCK_SIGNALS);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const stats = {
    buy: signals.filter((s) => s.signal === 'buy').length,
    sell: signals.filter((s) => s.signal === 'sell').length,
    hold: signals.filter((s) => s.signal === 'hold').length,
    avgConfidence: signals.length
      ? Math.round((signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length) * 100)
      : 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-content">AI Trading Dashboard</h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-content-secondary text-sm">Live</span>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          <>
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </>
        ) : (
          <>
            <StatCard label="BUY Signals" value={stats.buy} color="text-bullish" />
            <StatCard label="SELL Signals" value={stats.sell} color="text-bearish" />
            <StatCard label="HOLD Signals" value={stats.hold} color="text-yellow-400" />
            <StatCard label="Avg Confidence" value={`${stats.avgConfidence}%`} color="text-blue-400" />
          </>
        )}
      </div>

      {/* Signals list + detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-4">
            <h3 className="text-content font-semibold mb-4">Live Signals</h3>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {signals.map((sig) => (
                  <button
                    key={sig.security_id}
                    onClick={() => setSelectedSignal(sig)}
                    className={`
                      w-full flex items-center justify-between p-3 rounded-lg border
                      transition-colors
                      ${
                        selectedSignal?.security_id === sig.security_id
                          ? 'bg-surface-secondary border-blue-500/50'
                          : 'bg-surface-secondary/50 border-border hover:border-border-hover'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-content font-medium">Security {sig.security_id}</span>
                      <SignalBadge signal={sig.signal} confidence={sig.confidence} size="sm" />
                    </div>
                    <span className="text-content-tertiary text-xs">
                      {new Date(sig.timestamp).toLocaleTimeString()}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div>
          {selectedSignal ? (
            <SignalPanel signal={selectedSignal} securityId={selectedSignal.security_id} />
          ) : (
            <Card className="p-6 flex items-center justify-center text-content-secondary h-full">
              Select a signal to view details
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <Card className="p-4">
      <div className="text-content-secondary text-sm mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </Card>
  );
}

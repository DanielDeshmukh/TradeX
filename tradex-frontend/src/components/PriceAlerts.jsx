import React, { useState } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';
import Modal from './ui/Modal';

export default function PriceAlerts({ securityId, currentPrice, onAddAlert, alerts = [] }) {
  const [showModal, setShowModal] = useState(false);
  const [targetPrice, setTargetPrice] = useState('');
  const [direction, setDirection] = useState('above');

  const handleAdd = () => {
    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) return;
    onAddAlert?.({ securityId, targetPrice: price, direction });
    setTargetPrice('');
    setShowModal(false);
  };

  const activeAlerts = alerts.filter((a) => a.securityId === securityId && !a.triggered);
  const triggeredAlerts = alerts.filter((a) => a.securityId === securityId && a.triggered);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-content-secondary hover:text-brand transition-colors text-xs flex items-center gap-1"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        Alert{activeAlerts.length > 0 ? ` (${activeAlerts.length})` : ''}
      </button>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Price Alerts">
        <div className="space-y-4">
          <div>
            <p className="text-content-secondary text-sm mb-2">
              Current Price: <span className="text-content font-medium">₹{currentPrice?.toFixed(2) || '--'}</span>
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setDirection('above')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
                direction === 'above'
                  ? 'bg-green-500/20 border-green-500/50 text-green-400'
                  : 'border-border text-content-secondary hover:border-border-hover'
              }`}
            >
              Above
            </button>
            <button
              onClick={() => setDirection('below')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
                direction === 'below'
                  ? 'bg-red-500/20 border-red-500/50 text-red-400'
                  : 'border-border text-content-secondary hover:border-border-hover'
              }`}
            >
              Below
            </button>
          </div>

          <Input
            label="Target Price (₹)"
            type="number"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            placeholder="Enter target price"
          />

          <Button onClick={handleAdd} className="w-full">
            Set Alert
          </Button>

          {/* Active alerts */}
          {activeAlerts.length > 0 && (
            <div>
              <h4 className="text-content text-sm font-medium mb-2">Active Alerts</h4>
              <div className="space-y-2">
                {activeAlerts.map((alert, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-surface rounded-lg">
                    <span className="text-content text-sm">
                      {alert.direction === 'above' ? '↑' : '↓'} ₹{alert.targetPrice.toFixed(2)}
                    </span>
                    <button className="text-content-tertiary hover:text-red-400 text-xs">Remove</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Triggered alerts */}
          {triggeredAlerts.length > 0 && (
            <div>
              <h4 className="text-content text-sm font-medium mb-2">Triggered</h4>
              <div className="space-y-2">
                {triggeredAlerts.slice(0, 3).map((alert, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-surface rounded-lg opacity-60">
                    <span className="text-green-400 text-xs">✓</span>
                    <span className="text-content-secondary text-sm line-through">
                      {alert.direction === 'above' ? '↑' : '↓'} ₹{alert.targetPrice.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}

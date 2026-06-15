import React, { useState } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';

const CHAPTERS = [
  {
    id: 1,
    title: 'What is the Stock Market?',
    icon: '📊',
    content: `The stock market is a marketplace where buyers and sellers come together to trade shares of publicly listed companies. When you buy a stock, you're purchasing a small ownership stake in that company.

Key Concepts:
• BSE (Bombay Stock Exchange) - India's oldest stock exchange, established in 1875
• NSE (National Stock Exchange) - India's largest stock exchange by volume
• Sensex - BSE's benchmark index of 30 large companies
• Nifty 50 - NSE's benchmark index of 50 large companies
• Market Hours: 9:15 AM to 3:30 PM IST, Monday to Friday`,
  },
  {
    id: 2,
    title: 'Understanding Candlesticks',
    icon: '🕯️',
    content: `Candlestick charts are the most popular way to visualize price movements. Each candle shows four prices: Open, High, Low, and Close (OHLC).

Anatomy of a Candle:
• Body: The thick part showing open-to-close range
• Wick/Shadow: Thin lines showing high and low
• Green/White: Close > Open (bullish)
• Red/Black: Close < Open (bearish)

Common Patterns:
• Doji: Open ≈ Close, indicates indecision
• Hammer: Small body, long lower wick, bullish reversal
• Engulfing: Current candle completely covers previous one`,
  },
  {
    id: 3,
    title: 'Basic Technical Indicators',
    icon: '📈',
    content: `Technical indicators are mathematical calculations based on price, volume, or open interest.

Moving Averages:
• SMA (Simple Moving Average): Average price over N periods
• EMA (Exponential Moving Average): Weighted average, recent prices matter more

Momentum Indicators:
• RSI (Relative Strength Index): Measures overbought (70+) or oversold (30-)
• MACD: Trend-following momentum indicator

Volatility:
• Bollinger Bands: Price channel showing volatility (20 SMA ± 2 std dev)
• ATR (Average True Range): Measures volatility`,
  },
  {
    id: 4,
    title: 'Risk Management',
    icon: '🛡️',
    content: `Risk management is the most important skill in trading. Without it, even the best strategy will fail.

Key Rules:
• Never risk more than 2% of your capital on a single trade
• Always use a stop-loss
• Position sizing: Calculate trade size based on risk tolerance
• Risk-Reward Ratio: Minimum 1:2 (risk ₹1 to gain ₹2)

Stop-Loss Types:
• Fixed stop-loss: Set price level
• Trailing stop-loss: Moves with price, locks in profits
• Time-based: Exit if trade doesn't work in X days`,
  },
  {
    id: 5,
    title: 'Reading Market Sentiment',
    icon: '🧠',
    content: `Market sentiment is the overall attitude of investors toward a particular security or market.

Indicators:
• FII/DII Data: Foreign/Domestic Institutional Investors flow
• Put-Call Ratio: Options market sentiment
• VIX (India VIX): Market volatility index, higher = more fear
• Advance-Decline Ratio: Number of stocks advancing vs declining

News Impact:
• Earnings reports
• Government policy announcements
• Global market trends
• RBI interest rate decisions`,
  },
  {
    id: 6,
    title: 'Building a Trading Plan',
    icon: '📝',
    content: `A trading plan is your roadmap. Without one, you're gambling, not trading.

Essential Components:
1. Strategy: When to enter and exit trades
2. Risk Management: How much to risk per trade
3. Position Sizing: How many shares to buy
4. Record Keeping: Track every trade
5. Review Process: Weekly/monthly performance review

Common Strategies:
• Trend Following: Trade in the direction of the trend
• Mean Reversion: Buy oversold, sell overbought
• Breakout: Enter when price breaks key levels
• Scalping: Quick trades on small price movements`,
  },
];

export default function Learn() {
  const [activeChapter, setActiveChapter] = useState(null);
  const [completedChapters, setCompletedChapters] = useState([]);

  const toggleComplete = (chapterId) => {
    setCompletedChapters((prev) =>
      prev.includes(chapterId)
        ? prev.filter((id) => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  const progress = Math.round((completedChapters.length / CHAPTERS.length) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-content">Learn Trading</h2>
        <span className="text-content-secondary text-sm">{completedChapters.length}/{CHAPTERS.length} completed</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-surface-secondary rounded-full h-2">
        <div
          className="bg-brand h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {activeChapter ? (
        <div>
          <button
            onClick={() => setActiveChapter(null)}
            className="text-brand text-sm hover:underline mb-4 flex items-center gap-1"
          >
            ← Back to chapters
          </button>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{activeChapter.icon}</span>
              <h3 className="text-content text-xl font-bold">{activeChapter.title}</h3>
            </div>
            <div className="text-content-secondary whitespace-pre-wrap leading-relaxed">
              {activeChapter.content}
            </div>
            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
              <Button
                onClick={() => toggleComplete(activeChapter.id)}
                variant={completedChapters.includes(activeChapter.id) ? 'secondary' : 'primary'}
              >
                {completedChapters.includes(activeChapter.id) ? '✓ Completed' : 'Mark as Complete'}
              </Button>
              <div className="flex gap-2">
                {activeChapter.id > 1 && (
                  <Button
                    onClick={() => setActiveChapter(CHAPTERS.find((c) => c.id === activeChapter.id - 1))}
                    variant="secondary"
                  >
                    ← Previous
                  </Button>
                )}
                {activeChapter.id < CHAPTERS.length && (
                  <Button
                    onClick={() => setActiveChapter(CHAPTERS.find((c) => c.id === activeChapter.id + 1))}
                  >
                    Next →
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CHAPTERS.map((chapter) => {
            const isComplete = completedChapters.includes(chapter.id);
            return (
              <button
                key={chapter.id}
                onClick={() => setActiveChapter(chapter)}
                className={`text-left p-4 rounded-xl border transition-all hover:border-brand/50 ${
                  isComplete
                    ? 'bg-brand/5 border-brand/20'
                    : 'bg-surface-secondary border-border hover:bg-surface-secondary/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{chapter.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-content-secondary text-xs">Chapter {chapter.id}</span>
                      {isComplete && <span className="text-bullish text-xs">✓</span>}
                    </div>
                    <h4 className="text-content font-medium">{chapter.title}</h4>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

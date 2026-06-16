import React, { useState, useMemo } from "react";
import Input from "./ui/Input";
import Card from "./ui/Card";
import VirtualList from "./ui/VirtualList";

const GLOSSARY = [
  { term: "ATL", definition: "All-Time Low — the lowest price a security has ever traded at." },
  { term: "ATH", definition: "All-Time High — the highest price a security has ever traded at." },
  { term: "Bear Market", definition: "A market condition characterized by falling prices, typically a decline of 20% or more from recent highs." },
  { term: "Bull Market", definition: "A market condition characterized by rising prices, typically a sustained increase of 20% or more from recent lows." },
  { term: "Candlestick Chart", definition: "A chart type that displays open, high, low, and close prices using rectangular bodies and wicks." },
  { term: "CE", definition: "Call Option — a financial contract giving the buyer the right to buy an asset at a specified price." },
  { term: "CMP", definition: "Current Market Price — the price at which a security is currently trading." },
  { term: "Delivery", definition: "The actual transfer of securities to a buyer's demat account, as opposed to intraday trading." },
  { term: "EMA", definition: "Exponential Moving Average — a type of moving average that gives more weight to recent prices." },
  { term: "F&O", definition: "Futures and Options — derivative instruments traded on exchanges." },
  { term: "Fibonacci Retracement", definition: "A tool used to identify potential support and resistance levels based on Fibonacci ratios." },
  { term: "Fundamental Analysis", definition: "Evaluating a security by examining financial statements, management, and economic factors." },
  { term: "Gap", definition: "A break between prices where no trading occurs, often caused by news events outside market hours." },
  { term: "Grid Trading", definition: "A strategy that places buy and sell orders at predefined price levels above and below the current price." },
  { term: "HOD", definition: "High of Day — the highest price a security has reached during the current trading session." },
  { term: "IST", definition: "Indian Standard Time — the timezone used for Indian market hours (UTC+5:30)." },
  { term: "LTP", definition: "Last Traded Price — the most recent price at which a security was traded." },
  { term: "LOD", definition: "Low of Day — the lowest price a security has reached during the current trading session." },
  { term: "MACD", definition: "Moving Average Convergence Divergence — a trend-following momentum indicator showing the relationship between two moving averages." },
  { term: "Market Order", definition: "An order to buy or sell a security immediately at the best available current price." },
  { term: "NIFTY 50", definition: "The benchmark index of the National Stock Exchange of India, representing 50 large-cap companies." },
  { term: "OI", definition: "Open Interest — the total number of outstanding derivative contracts that have not been settled." },
  { term: "Order Book", definition: "A list of buy and sell orders for a security organized by price level." },
  { term: "PE", definition: "Put Option — a financial contract giving the buyer the right to sell an asset at a specified price." },
  { term: "P&L", definition: "Profit and Loss — the financial result of trading activity, showing gains or losses." },
  { term: "Position Sizing", definition: "Determining how much capital to allocate to a particular trade based on risk tolerance." },
  { term: "RSI", definition: "Relative Strength Index — a momentum oscillator that measures the speed and magnitude of price changes, ranging from 0 to 100." },
  { term: "Sensex", definition: "The benchmark index of the Bombay Stock Exchange (BSE), tracking 30 major companies." },
  { term: "SIP", definition: "Systematic Investment Plan — investing a fixed amount regularly in mutual funds or securities." },
  { term: "Stop Loss", definition: "An order placed to sell a security when it reaches a certain price to limit potential losses." },
  { term: "Swing Trading", definition: "A trading strategy that aims to capture gains over a period of days to weeks." },
  { term: "SMA", definition: "Simple Moving Average — the average of a security's prices over a specific number of periods." },
  { term: "Technical Analysis", definition: "Analyzing securities using charts and statistical indicators to predict future price movements." },
  { term: "VWAP", definition: "Volume Weighted Average Price — the average price weighted by volume, used as a benchmark for intraday trading." },
  { term: "Volume", definition: "The total number of shares or contracts traded during a specific time period." },
  { term: "Yield", definition: "The income return on an investment, expressed as a percentage of the investment's cost or market value." },
];

export default function TradingGlossary() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return GLOSSARY;
    const q = search.toLowerCase();
    return GLOSSARY.filter(
      (item) =>
        item.term.toLowerCase().includes(q) ||
        item.definition.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-content">Trading Glossary</h2>
        <p className="text-content-secondary text-sm mt-1">
          {GLOSSARY.length} terms — search to filter
        </p>
      </div>

      <div className="relative">
        <Input
          placeholder="Search terms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted hover:text-content text-xs"
          >
            Clear
          </button>
        )}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-content-secondary text-sm">No matching terms found</p>
          </Card>
        ) : filtered.length > 20 ? (
          <VirtualList
            items={filtered}
            height={Math.min(filtered.length * 80, 600)}
            itemHeight={80}
            renderItem={(item) => (
              <Card className="p-4 mb-2">
                <div className="flex items-start gap-3">
                  <span className="text-brand font-semibold text-sm shrink-0 min-w-[80px]">
                    {item.term}
                  </span>
                  <span className="text-content-secondary text-sm leading-relaxed">
                    {item.definition}
                  </span>
                </div>
              </Card>
            )}
          />
        ) : (
          filtered.map((item) => (
            <Card key={item.term} className="p-4">
              <div className="flex items-start gap-3">
                <span className="text-brand font-semibold text-sm shrink-0 min-w-[80px]">
                  {item.term}
                </span>
                <span className="text-content-secondary text-sm leading-relaxed">
                  {item.definition}
                </span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import ChartContainer from "./ChartContainer";

function ChartPage() {
  const { symbol } = useParams(); // from /chart/:symbol
  const [exchange, setExchange] = useState(null);
  const [availableExchanges, setAvailableExchanges] = useState([]);

  // 🔹 Fetch all exchange variants for this symbol
  useEffect(() => {
    const fetchExchanges = async () => {
      try {
        const { data, error } = await supabase
          .from("master_symbols")
          .select("exchange_segment")
          .ilike("symbol_name", symbol);

        if (error) throw error;

        const exchanges = [...new Set(data.map((d) => d.exchange_segment))];
        setAvailableExchanges(exchanges);
        setExchange(exchanges[0] || null); // default to first exchange
      } catch (err) {
        console.error("Error fetching exchanges:", err.message);
      }
    };

    fetchExchanges();
  }, [symbol]);

  // 🔹 Exchange selector handler
  const handleExchangeChange = (e) => setExchange(e.target.value);

  if (!exchange) return <div className="text-white p-6">Loading {symbol}...</div>;

  return (
    <div className="min-h-screen bg-[#0B0E15] text-white">
      {/* Header with exchange selector */}
      <div className="p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">{symbol}</h1>
        {availableExchanges.length > 1 && (
          <select
            value={exchange}
            onChange={handleExchangeChange}
            className="bg-[#1a1a1a] text-white px-3 py-1 rounded-xl border border-gray-600"
          >
            {availableExchanges.map((ex) => (
              <option key={ex} value={ex}>
                {ex}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* ChartContainer receives symbol + exchange_segment */}
      <ChartContainer symbol={symbol} exchange_segment={exchange} />
    </div>
  );
}

export default ChartPage;

import { useState } from "react";
import AssetCard from "./AssetCard";

const mockAssets = [
  { name: "NIFTY 50", price: "₹19,425.35", change: "+1.24%", volume: "124.5Cr", isPositive: true },
  { name: "HDFC BANK", price: "₹1,632.45", change: "+0.87%", volume: "85.7Cr", isPositive: true },
  { name: "RELIANCE", price: "₹2,438.65", change: "-0.73%", volume: "32.5Cr", isPositive: false },
  { name: "TATA MOTORS", price: "₹5,438.65", change: "0.93%", volume: "52.5Cr", isPositive: true },
  { name: "RAHUL EDUCATION", price: "₹2,438.65", change: "-0.73%", volume: "32.5Cr", isPositive: false },
  { name: "APPLE INC.", price: "₹2,438.65", change: "-0.73%", volume: "32.5Cr", isPositive: false },
  { name: "TESLA", price: "₹2,438.65", change: "0.73%", volume: "32.5Cr", isPositive: true },
];

function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#7F3DFF] text-white rounded-md shadow-md"
      >
        {open ? "✕" : "☰"}
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static top-0 left-0 h-full w-[270px] bg-[#0F1117] border-r border-[#1F2937] text-white px-4 py-5 overflow-y-auto space-y-4 transform transition-transform duration-300 z-50 lg:translate-x-0 
        ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="mb-4">
          <h2 className="text-sm text-gray-400 uppercase tracking-wide">Market Watch</h2>
          <p className="text-xs text-gray-500">24h Volume</p>
        </div>

        <input
          type="text"
          placeholder="Search markets..."
          className="w-full mb-4 px-3 py-2 text-sm rounded-md bg-[#1F2937] text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7F3DFF]"
        />

        <div className="space-y-3">
          {mockAssets.map((asset, idx) => (
            <AssetCard key={idx} asset={asset} />
          ))}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;

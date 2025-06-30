function MarketItem({ name, price, change, volume, changeType }) {
  const isPositive = changeType === 'up';
  const changeColor = isPositive ? 'text-green-400' : 'text-red-400';
  const barColor = isPositive ? 'bg-green-400' : 'bg-red-400';

  return (
    <div className="bg-[#161B22] p-3 rounded-lg">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-medium">{name}</h3>
          <p className="text-xs text-gray-400">{price}</p>
        </div>
        <div className="text-right">
          <p className={`text-sm font-semibold ${changeColor}`}>{change}</p>
          <p className="text-xs text-gray-400">{volume}</p>
        </div>
      </div>
      <div className={`h-1 mt-2 rounded ${barColor}`} />
    </div>
  );
}
export default MarketItem;
import { useAsset } from '../context/AssetContext';

const AssetCard = ({ asset }) => {
  const { setSelectedAsset } = useAsset();

  const handleClick = () => {
    setSelectedAsset(asset);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-[#1C1F24] p-3 rounded-xl cursor-pointer hover:bg-[#2a2e35] transition-colors"
    >
      <div className="flex justify-between items-center">
        <p className="font-bold text-white">{asset.name}</p>
        <p className={`${asset.isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {asset.change}
        </p>
      </div>
      <p className="text-gray-300 text-sm">{asset.price}</p>
      <p className="text-gray-500 text-xs">{asset.volume}</p>
      <div
        className={`mt-1 h-1.5 rounded-full ${
          asset.isPositive ? 'bg-green-500' : 'bg-red-500'
        }`}
        style={{ width: '100%' }}
      ></div>
    </div>
  );
};

export default AssetCard;

import { createContext, useContext, useState } from 'react';

const AssetContext = createContext();

export const useAsset = () => useContext(AssetContext);

export const AssetProvider = ({ children }) => {
  const [selectedAsset, setSelectedAsset] = useState({
    name: 'NIFTY 50',
    price: '₹19,425.35',
    change: '+1.24%',
    volume: '124.5Cr',
    isPositive: true,
  });

  return (
    <AssetContext.Provider value={{ selectedAsset, setSelectedAsset }}>
      {children}
    </AssetContext.Provider>
  );
};

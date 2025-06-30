import { useRef } from 'react';
import useClickOutside from './useClickOutside';
import MiniModal from './MiniModal';

const chartTypes = ['Candlestick', 'Line', 'Area'];

const ChartTypeModal = ({ selected, onSelect, onClose }) => {
  const ref = useRef();
  useClickOutside(ref, onClose);

  return (
    <MiniModal modalRef={ref}>
      {chartTypes.map((type) => (
        <button
          key={type}
          onClick={() => {
            onSelect(type);
            onClose();
          }}
          className={`w-full text-left px-3 py-1 text-sm rounded transition-colors duration-150 ${selected === type ? 'bg-[#5B21B6] text-white' : 'text-gray-300 hover:bg-[#2C3036]'
            }`}
        >
          {type}
        </button>
      ))}
    </MiniModal>
  );
};

export default ChartTypeModal;

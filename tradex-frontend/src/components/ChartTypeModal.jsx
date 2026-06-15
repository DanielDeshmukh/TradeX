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
          className={`w-full text-left px-3 py-1 text-sm rounded-lg transition-colors duration-150 ${
            selected === type
              ? 'bg-gradient-to-r from-[#7F3DFF] to-[#5A18E9] text-white shadow-lg'
              : 'text-content-secondary hover:bg-surface-input/80 hover:shadow hover:shadow-brand/20'
          }`}
        >
          {type}
        </button>
      ))}
    </MiniModal>
  );
};

export default ChartTypeModal;

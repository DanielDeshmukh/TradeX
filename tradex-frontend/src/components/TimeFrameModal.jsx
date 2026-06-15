import { useRef } from 'react';
import useClickOutside from './useClickOutside';
import MiniModal from './MiniModal';

const timeFrames = ['1min', '5m', '10m', '15m', '30m', '1h'];

const TimeFrameModal = ({ selected, onSelect, onClose }) => {
  const ref = useRef();
  useClickOutside(ref, onClose);

  return (
    <MiniModal modalRef={ref}>
      {timeFrames.map((frame) => (
        <button
          key={frame}
          onClick={() => {
            onSelect(frame);
            onClose();
          }}
          className={`w-full text-left px-3 py-1 text-sm rounded-lg transition-colors duration-150 ${
            selected === frame
              ? 'bg-gradient-to-r from-[#7F3DFF] to-[#5A18E9] text-white shadow-lg'
              : 'text-content-secondary hover:bg-surface-input/80 hover:shadow hover:shadow-brand/20'
          }`}
        >
          {frame}
        </button>
      ))}
    </MiniModal>
  );
};

export default TimeFrameModal;

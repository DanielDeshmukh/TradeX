// ShortcutModal.jsx
const shortcuts = [
  { keys: 'Ctrl + /', action: 'Show Shortcuts' },
  { keys: 'Shift + ↑', action: 'Zoom In' },
  { keys: 'Shift + ↓', action: 'Zoom Out' },
  { keys: 'Shift + ←', action: 'Scroll Left' },
  { keys: 'Shift + →', action: 'Scroll Right' },
  { keys: 'Shift + R', action: 'Reset View' },
  { keys: 'Shift + F', action: 'Enter Fullscreen' },
  { keys: 'Esc', action: 'Exit Fullscreen' },
];

const ShortcutModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center">
      <div className="bg-[#1E1E24] text-white rounded-xl p-6 w-full max-w-md shadow-lg">
        <h2 className="text-lg font-semibold mb-4 text-center">Keyboard Shortcuts</h2>
        <div className="space-y-2">
          {shortcuts.map((shortcut, i) => (
            <div key={i} className="flex justify-between items-center bg-[#2C3036] p-2 rounded-md">
              <span className="text-sm">{shortcut.action}</span>
              <span className="text-sm font-mono text-gray-300">{shortcut.keys}</span>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-[#5B21B6] hover:bg-[#7F3DFF] text-white py-2 rounded transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ShortcutModal;

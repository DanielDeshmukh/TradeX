import supabase from "../lib/supabase";

const shortcuts = [
  { keys: "Ctrl + /", action: "Show Shortcuts" },
  { keys: "Shift + ↑", action: "Zoom In" },
  { keys: "Shift + ↓", action: "Zoom Out" },
  { keys: "Shift + ←", action: "Scroll Left" },
  { keys: "Shift + →", action: "Scroll Right" },
  { keys: "Shift + R", action: "Reset View" },
  { keys: "Shift + F", action: "Enter Fullscreen" },
  { keys: "Esc", action: "Exit Fullscreen" },
];

const ShortcutModal = ({
  onClose,
  chartReady,
  zoomIn,
  zoomOut,
  scrollLeft,
  scrollRight,
  resetView,
  handleFullscreen,
  setShowShortcuts,
}) => {
  const triggerShortcut = async (keyCombo) => {
    try {
      await supabase.functions.invoke("shortcut-handler", {
        body: { keyCombos: [keyCombo] },
      });
    } catch (err) {
      console.error("Error logging shortcut:", err);
    }
  };

  const handleShortcutClick = (key) => {
    triggerShortcut(key);

    switch (key) {
      case "Ctrl + /":
        setShowShortcuts(true);
        break;
      case "Shift + ↑":
        chartReady && zoomIn();
        break;
      case "Shift + ↓":
        chartReady && zoomOut();
        break;
      case "Shift + ←":
        chartReady && scrollLeft();
        break;
      case "Shift + →":
        chartReady && scrollRight();
        break;
      case "Shift + R":
        chartReady && resetView();
        break;
      case "Shift + F":
        handleFullscreen();
        break;
      case "Esc":
        onClose();
        break;
      default:
        break;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center">
      <div className="glass-card text-white rounded-2xl p-6 w-full max-w-md shadow-brand">
        <h2 className="text-lg font-semibold mb-4 text-center drop-shadow-md">
          Keyboard Shortcuts
        </h2>
        <div className="space-y-2">
          {shortcuts.map((shortcut, i) => (
            <div
              key={i}
              className="flex justify-between items-center bg-surface-input/80 p-2 rounded-lg cursor-pointer 
                         hover:bg-surface-elevated hover:shadow hover:shadow-brand transition"
              onClick={() => handleShortcutClick(shortcut.keys)}
            >
              <span className="text-sm">{shortcut.action}</span>
              <span className="text-sm font-mono text-content-secondary">{shortcut.keys}</span>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full btn-primary py-2 rounded-lg shadow-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ShortcutModal;

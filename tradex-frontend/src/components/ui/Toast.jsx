import { useEffect } from "react";
import { toast } from "react-toastify";

const toastDefaults = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export function showToast(message, type = "info", options = {}) {
  const config = { ...toastDefaults, ...options };

  switch (type) {
    case "success":
      return toast.success(message, config);
    case "error":
      return toast.error(message, config);
    case "warning":
      return toast.warning(message, config);
    case "info":
    default:
      return toast.info(message, config);
  }
}

export function Toast({ message, type = "info", onClose, autoClose = 3000 }) {
  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  const bgColors = {
    success: "bg-bullish/10 border-bullish/30 text-bullish",
    error: "bg-bearish/10 border-bearish/30 text-bearish",
    warning: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
    info: "bg-brand/10 border-brand/30 text-brand",
  };

  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${bgColors[type] || bgColors.info}`}>
      <span className="text-sm">{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-auto text-current opacity-60 hover:opacity-100">
          &times;
        </button>
      )}
    </div>
  );
}

export default Toast;

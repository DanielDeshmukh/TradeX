const variants = {
  default: "bg-white/10 text-gray-300 border-white/10",
  brand: "bg-brand/10 text-brand border-brand/20",
  success: "bg-bullish/10 text-bullish border-bullish/20",
  danger: "bg-bearish/10 text-bearish border-bearish/20",
  warning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};

const sizes = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1 text-sm",
};

const Badge = ({ variant = "default", size = "md", dot = false, children, className = "" }) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full border font-medium
        ${variants[variant]} ${sizes[size]} ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${
          variant === "success" ? "bg-bullish" :
          variant === "danger" ? "bg-bearish" :
          variant === "warning" ? "bg-yellow-400" :
          variant === "brand" ? "bg-brand" : "bg-gray-400"
        }`} />
      )}
      {children}
    </span>
  );
};

export default Badge;

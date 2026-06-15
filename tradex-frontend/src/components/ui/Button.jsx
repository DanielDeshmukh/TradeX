import { forwardRef } from "react";

const variants = {
  primary: "bg-gradient-to-r from-brand to-brand-muted text-white shadow-brand hover:opacity-90",
  secondary: "bg-surface border border-white/10 text-white hover:bg-surface-input",
  ghost: "text-gray-400 hover:text-white hover:bg-white/5",
  danger: "bg-bearish/10 text-bearish border border-bearish/20 hover:bg-bearish/20",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

const Spinner = () => (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const Button = forwardRef(
  ({ variant = "primary", size = "md", loading = false, disabled = false, className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center gap-2 rounded-xl font-medium
          transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
          ${variants[variant]} ${sizes[size]} ${className}
        `}
        {...props}
      >
        {loading && <Spinner />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;

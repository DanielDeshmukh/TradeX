import { forwardRef } from "react";

const Input = forwardRef(({ label, error, icon: Icon, className = "", ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-400 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <Icon size={16} />
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full px-3 py-2 rounded-xl bg-surface-input text-white
            border transition-all duration-200
            ${error ? "border-bearish focus:border-bearish focus:ring-2 focus:ring-bearish/20" : "border-white/10 focus:border-brand focus:ring-2 focus:ring-brand/20"}
            focus:outline-none placeholder:text-gray-500
            ${Icon ? "pl-10" : ""}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-bearish">{error}</p>}
    </div>
  );
});

Input.displayName = "Input";

export default Input;

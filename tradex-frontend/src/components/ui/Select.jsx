import { forwardRef } from "react";

const Select = forwardRef(({ label, error, options = [], placeholder, className = "", ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-400 mb-1.5">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={`
          w-full px-3 py-2 rounded-xl bg-surface-input text-white
          border transition-all duration-200 appearance-none
          ${error ? "border-bearish focus:border-bearish focus:ring-2 focus:ring-bearish/20" : "border-white/10 focus:border-brand focus:ring-2 focus:ring-brand/20"}
          focus:outline-none
          ${className}
        `}
        {...props}
      >
        {placeholder && (
          <option value="" className="bg-surface-elevated text-gray-400">
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option
            key={typeof opt === "string" ? opt : opt.value}
            value={typeof opt === "string" ? opt : opt.value}
            className="bg-surface-elevated"
          >
            {typeof opt === "string" ? opt : opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-bearish">{error}</p>}
    </div>
  );
});

Select.displayName = "Select";

export default Select;

const Card = ({ children, className = "", hover = false, glow = false, ...props }) => {
  return (
    <div
      className={`
        bg-surface/70 backdrop-blur-md rounded-xl border border-white/5
        ${hover ? "hover:border-brand/20 hover:shadow-brand transition-all cursor-pointer" : ""}
        ${glow ? "shadow-brand border-brand/20" : "shadow-lg"}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = "" }) => (
  <div className={`px-6 py-4 border-b border-white/5 ${className}`}>
    {children}
  </div>
);

export const CardBody = ({ children, className = "" }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = "" }) => (
  <div className={`px-6 py-4 border-t border-white/5 ${className}`}>
    {children}
  </div>
);

export default Card;

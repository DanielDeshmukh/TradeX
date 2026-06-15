const Skeleton = ({ className = "", variant = "text", count = 1 }) => {
  const base = "animate-pulse rounded bg-white/5";

  const variants = {
    text: "h-4 w-full",
    title: "h-6 w-3/4",
    avatar: "h-10 w-10 rounded-full",
    card: "h-32 w-full rounded-xl",
    thumbnail: "h-20 w-20 rounded-lg",
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${base} ${variants[variant]}`} />
      ))}
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4">
        {Array.from({ length: cols }).map((_, j) => (
          <div key={j} className={`animate-pulse rounded bg-white/5 h-4 ${j === 0 ? "w-1/3" : "flex-1"}`} />
        ))}
      </div>
    ))}
  </div>
);

export const ChartSkeleton = () => (
  <div className="animate-pulse rounded-xl bg-white/5 h-[500px] w-full flex items-center justify-center">
    <div className="text-gray-600 text-sm">Loading chart...</div>
  </div>
);

export default Skeleton;

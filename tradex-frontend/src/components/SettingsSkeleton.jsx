import React from "react";

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-surface rounded-md ${className}`} />
);

const SettingsSkeleton = () => {
  return (
    <div className="p-4 sm:p-6 bg-[#0B0E15] text-white min-h-screen">
      {/* Header skeleton */}
      <div className="h-10 w-40 mb-6">
        <Skeleton className="h-full w-full rounded-xl" />
      </div>

      <div className="w-full max-w-6xl mx-auto space-y-6 mt-6 sm:space-y-8">
        {/* Chart Type Skeleton */}
        <div className="bg-bg-secondary/70 p-6 rounded-2xl border border-[#2D2F36] space-y-3">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>

        {/* Chart Interval Skeleton */}
        <div className="bg-bg-secondary/70 p-6 rounded-2xl border border-[#2D2F36] space-y-3">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>

        {/* Wishlist Skeleton */}
        <div className="bg-bg-secondary/70 p-6 rounded-2xl border border-[#2D2F36] space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-16 rounded-full" />
          </div>
        </div>

        {/* Save Button Skeleton */}
        <div className="mt-4">
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export default SettingsSkeleton;

import React from "react";

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-surface rounded-md ${className}`} />
);

const ProfilePageSkeleton = () => {
  return (
    <div className="min-h-screen bg-[#0B0E15] text-white p-4 sm:p-6">
      <div className="h-10 w-40 mb-6">
        <Skeleton className="h-full w-full rounded-xl" />
      </div>

      <div className="mt-10 w-full max-w-6xl mx-auto rounded-2xl shadow-lg shadow-brand/20
                      bg-bg-secondary/70 backdrop-blur-md p-4 sm:p-8 space-y-6 sm:space-y-8">

        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        <div className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        <div className="space-y-3">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-10 w-48 rounded-xl" />
        </div>

        <div className="space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-6 w-20" />
        </div>

        <div className="space-y-3">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>

        <div className="flex justify-center sm:justify-end">
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export default ProfilePageSkeleton;

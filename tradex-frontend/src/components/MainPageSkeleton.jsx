// src/components/MainPageSkeleton.jsx
import React from "react";

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-[#1a1a1a] rounded-md ${className}`} />
);

const MainPageSkeleton = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B0E15] text-white">
      {/* Header */}
      <div className="h-12 w-48 mt-4 ml-4">
        <Skeleton className="h-full w-full rounded-lg" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 flex flex-col items-start">
            <div className="w-full max-w-5xl space-y-6">
              {/* Chart Skeleton */}
              <div className="h-[500px] rounded-2xl bg-[#0F1117]/80 border border-[#6C4FE0]/20 shadow-lg overflow-hidden flex items-center justify-center">
                <Skeleton className="w-full h-full rounded-2xl" />
              </div>

              {/* Wishlist Skeleton */}
              <div className="space-y-3">
                <Skeleton className="h-6 w-32" />
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-6 w-full rounded-md" />
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Right Price Action Panel */}
        <div className="w-1/3 bg-[#0A0C12] mt-4 border rounded-md border-[#6C4FE0]/40 p-4 overflow-y-auto shadow-xl">
          <h2 className="text-lg font-bold mb-4 tracking-wider text-[#6C4FE0]">
            PRICE ACTION
          </h2>

          {/* Table Skeleton */}
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="flex justify-between gap-2 border-b border-gray-800 py-2"
              >
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPageSkeleton;

import React from "react";
import BottomNav from "./BottomNav";

export default function MobileLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-bg md:hidden">
      <div className="flex-1 pb-16 overflow-y-auto">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}

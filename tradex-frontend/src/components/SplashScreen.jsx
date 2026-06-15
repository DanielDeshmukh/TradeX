import React, { useEffect, useState } from "react";
import banner from "../assets/tab-icon.png";

const SplashScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const steps = 3;
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setProgress(Math.floor((current / steps) * 100));
      if (current >= steps) clearInterval(interval);
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center bg-[#0A0E15] h-screen w-screen relative">
      <img className="h-72 absolute top-[30%]" src={banner} alt="Logo" />

      <div className="absolute bottom-52 w-96 h-1 bg-gray-700 rounded overflow-hidden">
        <div
          className="h-full bg-purple-600 transition-all duration-300 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default SplashScreen;

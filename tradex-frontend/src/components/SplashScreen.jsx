import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import banner from "../assets/tab-icon.png";
import supabase from "../lib/supabase";

const SplashScreen = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const asyncTasks = [
      async () => {
        const { data: { session } } = await supabase.auth.getSession();
        await new Promise((res) => setTimeout(res, 300)); 
        return session;
      },
      async () => {
        const { data } = await supabase.from("profiles").select("*").limit(1);
        await new Promise((res) => setTimeout(res, 300));
        return data;
      },
      async () => {
        await new Promise((res) => setTimeout(res, 300));
        return true;
      }
    ];

    const runTasks = async () => {
      for (let i = 0; i < asyncTasks.length; i++) {
        await asyncTasks[i]();
        setProgress(Math.floor(((i + 1) / asyncTasks.length) * 100));
      }

      navigate("/main-page");
    };

    runTasks();
  }, [navigate]);

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

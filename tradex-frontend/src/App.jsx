import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { Routes, Route } from "react-router-dom";

import SplashScreen from "./components/SplashScreen";
import Register from "./components/Register";
import Login from "./components/Login";
import Notifications from "./components/Notifications";
import ForgotPassword from "./components/ForgotPassword";
import MagicLink from "./components/MagicLink";
import UpdatePassword from "./components/UpdatePassword";
import ProfilePage from "./components/ProfilePage";
import Settings from "./components/Settings";
import FullscreenChartPage from "./components/FullscreenChartPage";
import MobileComingSoon from "./components/MobileCommingSoon";
import MainPage from "./components/MainPage";
import ChartPage from "./components/ChartPage";

import "./App.css";

function App() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 600);
    };

    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {isMobile ? (
        <MobileComingSoon />
      ) : (
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/main-page" element={<MainPage />} />
          <Route path="/chart/:symbol" element={<ChartPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/magic-link" element={<MagicLink />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="/fullscreen-chart" element={<FullscreenChartPage />} />
          <Route path="/profile-page" element={<ProfilePage />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings-page" element={<Settings />} />
        </Routes>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;

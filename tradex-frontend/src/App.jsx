import { useState, useEffect, useMemo } from "react";
import { ToastContainer } from "react-toastify";
import { Routes, Route, Navigate } from "react-router-dom";
import { QuoteProvider } from "./context/QuoteContext";
import supabase from "./lib/supabase";

import SplashScreen from "./components/SplashScreen";
import TradeXLanding from "./components/TradeXLanding";
import Register from "./components/Register";
import Login from "./components/Login";
import Notifications from "./components/Notifications";
import ForgotPassword from "./components/ForgotPassword";
import MagicLink from "./components/MagicLink";
import UpdatePassword from "./components/UpdatePassword";
import ProfilePage from "./components/ProfilePage";
import Settings from "./components/Settings";
import FullscreenChartPage from "./components/FullscreenChartPage";
import MobileComingSoon from "./components/MobileComingSoon";
import MainPage from "./components/MainPage";
import ChartPage from "./components/ChartPage";

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { session: activeSession } } = await supabase.auth.getSession();
      if (mounted) setSession(activeSession);
      setAuthReady(true);
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const userId = useMemo(() => session?.user?.id ?? null, [session]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!authReady) return <SplashScreen />;

  return (
    <QuoteProvider userId={userId}>
      {isMobile ? (
        <MobileComingSoon />
      ) : (
        <Routes>
          {/* Public pages */}
          <Route path="/landing-page" element={!session ? <TradeXLanding /> : <Navigate to="/main-page" replace />} />
          <Route path="/register" element={!session ? <Register /> : <Navigate to="/main-page" replace />} />
          <Route path="/login" element={!session ? <Login /> : <Navigate to="/main-page" replace />} />
          <Route path="/forgot-password" element={!session ? <ForgotPassword /> : <Navigate to="/main-page" replace />} />
          <Route path="/magic-link" element={!session ? <MagicLink /> : <Navigate to="/main-page" replace />} />
          <Route path="/update-password" element={!session ? <UpdatePassword /> : <Navigate to="/main-page" replace />} />

          {/* Authenticated pages */}
          <Route path="/main-page" element={session ? <MainPage userId={userId} /> : <Navigate to="/landing-page" replace />} />
          <Route path="/chart" element={session ? <ChartPage /> : <Navigate to="/landing-page" replace />} />
          <Route path="/fullscreen-chart" element={session ? <FullscreenChartPage /> : <Navigate to="/landing-page" replace />} />
          <Route path="/profile-page" element={session ? <ProfilePage /> : <Navigate to="/landing-page" replace />} />
          <Route path="/notifications" element={session ? <Notifications /> : <Navigate to="/landing-page" replace />} />
          <Route path="/settings-page" element={session ? <Settings /> : <Navigate to="/landing-page" replace />} />

          {/* Default fallback */}
          <Route path="*" element={<Navigate to={session ? "/main-page" : "/landing-page"} replace />} />
        </Routes>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </QuoteProvider>
  );
}

export default App;

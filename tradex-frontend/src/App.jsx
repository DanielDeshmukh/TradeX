import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { ToastContainer } from "react-toastify";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
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

const ProfilePage = lazy(() => import("./components/ProfilePage"));
const Settings = lazy(() => import("./components/Settings"));
const FullscreenChartPage = lazy(() => import("./components/FullscreenChartPage"));
const MainPage = lazy(() => import("./components/MainPage"));
const ChartPage = lazy(() => import("./components/ChartPage"));
const PrivacyPolicy = lazy(() => import("./components/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./components/TermsOfService"));
const BillingHistory = lazy(() => import("./components/BillingHistory"));
const TradingGlossary = lazy(() => import("./components/TradingGlossary"));
const MobileSettings = lazy(() => import("./components/MobileSettings"));
const NotificationPreferences = lazy(() => import("./components/NotificationPreferences"));

function App() {
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


  if (!authReady) return <SplashScreen />;

  return (
    <ThemeProvider>
      <QuoteProvider userId={userId}>
        <Suspense fallback={<SplashScreen />}>
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
              <Route path="/mobile-settings" element={session ? <MobileSettings /> : <Navigate to="/landing-page" replace />} />
              <Route path="/notification-preferences" element={session ? <NotificationPreferences /> : <Navigate to="/landing-page" replace />} />
              <Route path="/billing-history" element={session ? <BillingHistory /> : <Navigate to="/landing-page" replace />} />
              <Route path="/glossary" element={session ? <TradingGlossary /> : <Navigate to="/landing-page" replace />} />

              {/* Public legal pages (accessible without auth) */}
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />

              {/* Default fallback */}
              <Route path="*" element={<Navigate to={session ? "/main-page" : "/landing-page"} replace />} />
            </Routes>
        </Suspense>
        <ToastContainer position="top-right" autoClose={3000} />
      </QuoteProvider>
    </ThemeProvider>
  );
}

export default App;

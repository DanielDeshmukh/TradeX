import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { ToastContainer } from "react-toastify";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { QuoteProvider } from "./context/QuoteContext";
import supabase from "./lib/supabase";
import ErrorBoundary from "./components/ErrorBoundary";

const SplashScreen = lazy(() => import("./components/SplashScreen"));
const TradeXLanding = lazy(() => import("./components/TradeXLanding"));
const Register = lazy(() => import("./components/Register"));
const Login = lazy(() => import("./components/Login"));
const Notifications = lazy(() => import("./components/Notifications"));
const ForgotPassword = lazy(() => import("./components/ForgotPassword"));
const MagicLink = lazy(() => import("./components/MagicLink"));
const UpdatePassword = lazy(() => import("./components/UpdatePassword"));
const NotFoundPage = lazy(() => import("./components/NotFoundPage"));
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
        <ErrorBoundary>
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-bg">
              <div className="text-brand text-xl font-bold animate-pulse">TradeX</div>
            </div>
          }>
            <Routes>
              {/* Public pages */}
              <Route path="/landing-page" element={!session ? <TradeXLanding /> : <Navigate to="/main-page" replace />} />
              <Route path="/register" element={!session ? <Register /> : <Navigate to="/main-page" replace />} />
              <Route path="/login" element={!session ? <Login /> : <Navigate to="/main-page" replace />} />
              <Route path="/forgot-password" element={!session ? <ForgotPassword /> : <Navigate to="/main-page" replace />} />
              <Route path="/magic-link" element={!session ? <MagicLink /> : <Navigate to="/main-page" replace />} />
              <Route path="/update-password" element={!session ? <UpdatePassword /> : <Navigate to="/main-page" replace />} />

              {/* Public legal pages */}
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />

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

              {/* 404 - Not Found */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
        <ToastContainer position="top-right" autoClose={3000} />
      </QuoteProvider>
    </ThemeProvider>
  );
}

export default App;

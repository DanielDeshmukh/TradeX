import { useState, useEffect } from 'react'
import supabase from './lib/supabase';
import { AssetProvider } from './context/AssetContext'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Settings from './components/Settings'
import Footer from './components/Footer'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FullscreenChartPage from './components/FullscreenChartPage';
import PatternFinderModal from './components/PatternFinderModal.'
import ProfilePage from './components/ProfilePage'
import ChartContainer from './components/ChartContainer'
import SplashScreen from './components/SplashScreen';
import Register from './components/Register';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import MagicLink from './components/MagicLink';
import './App.css'
import MobileComingSoon from './components/MobileCommingSoon'
function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser ] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 600)
    }

    handleResize() 
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

 



  return (
  
    <AssetProvider>
      {isMobile ? (
        <MobileComingSoon />
      ) : (
        <Routes>
          <Route path="/" element={<SplashScreen/>}/>
          <Route
            path="/main-page"
            element={
              <div className="bg-[#0F1117] text-white h-screen w-screen overflow-hidden flex flex-col">
                <Header />
                <PatternFinderModal />
                <div className="flex flex-1 overflow-hidden">
                  <Sidebar />
                  <div className="flex-1 overflow-hidden">
                    <ChartContainer />
                  </div>
                </div>
                <Footer />
              </div>
            }
          />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/magic-link" element={<MagicLink />} />
          <Route path="/fullscreen-chart" element={<FullscreenChartPage />} />
          <Route path="/profile-page" element={<ProfilePage/>}/>
          <Route path="/settings-page" element={<Settings/>}/>

        </Routes>
      )}
    </AssetProvider>
  
);
}

export default App

import { Link, useLocation } from 'react-router-dom';
import { Bell, Settings, User } from 'lucide-react';
import { usePatternFinderStore } from '../store/usePatternFinderStore';
import { FaChartBar, FaRegLightbulb } from "react-icons/fa";

function Header() {
  const { open } = usePatternFinderStore();
  const location = useLocation();

  const showFindChartButton = ["/main-page","/fullscreen-chart"].includes(location.pathname);

  return (
    <header 
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-3
                 bg-[#0F1117]/60 backdrop-blur-md border-b border-[#6C4FE0]/20 gap-3 sm:gap-0
                 shadow-lg shadow-[#7F3DFF]/20"
    >
      <div className="flex items-center justify-around">
        <Link to="/main-page">
          <h1 className="text-xl my-1 font-bold text-[#7F3DFF] drop-shadow-lg">
            Trade<span className="text-white">X</span>
          </h1>
        </Link>
      </div>

      <div className="flex flex-wrap sm:flex-nowrap items-center justify-start sm:justify-end gap-3">
        {showFindChartButton && (
          <button 
            onClick={open} 
            className="bg-gradient-to-r from-[#7F3DFF] to-[#5A18E9] text-white text-sm font-semibold
                       px-4 py-2 rounded-md shadow-lg hover:opacity-90 transition flex items-center justify-center gap-x-2 w-full sm:w-auto"
          >
            <FaChartBar />
            Find Chart Patterns
          </button>
        )}

        <div className="relative group sm:justify-around cursor-pointer">
          <div className="text-[#C1C1FF] hover:text-white cursor-pointer text-xl drop-shadow-md">
            <FaRegLightbulb />
          </div>
          <div className="absolute top-full mt-1 scale-0 group-hover:scale-100 origin-center
                          transition-all bg-[#1C1F2A]/90 text-white z-50 text-xs px-5 py-3 rounded-lg shadow-xl">
            Press Ctrl + / for shortcuts
          </div>
        </div>

        <Link to='/notifications'>
          <Bell className="text-[#C1C1FF] hover:text-white cursor-pointer drop-shadow-md" size={20} />
        </Link>
        <Link to='/settings-page'>
          <Settings className="text-[#C1C1FF] hover:text-white cursor-pointer drop-shadow-md" size={20} />
        </Link>
        <Link to='/profile-page'>
          <User className="text-[#C1C1FF] hover:text-white cursor-pointer drop-shadow-md" size={20} />
        </Link>
      </div>
    </header>
  );
}

export default Header;

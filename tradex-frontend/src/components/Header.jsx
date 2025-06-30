import { Link } from 'react-router-dom';
import { Bell, Settings, User } from 'lucide-react';
import { usePatternFinderStore } from '../store/usePatternFinderStore';
import { FaChartBar, FaRegLightbulb } from "react-icons/fa";

function Header() {
    const toUser = () => {
        console.log("Heading To User Profile!!!!! SUSUMEE!!");

    }
    const { open } = usePatternFinderStore();

    return (
        <header className="flex items-center justify-between px-6 py-3 bg-[#0F1117] border-b border-[#1F2937]">

            <div className="flex items-center space-x-6">
                <Link to="/main-page">

                    <h1 className="text-xl font-bold text-[#7F3DFF]">Trade<span className="text-white">X</span></h1>
                </Link>
            </div>

            <div className="flex items-center space-x-3">
                <button onClick={open} className="bg-gradient-to-r from-[#7F3DFF] to-[#5A18E9] text-white text-sm font-semibold px-4 py-2 rounded-md shadow-md hover:opacity-90 transition flex items-center justify-center gap-x-2">
                    <FaChartBar />
                    Find Chart Patterns
                </button>

                <div className="relative mx-2 group cursor-pointer z-50">
                    <div className="text-gray-300 hover:text-white cursor-pointer text-xl"><FaRegLightbulb /></div>
                    <div className="absolute top-full mt-1 right-0 scale-0 group-hover:scale-100 origin-top-right transition-all bg-gray-800 text-white text-xs px-5 py-3 rounded shadow-lg">
                        Press Ctrl + / for shortcuts
                    </div>
                </div>
                <Bell className="text-gray-300 hover:text-white cursor-pointer" size={20} />
                <Settings className="text-gray-300 hover:text-white cursor-pointer" size={20} />
                <Link to='/profile-page' onClick={toUser()}>
                    <User className="text-gray-300 hover:text-white cursor-pointer" size={20} />
                </Link>
            </div>
        </header>
    );
}

export default Header;

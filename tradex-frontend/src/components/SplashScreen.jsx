import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import banner from '../assets/tab-icon.png';

const SplashScreen = () => {
    const navigate = useNavigate();
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                const next = prev + 1;
                return next > 100 ? 100 : next;
            });
        }, 60);

        const timeout = setTimeout(() => {
            clearInterval(interval);
            navigate('/main-page');
        }, 6500);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [navigate]);

    return (
        <div className='flex items-center justify-center bg-[#0A0E15] h-screen w-screen relative'>
            <img
                className='h-72 absolute top-[30%]'
                src={banner}
                alt="Logo"
            />

            <div className='absolute bottom-52 w-96 h-1 bg-gray-700 rounded overflow-hidden'>
                <div
                    className='h-full bg-purple-600 transition-all duration-100 ease-linear'
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

export default SplashScreen;

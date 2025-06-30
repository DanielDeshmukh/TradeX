// src/components/MobileComingSoon.jsx
import mobileComingSoon from '../assets/comming-soon.png' // your image path

export default function MobileComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-[#020D24] px-4 text-center">
      <img 
        src={mobileComingSoon} 
        alt="Mobile Coming Soon" 
        className="w-[250px] sm:w-[300px] md:w-[400px] max-w-full mb-6"
      />
      <hr className=' h-1 w-full'/>
      <p className="text-gray-300 text-sm sm:text-base mb-2">Hey! Looks like you're on mobile.</p>
      <h1 className="text-white text-xl sm:text-2xl font-semibold">
        TradeX Mobile<br/>Coming Soon
      </h1>
    </div>
  )
}

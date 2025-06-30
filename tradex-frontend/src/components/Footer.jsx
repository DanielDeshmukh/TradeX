import dhanLogo from '../assets/dhan.svg'; 

function Footer() {
  return (
    <footer className="bg-[#0F1117] text-center text-gray-600 text-xs py-3 border-t border-[#1F2937] flex justify-between items-center px-4 max-h-[50px] overflow-hidden">
      <span> © 2025 TradeX. All rights reserved By Daniel & Saurabh.</span>
     <span className='flex '>Powered by <img src={dhanLogo} alt="dhan" className="h-full max-h-[20px] mx-2" /> </span> 
    </footer>
  );
}

export default Footer;
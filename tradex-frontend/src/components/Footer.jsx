import dhanLogo from '../assets/dhan.svg'; 

function Footer() {
  return (
    <footer className="bg-bg-secondary text-center text-content-muted text-xs py-3 border-t border-white/5 flex justify-between items-center px-4 max-h-[50px] overflow-hidden">
      <span> © 2025 TradeX. All rights reserved By Daniel & Saurabh.</span>
     <span className='flex '>Powered by <img src={dhanLogo} alt="dhan" className="h-full max-h-[20px] mx-2" /> </span> 
    </footer>
  );
}

export default Footer;
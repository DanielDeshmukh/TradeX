import React, { useEffect, useState } from 'react';
import { TrendingUp, Shield, Zap, Users, Menu, X, Check, Star, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const TradeXLanding = () => {
    const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [navBg, setNavBg] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setNavBg(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const getStarted = () => {
    navigate('/register');
  }

  const mockStocks = [
    { symbol: 'TATA MOTORS', price: '672.70', change: '+0.04%', vol: '1.06Cr', positive: true },
    { symbol: 'MRF LTD', price: '156505.00', change: '+0.10%', vol: '4.6K', positive: true },
    { symbol: 'NESTLE INDIA', price: '1180.50', change: '+0.04%', vol: '3.86L', positive: true },
    { symbol: 'NESTLE INDIA', price: '1180.50', change: '+0.04%', vol: '3.86L', positive: true },
    { symbol: 'NESTLE INDIA', price: '1180.50', change: '+0.04%', vol: '3.86L', positive: true },
    { symbol: 'BHARTI AIRTEL', price: '1450.30', change: '-0.12%', vol: '2.4Cr', positive: false },
    { symbol: 'BHARTI AIRTEL', price: '1450.30', change: '-0.12%', vol: '2.4Cr', positive: false },
    { symbol: 'BHARTI AIRTEL', price: '1450.30', change: '-0.12%', vol: '2.4Cr', positive: false },
  ];

  return (
    <div className="bg-[#0A0E15] text-white overflow-x-hidden">
      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-down {
          animation: slideDown 1s ease-out;
        }
        @keyframes fadeInUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in-up {
          animation: fadeInUp 1s ease-out;
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .animate-pulse-glow {
          animation: pulse-glow 4s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${navBg ? 'bg-[#0A0E15] border-b border-[#7826F0]/20 shadow-lg shadow-[#7826F0]/10' : 'bg-[#0A0E15]'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <span className='text-2xl font-bold text-[#7826F0]'>Trade</span><span className="text-2xl font-bold ">X</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection('home')} className="hover:text-[#7826F0] transition-colors">Home</button>
            <button onClick={() => scrollToSection('about')} className="hover:text-[#7826F0] transition-colors">About</button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-[#7826F0] transition-colors">Pricing</button>
            <button onClick={() => getStarted()} className="bg-[#7826F0] px-6 py-2 rounded-full hover:shadow-lg hover:shadow-[#7826F0]/50 transition-all hover:brightness-110">
              Get Started
            </button>
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden">
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-[#0A0E15] border-t border-[#7826F0]/20">
            <div className="px-6 py-4 space-y-4">
              <button onClick={() => scrollToSection('home')} className="block w-full text-left hover:text-[#7826F0]">Home</button>
              <button onClick={() => scrollToSection('about')} className="block w-full text-left hover:text-[#7826F0]">About</button>
              <button onClick={() => scrollToSection('pricing')} className="block w-full text-left hover:text-[#7826F0]">Pricing</button>
              <button onClick={() => getStarted()} className="block w-full bg-[#7826F0] px-6 py-2 rounded-full text-center">
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0A0E15]">
        <div className="absolute inset-0 bg-[#0A0E15]">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `linear-gradient(rgba(120, 38, 240, 0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(120, 38, 240, 0.5) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            transform: `translateY(${scrollY * 0.15}px)`
          }} />
          
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7826F0]/10 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#7826F0]/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center" style={{ transform: `translateY(${scrollY * 0.15}px)` }}>
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-[#7826F0]/20 border border-[#7826F0]/30 mb-8 animate-slide-down">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm">Beginner-First Trading Platform</span>
          </div>

         <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up leading-tight">
  Transforming India's
  <br />
  <span className="text-[#7826F0]">beginner traders</span>
  <br />
  into confident market participants
</h1>

<p
  className="text-lg md:text-xl text-gray-400 mb-12 max-w-3xl mx-auto animate-fade-in-up"
  style={{ animationDelay: '0.3s' }}
>
  We build intuitive trading tools that simplify complex market analysis,
  minimize risk, and make investing accessible to everyone. Turning hesitation into confidence and
  insights into action.
</p> 


          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <button onClick={() => getStarted()} className="bg-[#7826F0] px-8 py-4 rounded-full text-lg font-semibold hover:shadow-lg hover:shadow-[#7826F0]/50 transition-all hover:scale-105 hover:brightness-110">
              Get Started
            </button>
            <button onClick={() => scrollToSection('about')} className="bg-white/5 border border-[#7826F0]/30 px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/10 transition-all">
              Learn More
            </button>
          </div>

          
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-96 opacity-20 pointer-events-none" style={{ 
          transform: `translateY(${scrollY * 0.08}px)`,
          transition: 'transform 0.3s ease-out'
        }}>
          <svg width="100%" height="100%" viewBox="0 0 1400 400" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0"/>
              </linearGradient>
            </defs>
            
            {/* Candlesticks */}
            <rect x="50" y="200" width="12" height="80" fill="#ef4444" opacity="0.8"/>
            <line x1="56" y1="180" x2="56" y2="300" stroke="#ef4444" strokeWidth="2"/>
            
            <rect x="80" y="220" width="12" height="60" fill="#22c55e" opacity="0.8"/>
            <line x1="86" y1="200" x2="86" y2="300" stroke="#22c55e" strokeWidth="2"/>
            
            <rect x="110" y="180" width="12" height="90" fill="#ef4444" opacity="0.8"/>
            <line x1="116" y1="160" x2="116" y2="290" stroke="#ef4444" strokeWidth="2"/>
            
            <rect x="140" y="150" width="12" height="100" fill="#22c55e" opacity="0.8"/>
            <line x1="146" y1="130" x2="146" y2="270" stroke="#22c55e" strokeWidth="2"/>
            
            <rect x="170" y="170" width="12" height="70" fill="#22c55e" opacity="0.8"/>
            <line x1="176" y1="150" x2="176" y2="260" stroke="#22c55e" strokeWidth="2"/>
            
            <rect x="200" y="140" width="12" height="80" fill="#22c55e" opacity="0.8"/>
            <line x1="206" y1="120" x2="206" y2="240" stroke="#22c55e" strokeWidth="2"/>
            
            <rect x="230" y="130" width="12" height="100" fill="#22c55e" opacity="0.8"/>
            <line x1="236" y1="110" x2="236" y2="250" stroke="#22c55e" strokeWidth="2"/>
            
            <rect x="260" y="120" width="12" height="90" fill="#ef4444" opacity="0.8"/>
            <line x1="266" y1="100" x2="266" y2="230" stroke="#ef4444" strokeWidth="2"/>
            
            <rect x="290" y="100" width="12" height="110" fill="#22c55e" opacity="0.8"/>
            <line x1="296" y1="80" x2="296" y2="230" stroke="#22c55e" strokeWidth="2"/>
            
            <rect x="320" y="90" width="12" height="100" fill="#ef4444" opacity="0.8"/>
            <line x1="326" y1="70" x2="326" y2="210" stroke="#ef4444" strokeWidth="2"/>
            
            <rect x="350" y="110" width="12" height="80" fill="#ef4444" opacity="0.8"/>
            <line x1="356" y1="90" x2="356" y2="210" stroke="#ef4444" strokeWidth="2"/>
            
            <rect x="380" y="100" width="12" height="90" fill="#22c55e" opacity="0.8"/>
            <line x1="386" y1="80" x2="386" y2="210" stroke="#22c55e" strokeWidth="2"/>
            
            <rect x="410" y="95" width="12" height="95" fill="#22c55e" opacity="0.8"/>
            <line x1="416" y1="75" x2="416" y2="210" stroke="#22c55e" strokeWidth="2"/>
            
            <rect x="440" y="85" width="12" height="105" fill="#22c55e" opacity="0.8"/>
            <line x1="446" y1="65" x2="446" y2="210" stroke="#22c55e" strokeWidth="2"/>
            
            <rect x="470" y="110" width="12" height="90" fill="#ef4444" opacity="0.8"/>
            <line x1="476" y1="90" x2="476" y2="220" stroke="#ef4444" strokeWidth="2"/>
            
            <rect x="500" y="120" width="12" height="100" fill="#ef4444" opacity="0.8"/>
            <line x1="506" y1="100" x2="506" y2="240" stroke="#ef4444" strokeWidth="2"/>
            
            <rect x="530" y="100" width="12" height="120" fill="#22c55e" opacity="0.8"/>
            <line x1="536" y1="80" x2="536" y2="240" stroke="#22c55e" strokeWidth="2"/>
            
            <rect x="560" y="140" width="12" height="80" fill="#ef4444" opacity="0.8"/>
            <line x1="566" y1="120" x2="566" y2="240" stroke="#ef4444" strokeWidth="2"/>
            
            <rect x="590" y="150" width="12" height="90" fill="#ef4444" opacity="0.8"/>
            <line x1="596" y1="130" x2="596" y2="260" stroke="#ef4444" strokeWidth="2"/>
            
            <rect x="620" y="130" width="12" height="110" fill="#22c55e" opacity="0.8"/>
            <line x1="626" y1="110" x2="626" y2="260" stroke="#22c55e" strokeWidth="2"/>
            
            <rect x="650" y="160" width="12" height="80" fill="#ef4444" opacity="0.8"/>
            <line x1="656" y1="140" x2="656" y2="260" stroke="#ef4444" strokeWidth="2"/>
            
            <rect x="680" y="170" width="12" height="90" fill="#ef4444" opacity="0.8"/>
            <line x1="686" y1="150" x2="686" y2="280" stroke="#ef4444" strokeWidth="2"/>
            
            <rect x="710" y="150" width="12" height="110" fill="#22c55e" opacity="0.8"/>
            <line x1="716" y1="130" x2="716" y2="280" stroke="#22c55e" strokeWidth="2"/>
            
            <rect x="740" y="140" width="12" height="100" fill="#22c55e" opacity="0.8"/>
            <line x1="746" y1="120" x2="746" y2="260" stroke="#22c55e" strokeWidth="2"/>
            
            <rect x="770" y="130" width="12" height="110" fill="#22c55e" opacity="0.8"/>
            <line x1="776" y1="110" x2="776" y2="260" stroke="#22c55e" strokeWidth="2"/>
            
            <rect x="800" y="150" width="12" height="90" fill="#ef4444" opacity="0.8"/>
            <line x1="806" y1="130" x2="806" y2="260" stroke="#ef4444" strokeWidth="2"/>
            
            <rect x="830" y="140" width="12" height="100" fill="#ef4444" opacity="0.8"/>
            <line x1="836" y1="120" x2="836" y2="260" stroke="#ef4444" strokeWidth="2"/>
            
            <rect x="860" y="120" width="12" height="120" fill="#22c55e" opacity="0.8"/>
            <line x1="866" y1="100" x2="866" y2="260" stroke="#22c55e" strokeWidth="2"/>
            
            <rect x="890" y="130" width="12" height="110" fill="#ef4444" opacity="0.8"/>
            <line x1="896" y1="110" x2="896" y2="260" stroke="#ef4444" strokeWidth="2"/>
            
            <rect x="920" y="110" width="12" height="130" fill="#22c55e" opacity="0.8"/>
            <line x1="926" y1="90" x2="926" y2="260" stroke="#22c55e" strokeWidth="2"/>
            
            <rect x="950" y="100" width="12" height="140" fill="#22c55e" opacity="0.8"/>
            <line x1="956" y1="80" x2="956" y2="260" stroke="#22c55e" strokeWidth="2"/>
            
            <rect x="980" y="90" width="12" height="150" fill="#22c55e" opacity="0.8"/>
            <line x1="986" y1="70" x2="986" y2="260" stroke="#22c55e" strokeWidth="2"/>
            
            <rect x="1010" y="120" width="12" height="120" fill="#ef4444" opacity="0.8"/>
            <line x1="1016" y1="100" x2="1016" y2="260" stroke="#ef4444" strokeWidth="2"/>
            
            <rect x="1040" y="110" width="12" height="130" fill="#ef4444" opacity="0.8"/>
            <line x1="1046" y1="90" x2="1046" y2="260" stroke="#ef4444" strokeWidth="2"/>
            
            <rect x="1070" y="100" width="12" height="140" fill="#22c55e" opacity="0.8"/>
            <line x1="1076" y1="80" x2="1076" y2="260" stroke="#22c55e" strokeWidth="2"/>
            
            <rect x="1100" y="110" width="12" height="130" fill="#22c55e" opacity="0.8"/>
            <line x1="1106" y1="90" x2="1106" y2="260" stroke="#22c55e" strokeWidth="2"/>
            
            <rect x="1130" y="100" width="12" height="140" fill="#22c55e" opacity="0.8"/>
            <line x1="1136" y1="80" x2="1136" y2="260" stroke="#22c55e" strokeWidth="2"/>

            <rect x="860" y="120" width="12" height="120" fill="#22c55e" opacity="0.8"/>
            <line x1="866" y1="100" x2="866" y2="260" stroke="#22c55e" strokeWidth="2"/>
            
            <rect x="890" y="130" width="12" height="110" fill="#ef4444" opacity="0.8"/>
            <line x1="896" y1="110" x2="896" y2="260" stroke="#ef4444" strokeWidth="2"/>
            
            <rect x="920" y="110" width="12" height="130" fill="#22c55e" opacity="0.8"/>
            <line x1="926" y1="90" x2="926" y2="260" stroke="#22c55e" strokeWidth="2"/>
            
            <rect x="950" y="100" width="12" height="140" fill="#22c55e" opacity="0.8"/>
            <line x1="956" y1="80" x2="956" y2="260" stroke="#22c55e" strokeWidth="2"/>
            
            <rect x="980" y="90" width="12" height="150" fill="#22c55e" opacity="0.8"/>
            <line x1="986" y1="70" x2="986" y2="260" stroke="#22c55e" strokeWidth="2"/>
            
            <rect x="1010" y="120" width="12" height="120" fill="#ef4444" opacity="0.8"/>
            <line x1="1016" y1="100" x2="1016" y2="260" stroke="#ef4444" strokeWidth="2"/>
            
            <rect x="1040" y="110" width="12" height="130" fill="#ef4444" opacity="0.8"/>
            <line x1="1046" y1="90" x2="1046" y2="260" stroke="#ef4444" strokeWidth="2"/>
            
            <rect x="1070" y="100" width="12" height="140" fill="#22c55e" opacity="0.8"/>
            <line x1="1076" y1="80" x2="1076" y2="260" stroke="#22c55e" strokeWidth="2"/>
            
            <rect x="1100" y="110" width="12" height="130" fill="#22c55e" opacity="0.8"/>
            <line x1="1106" y1="90" x2="1106" y2="260" stroke="#22c55e" strokeWidth="2"/>
            
            <rect x="1130" y="100" width="12" height="140" fill="#22c55e" opacity="0.8"/>
            <line x1="1136" y1="80" x2="1136" y2="260" stroke="#22c55e" strokeWidth="2"/>
          </svg>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0A0E15] to-transparent pointer-events-none" />
      </section>

      <section className="relative py-20 px-6 bg-[#0A0E15]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-[#7826F0]">Live Market Data</span> at Your Fingertips
            </h2>
            <p className="text-gray-400">Real-time tracking and comprehensive insights</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockStocks.map((stock, idx) => (
              <div key={idx} className="bg-[#1A1D29] border border-[#7826F0]/20 rounded-xl p-5 hover:border-[#7826F0]/40 transition-all hover:scale-105">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-sm">{stock.symbol}</h3>
                    <p className="text-xs text-gray-500">NSE</p>
                  </div>
                  {stock.positive ? (
                    <ArrowUpRight className="w-5 h-5 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <div className="text-2xl font-bold mb-2">₹{stock.price}</div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-semibold ${stock.positive ? 'text-green-500' : 'text-red-500'}`}>
                    {stock.change}
                  </span>
                  <span className="text-xs text-gray-500">{stock.vol}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="relative py-32 px-6 bg-[#0A0E15]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold  mb-6">
                Why choose <span className='text-[#7826F0]'>Trade</span>X <span className='text-4xl md:text-5xl font-bold mb-6'>?</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Built for beginners, designed for success
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: 'Secure Trading', desc: 'Multi-factor authentication for maximum security' },
              { icon: Zap, title: 'Smart Indicators', desc: 'Advanced trading indicators to enhance your market analysis' },
              { icon: TrendingUp, title: 'Tiered Plans', desc: 'Flexible subscription models that grow with your trading journey' },
              { icon: Users, title: 'Referral Rewards', desc: 'Earn up to 100% off through our generous referral program' }
            ].map((feature, idx) => (
              <div key={idx} className="bg-[#1A1D29] border border-[#7826F0]/20 p-8 rounded-2xl hover:bg-[#1F2937] hover:border-[#7826F0]/40 transition-all group hover:scale-105">
                <feature.icon className="w-12 h-12 text-[#7826F0] mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="relative py-32 px-6 bg-[#0A0E15]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-400">50% off on your first month!</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Base', price: '199', trades: '15', alerts: '5', addon: '+10 trades @ ₹49', popular: false },
              { name: 'Pro', price: '499', trades: '30', alerts: '10', addon: '+20 trades @ ₹99', popular: true },
              { name: 'Elite', price: '999', trades: '50', alerts: '20', addon: '+30 trades @ ₹299', popular: false }
            ].map((plan, idx) => (
              <div key={idx} className={`bg-[#1A1D29] border p-8 rounded-2xl hover:scale-105 transition-all relative ${plan.popular ? 'border-[#7826F0]' : 'border-[#7826F0]/20'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#7826F0] px-4 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>Most Popular</span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold">₹{plan.price}</span>
                    <span className="text-gray-400 ml-2">/month</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-400" />
                    <span>{plan.trades} Trades/Day</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-400" />
                    <span>{plan.alerts} Alerts/Month</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-400" />
                    <span>{plan.addon}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-400" />
                    <span>Secure Authentication</span>
                  </div>
                </div>

                <button onClick={() => getStarted()} className={`w-full py-3 rounded-full font-semibold transition-all ${
                  plan.popular 
                    ? 'bg-[#7826F0] hover:shadow-lg hover:shadow-[#7826F0]/50 hover:brightness-110' 
                    : 'bg-white/5 border border-[#7826F0]/30 hover:bg-white/10'
                }`}>
                  Get Started
                </button>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-[#1A1D29] border border-[#7826F0]/20 p-8 rounded-2xl text-center  hover:border-[#7826F0]/40 transition-all">
            <h3 className="text-2xl font-bold mb-4">TradeX for Business (Planned Future Scope)</h3>
            <p className="text-gray-400 mb-4">For professional traders and institutions - ₹1,000/month with up to 5 devices</p>
            <button onClick={() => scrollToSection('register')} className="bg-[#7826F0] px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-[#7826F0]/50 transition-all hover:brightness-110">
              Contact Sales
            </button>
          </div>
        </div>
      </section>


      <footer className="border-t border-[#7826F0]/20 py-8 px-6 bg-[#0A0E15]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center space-y-4 md:space-y-0">
          <div className="flex items-center">
            <span className='text-lg font-bold text-[#7826F0]'>Trade</span><span className="text-lg font-bold ">X</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default TradeXLanding;
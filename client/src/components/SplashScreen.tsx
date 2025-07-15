import { useEffect, useState } from "react";
import sudhamritLogo from "@assets/111_1750417572953.png";

interface SplashScreenProps {
  onComplete?: () => void;
  duration?: number; // Duration in milliseconds
}

export default function SplashScreen({ onComplete, duration = 3000 }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 500); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 overflow-hidden transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      {/* Animated background pattern */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Geometric shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-400/15 to-cyan-400/15 rounded-lg rotate-45 animate-bounce delay-300"></div>
        <div className="absolute bottom-32 left-16 w-20 h-20 sm:w-28 sm:h-28 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full animate-pulse delay-500"></div>
        <div className="absolute bottom-20 right-32 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-400/15 to-red-400/15 rounded-lg rotate-12 animate-bounce delay-700"></div>
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/3 w-3 h-3 sm:w-4 sm:h-4 bg-white/40 rounded-full animate-ping"></div>
        <div className="absolute top-1/2 right-1/4 w-2 h-2 sm:w-3 sm:h-3 bg-purple-300/50 rounded-full animate-ping delay-200"></div>
        <div className="absolute bottom-1/3 left-1/5 w-4 h-4 sm:w-5 sm:h-5 bg-cyan-300/40 rounded-full animate-ping delay-400"></div>
        <div className="absolute top-3/4 right-1/3 w-2 h-2 sm:w-3 sm:h-3 bg-pink-300/50 rounded-full animate-ping delay-600"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
        {/* Logo container with modern glass effect */}
        <div className={`transition-all duration-1500 ease-out ${logoLoaded ? 'opacity-100 transform translate-y-0 scale-100' : 'opacity-0 transform translate-y-12 scale-95'}`}>
          <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl sm:rounded-4xl p-8 sm:p-10 lg:p-14 shadow-2xl border border-white/20">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-3xl sm:rounded-4xl blur-xl"></div>
            
            {/* Logo */}
            <div className="relative z-10">
              <img
                src={sudhamritLogo}
                alt="Sudhamrit"
                className="h-20 sm:h-24 md:h-28 lg:h-32 xl:h-36 w-auto mx-auto object-contain filter drop-shadow-2xl"
                onLoad={() => setLogoLoaded(true)}
                onError={() => setLogoLoaded(true)}
              />
            </div>
          </div>
        </div>

        {/* Brand name */}
        {/* <div className={`mt-8 sm:mt-10 transition-all duration-1500 delay-300 ease-out ${logoLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-6'}`}>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Sudhamrit
          </h1>
        </div> */}

        {/* Subtitle */}
        <div className={`mt-4 sm:mt-6 transition-all duration-1500 delay-500 ease-out ${logoLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}>
          <p className="text-white/80 text-base sm:text-lg lg:text-xl font-light tracking-wider">
            Inventory Management System
          </p>
        </div>

        {/* Modern loading indicator */}
        <div className={`mt-12 sm:mt-16 transition-all duration-1500 delay-700 ease-out ${logoLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-bounce delay-100"></div>
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full animate-bounce delay-200"></div>
          </div>
          <p className="text-white/60 text-xs sm:text-sm mt-4 font-light">
            Loading...
          </p>
        </div>
      </div>

      {/* Animated waves at bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none" 
          className="w-full h-16 sm:h-20 lg:h-24"
        >
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(147, 51, 234, 0.3)" />
              <stop offset="50%" stopColor="rgba(59, 130, 246, 0.3)" />
              <stop offset="100%" stopColor="rgba(16, 185, 129, 0.3)" />
            </linearGradient>
          </defs>
          <path 
            fill="url(#waveGradient)" 
            d="M0,120 C200,100 400,80 600,90 C800,100 1000,110 1200,100 L1200,120 Z"
            className="animate-pulse"
          />
        </svg>
      </div>
    </div>
  );
}
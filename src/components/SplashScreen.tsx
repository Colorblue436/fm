import React, { useEffect, useState } from 'react';
import { FamiliarLogo } from './ui/FamiliarLogo';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setIsExiting(true), 2000);
    const finishTimer = setTimeout(() => onFinish(), 2600);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-familiar-500 transition-all duration-700 ease-in-out ${
        isExiting ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
      }`}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-familiar-400 rounded-full opacity-50 blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-familiar-600 rounded-full opacity-50 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className={`relative flex flex-col items-center transition-all duration-1000 transform ${isExiting ? 'scale-110' : 'scale-100'}`}>
        <div className="relative">
          <div className="absolute inset-0 bg-white rounded-3xl animate-ping opacity-20" />
          <div className="w-32 h-32 bg-white rounded-3xl shadow-2xl flex items-center justify-center animate-bounce">
            <FamiliarLogo className="w-20 h-20 text-familiar-500" />
          </div>
        </div>

        <div className="mt-8 text-center">
          <h1 className="text-4xl font-bold text-white tracking-tight">Familiar</h1>
          <p className="text-familiar-100 mt-2 font-medium tracking-wide text-sm uppercase">
            Love your pet
          </p>
        </div>
      </div>
    </div>
  );
};

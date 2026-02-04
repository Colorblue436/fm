import React from 'react';
import { FamiliarLogo } from './FamiliarLogo';

export const Loading: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-familiar-500 rounded-2xl flex items-center justify-center text-white animate-pulse">
          <FamiliarLogo className="w-10 h-10" />
        </div>
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-familiar-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-familiar-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-familiar-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};

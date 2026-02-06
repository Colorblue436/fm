import React from 'react';
import { Navigation } from './Navigation';
import { AppView } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  onLogout: () => void;
  isYouMode: boolean;
  onToggleYouMode: () => void;
  userMode?: 'visitor' | 'pet_owner' | null;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  onChangeView, 
  onLogout,
  isYouMode,
  onToggleYouMode,
  userMode
}) => {
  return (
    <div className={`min-h-screen flex transition-colors duration-500 ${isYouMode ? 'bg-zinc-900 text-zinc-50' : 'bg-familiar-50 text-gray-900'}`}>
      <Navigation 
        currentView={currentView} 
        onChangeView={onChangeView} 
        onLogout={onLogout} 
        isYouMode={isYouMode}
        onToggleYouMode={onToggleYouMode}
        userMode={userMode}
      />
      
      <main className="flex-1 md:ml-64 w-full min-h-screen overflow-y-auto pb-24 md:pb-8 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

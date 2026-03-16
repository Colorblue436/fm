import React from 'react';
import { Navigation } from './Navigation';
import { AppView } from '../types';
import type { UserRole } from '@/hooks/useUserRole';

export interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  onLogout: () => void;
  isYouMode: boolean;
  onToggleYouMode: () => void;
  userRole?: UserRole;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  onChangeView, 
  onLogout,
  isYouMode,
  onToggleYouMode,
  userRole
}) => {
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Navigation 
        currentView={currentView} 
        onChangeView={onChangeView} 
        onLogout={onLogout} 
        isYouMode={isYouMode}
        onToggleYouMode={onToggleYouMode}
      />
      
      <main className="flex-1 md:ml-56 w-full min-h-screen overflow-y-auto pb-24 md:pb-6 p-4 md:px-8 md:py-6">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

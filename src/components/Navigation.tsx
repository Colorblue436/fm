import React, { useState } from 'react';
import { Home, Dog, Calendar, MessageCircle, LogOut, Users, Play, Grid, User, MapPin } from 'lucide-react';
import { AppView } from '../types';
import { FamiliarLogo } from './ui/FamiliarLogo';

interface NavigationProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  onLogout: () => void;
  isYouMode: boolean;
  onToggleYouMode: () => void;
  userMode?: 'visitor' | 'pet_owner' | null;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  currentView, 
  onChangeView, 
  onLogout,
  isYouMode,
  onToggleYouMode,
  userMode
}) => {
  const [lastTap, setLastTap] = useState(0);

  // Visitors can't toggle to pet mode
  const handleLogoTap = (e: React.MouseEvent) => {
    e.preventDefault();
    if (userMode === 'visitor') return; // Visitors stay in community mode
    const now = Date.now();
    if (now - lastTap < 300) onToggleYouMode();
    setLastTap(now);
  };

  const standardNavItems = [
    { view: AppView.HOME, icon: Home, label: 'Home' },
    { view: AppView.PETS, icon: Dog, label: 'Pets' },
    { view: AppView.REMINDERS, icon: Calendar, label: 'Tasks' },
    { view: AppView.NEARBY, icon: MapPin, label: 'Nearby' },
    { view: AppView.ASSISTANT, icon: MessageCircle, label: 'Chat' },
  ];

  const youNavItems = [
    { view: AppView.COMMUNITY, icon: Users, label: 'Community' },
    { view: AppView.DROPS, icon: Play, label: 'Drops' },
    { view: AppView.GROUPS, icon: Grid, label: 'Groups' },
    { view: AppView.PROFILE, icon: User, label: 'Profile' },
  ];

  // Visitors only see community navigation
  const navItems = userMode === 'visitor' ? youNavItems : (isYouMode ? youNavItems : standardNavItems);
  
  // For visitors, always show as "You" mode visually
  const effectiveYouMode = userMode === 'visitor' ? true : isYouMode;
  
  const sidebarBg = effectiveYouMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-100';
  const bottomBarBg = effectiveYouMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-100';
  const logoTextColor = effectiveYouMode ? 'text-white' : 'text-familiar-900';
  
  const activeItemStyle = effectiveYouMode 
    ? 'text-white bg-familiar-600 shadow-md' 
    : 'text-familiar-600 bg-familiar-50 md:bg-familiar-100';
  const inactiveItemStyle = effectiveYouMode 
    ? 'text-zinc-400 hover:bg-zinc-700 hover:text-white' 
    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700';

  const renderMobileItem = (item: typeof navItems[0]) => {
    const isActive = currentView === item.view;
    return (
      <button
        key={item.view}
        onClick={() => onChangeView(item.view)}
        className={`flex flex-col items-center justify-center py-2 rounded-xl transition-all ${isActive ? 'scale-105' : ''} ${isActive ? (effectiveYouMode ? 'text-white' : 'text-familiar-500') : (effectiveYouMode ? 'text-zinc-500' : 'text-gray-400')}`}
      >
        <div className={`p-1.5 rounded-xl ${isActive ? (effectiveYouMode ? 'bg-familiar-500' : 'bg-familiar-100') : ''}`}>
          <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
        </div>
        <span className="text-[10px] mt-1 font-medium">{item.label}</span>
      </button>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className={`hidden md:flex flex-col w-64 border-r h-screen p-4 fixed left-0 top-0 z-20 transition-colors duration-500 ${sidebarBg}`}>
        <div 
          className={`flex items-center gap-2 mb-8 px-4 select-none group ${userMode === 'visitor' ? '' : 'cursor-pointer'}`}
          onClick={handleLogoTap}
          title={userMode === 'visitor' ? 'Community Mode' : 'Double tap to switch modes'}
        >
          <div className="w-10 h-10 bg-familiar-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-familiar-500/30 group-hover:scale-105 transition-transform">
            {effectiveYouMode ? <User size={20} /> : <FamiliarLogo className="w-6 h-6" />}
          </div>
          <span className={`text-xl font-bold ${logoTextColor} tracking-tight`}>
            {effectiveYouMode ? 'You' : 'Familiar'}
          </span>
        </div>
        
        <div className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => onChangeView(item.view)}
                className={`flex items-center px-4 py-3 rounded-2xl transition-all duration-200 ${
                  isActive ? `${activeItemStyle} font-semibold` : inactiveItemStyle
                }`}
              >
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} className="mr-3" />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-auto px-4 pb-4">
          <button 
            onClick={onLogout}
            className={`flex items-center text-sm w-full transition-colors ${effectiveYouMode ? 'text-zinc-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`}
          >
            <LogOut size={18} className="mr-3" />
            Logout
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 border-t pb-safe z-20 rounded-t-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] transition-colors duration-500 ${bottomBarBg}`}>
        <div className="flex justify-between items-end px-2 pb-2">
          <div className="flex flex-1 justify-around">
            {navItems.slice(0, 2).map(renderMobileItem)}
          </div>
          
          <div 
            className={`relative -top-6 mx-2 flex-shrink-0 z-30 ${userMode === 'visitor' ? '' : 'cursor-pointer'}`}
            onClick={handleLogoTap}
          >
            <div className={`w-14 h-14 bg-familiar-500 rounded-full flex items-center justify-center text-white shadow-lg border-4 transition-transform active:scale-95 ${effectiveYouMode ? 'border-zinc-800' : 'border-white'}`}>
              {effectiveYouMode ? <User size={24} /> : <FamiliarLogo className="w-8 h-8" />}
            </div>
          </div>

          <div className="flex flex-1 justify-around">
            {navItems.slice(2, 4).map(renderMobileItem)}
          </div>
        </div>
      </nav>
    </>
  );
};

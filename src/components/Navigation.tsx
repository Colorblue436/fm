import React, { useState, useRef, useEffect } from 'react';
import { Dog, Calendar, MessageCircle, LogOut, Users, Play, Grid, User, MapPin, Megaphone, Plus, ClipboardList, UtensilsCrossed, Stethoscope } from 'lucide-react';
import { AppView } from '../types';
import { FamiliarLogo } from './ui/FamiliarLogo';

interface NavigationProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  onLogout: () => void;
  isYouMode: boolean;
  onToggleYouMode: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  currentView, 
  onChangeView, 
  onLogout,
  isYouMode,
  onToggleYouMode
}) => {
  const [lastTap, setLastTap] = useState(0);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);

  const handleLogoTap = (e: React.MouseEvent) => {
    e.preventDefault();
    const now = Date.now();
    if (now - lastTap < 300) onToggleYouMode();
    setLastTap(now);
  };

  // Close quick actions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (quickActionsRef.current && !quickActionsRef.current.contains(e.target as Node)) {
        setShowQuickActions(false);
      }
    };
    if (showQuickActions) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showQuickActions]);

  const handlePawPress = () => {
    onChangeView(AppView.HOME);
    setShowQuickActions(false);
  };

  const handlePawLongPressStart = () => {
    longPressTimer.current = setTimeout(() => {
      setShowQuickActions(true);
    }, 500);
  };

  const handlePawLongPressEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const quickActions = [
    { icon: Plus, label: 'Add Pet', action: () => { onChangeView(AppView.PETS); setShowQuickActions(false); } },
    { icon: ClipboardList, label: 'Add Task', action: () => { onChangeView(AppView.REMINDERS); setShowQuickActions(false); } },
    { icon: UtensilsCrossed, label: 'Log Meal', action: () => { onChangeView(AppView.PETS); setShowQuickActions(false); } },
    { icon: Stethoscope, label: 'Find Vet', action: () => { onChangeView(AppView.NEARBY); setShowQuickActions(false); } },
  ];

  const standardNavItems = [
    { view: AppView.PETS, icon: Dog, label: 'Pets' },
    { view: AppView.REMINDERS, icon: Calendar, label: 'Tasks' },
    { view: AppView.NEARBY, icon: MapPin, label: 'Nearby' },
    { view: AppView.ASSISTANT, icon: MessageCircle, label: 'Chat' },
  ];

  const youNavItems = [
    { view: AppView.COMMUNITY, icon: Users, label: 'Community' },
    { view: AppView.DROPS, icon: Play, label: 'Drops' },
    { view: AppView.GROUPS, icon: Grid, label: 'Groups' },
    { view: AppView.SCRATCH_BOARD, icon: Megaphone, label: 'Board' },
    { view: AppView.PROFILE, icon: User, label: 'Profile' },
  ];

  const navItems = isYouMode ? youNavItems : standardNavItems;
  const isHomeActive = currentView === AppView.HOME && !isYouMode;
  
  const sidebarBg = isYouMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-100';
  const bottomBarBg = isYouMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white/95 backdrop-blur-lg border-gray-100';
  const logoTextColor = isYouMode ? 'text-white' : 'text-familiar-900';
  
  const activeItemStyle = isYouMode 
    ? 'text-white bg-familiar-600 shadow-md' 
    : 'text-familiar-600 bg-familiar-50 md:bg-familiar-100';
  const inactiveItemStyle = isYouMode 
    ? 'text-zinc-400 hover:bg-zinc-700 hover:text-white' 
    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700';

  const renderMobileItem = (item: typeof standardNavItems[0]) => {
    const isActive = currentView === item.view;
    return (
      <button
        key={item.view}
        onClick={() => onChangeView(item.view)}
        className="flex flex-col items-center justify-center py-1 min-w-[56px] transition-all"
      >
        <div className={`p-1.5 rounded-2xl transition-colors ${isActive ? 'bg-familiar-100' : ''}`}>
          <item.icon 
            size={22} 
            strokeWidth={isActive ? 2.5 : 1.8} 
            className={`transition-colors ${isActive ? 'text-familiar-500' : 'text-gray-400'}`}
          />
        </div>
        <span className={`text-[10px] mt-0.5 font-medium transition-colors ${isActive ? 'text-familiar-500' : 'text-gray-400'}`}>
          {item.label}
        </span>
      </button>
    );
  };

  // Desktop sidebar items include Home
  const desktopNavItems = isYouMode ? youNavItems : [
    { view: AppView.HOME, icon: FamiliarLogo as any, label: 'Home' },
    ...standardNavItems,
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className={`hidden md:flex flex-col w-64 border-r h-screen p-4 fixed left-0 top-0 z-20 transition-colors duration-500 ${sidebarBg}`}>
        <div 
          className="flex items-center gap-2 mb-8 px-4 cursor-pointer select-none group"
          onClick={handleLogoTap}
          title="Double tap to switch modes"
        >
          <div className="w-10 h-10 bg-familiar-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-familiar-500/30 group-hover:scale-105 transition-transform">
            {isYouMode ? <User size={20} /> : <FamiliarLogo className="w-6 h-6" />}
          </div>
          <span className={`text-xl font-bold ${logoTextColor} tracking-tight`}>
            {isYouMode ? 'You' : 'Familiar'}
          </span>
        </div>
        
        <div className="flex flex-col gap-2">
          {desktopNavItems.map((item) => {
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
            className={`flex items-center text-sm w-full transition-colors ${isYouMode ? 'text-zinc-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`}
          >
            <LogOut size={18} className="mr-3" />
            Logout
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 border-t pb-safe z-20 rounded-t-3xl shadow-[0_-2px_20px_-4px_rgba(0,0,0,0.08)] transition-colors duration-500 ${bottomBarBg}`}>
        {/* Quick Actions Popup */}
        {showQuickActions && (
          <div ref={quickActionsRef} className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="bg-card rounded-2xl shadow-xl border border-border p-2 grid grid-cols-2 gap-1 min-w-[200px]">
              {quickActions.map((qa) => (
                <button
                  key={qa.label}
                  onClick={qa.action}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-familiar-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-familiar-100 flex items-center justify-center">
                    <qa.icon size={16} className="text-familiar-600" />
                  </div>
                  <span className="text-xs font-medium text-foreground">{qa.label}</span>
                </button>
              ))}
            </div>
            <div className="w-3 h-3 bg-card border-r border-b border-border rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1.5" />
          </div>
        )}

        <div className="flex justify-between items-end px-4 pb-2 pt-1">
          {/* Left side: Pets, Tasks */}
          <div className="flex flex-1 justify-around">
            {isYouMode 
              ? navItems.slice(0, 2).map(renderMobileItem)
              : navItems.slice(0, 2).map(renderMobileItem)
            }
          </div>
          
          {/* Center: Floating Paw Button */}
          <div className="relative -top-5 mx-3 flex-shrink-0 z-30">
            {isYouMode ? (
              <div 
                className="w-14 h-14 bg-zinc-700 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-zinc-800 cursor-pointer transition-transform active:scale-95"
                onClick={handleLogoTap}
              >
                <User size={24} />
              </div>
            ) : (
              <button
                onClick={handlePawPress}
                onMouseDown={handlePawLongPressStart}
                onMouseUp={handlePawLongPressEnd}
                onMouseLeave={handlePawLongPressEnd}
                onTouchStart={handlePawLongPressStart}
                onTouchEnd={handlePawLongPressEnd}
                className={`w-[60px] h-[60px] rounded-full flex items-center justify-center text-white border-4 border-background cursor-pointer transition-all active:scale-90 shadow-[0_4px_20px_-2px_rgba(139,92,246,0.5)] ${
                  isHomeActive 
                    ? 'bg-gradient-to-br from-[hsl(var(--purple-start))] to-[hsl(var(--purple-end))] scale-110' 
                    : 'bg-gradient-to-br from-[hsl(var(--purple-start))] to-[hsl(var(--purple-end))]'
                }`}
              >
                <FamiliarLogo className={`w-8 h-8 transition-transform ${isHomeActive ? 'scale-110' : ''}`} />
              </button>
            )}
          </div>

          {/* Right side: Nearby, Chat */}
          <div className="flex flex-1 justify-around">
            {isYouMode 
              ? navItems.slice(2, 4).map(renderMobileItem)
              : navItems.slice(2, 4).map(renderMobileItem)
            }
          </div>
        </div>
      </nav>
    </>
  );
};

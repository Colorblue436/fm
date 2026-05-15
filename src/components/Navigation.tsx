import React, { useState, useRef, useEffect } from 'react';
import { Home, Dog, Calendar, MessageCircle, LogOut, Users, Play, Grid, User, MapPin, Megaphone, Plus, ClipboardList, UtensilsCrossed, Stethoscope, FileHeart, ListChecks, Trophy } from 'lucide-react';
import { AppView } from '../types';
import { FamiliarLogo } from './ui/FamiliarLogo';
import type { UserRole } from '@/hooks/useUserRole';
import { getAllowedViews } from '@/lib/roleAccess';

interface NavigationProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  onLogout: () => void;
  isYouMode: boolean;
  onToggleYouMode: () => void;
  userRole?: UserRole;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  currentView, 
  onChangeView, 
  onLogout,
  isYouMode,
  onToggleYouMode,
  userRole
}) => {
  const [lastTap, setLastTap] = useState(0);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);

  const allowedViews = getAllowedViews(userRole);

  const handleLogoTap = (e: React.MouseEvent) => {
    e.preventDefault();
    // Only allow mode toggle for 'both' role
    if (userRole === 'both') {
      const now = Date.now();
      if (now - lastTap < 300) onToggleYouMode();
      setLastTap(now);
    }
  };

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
    longPressTimer.current = setTimeout(() => setShowQuickActions(true), 500);
  };

  const handlePawLongPressEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const quickActions = [
    { icon: Plus, label: 'Add Pet', action: () => { onChangeView(AppView.PETS); setShowQuickActions(false); } },
    { icon: ClipboardList, label: 'Add Task', action: () => { onChangeView(AppView.REMINDERS); setShowQuickActions(false); } },
    { icon: UtensilsCrossed, label: 'Log Meal', action: () => { onChangeView(AppView.PETS); setShowQuickActions(false); } },
    { icon: Stethoscope, label: 'Find Vet', action: () => { onChangeView(AppView.NEARBY); setShowQuickActions(false); } },
  ].filter(qa => {
    // Filter quick actions based on role
    if (userRole === 'visitor') return false;
    return true;
  });

  // All possible nav items
  const allNavItems = [
    { view: AppView.HOME, icon: Home, label: 'Home' },
    { view: AppView.PETS, icon: Dog, label: 'Pets' },
    { view: AppView.TASKS, icon: ListChecks, label: 'Tasks' },
    { view: AppView.ACHIEVEMENTS, icon: Trophy, label: 'Awards' },
    { view: AppView.HEALTH_RECORDS, icon: FileHeart, label: 'Records' },
    { view: AppView.REMINDERS, icon: Calendar, label: 'Reminders' },
    { view: AppView.NEARBY, icon: MapPin, label: 'Nearby' },
    { view: AppView.ASSISTANT, icon: MessageCircle, label: 'Familiar' },
    { view: AppView.COMMUNITY, icon: Users, label: 'Community' },
    { view: AppView.DROPS, icon: Play, label: 'Drops' },
    { view: AppView.GROUPS, icon: Grid, label: 'Groups' },
    { view: AppView.SCRATCH_BOARD, icon: Megaphone, label: 'Board' },
    { view: AppView.PROFILE, icon: User, label: 'Profile' },
  ];

  // Filter nav items by role
  const filteredNavItems = allNavItems.filter(item => allowedViews.has(item.view));

  // For "both" role, split into two modes
  const petCareViews = [AppView.HOME, AppView.PETS, AppView.TASKS, AppView.ACHIEVEMENTS, AppView.HEALTH_RECORDS, AppView.REMINDERS, AppView.NEARBY, AppView.ASSISTANT];
  const communityViews = [AppView.COMMUNITY, AppView.DROPS, AppView.GROUPS, AppView.SCRATCH_BOARD, AppView.PROFILE];

  let desktopNavItems: typeof allNavItems;
  let mobileNavItems: typeof allNavItems;

  if (userRole === 'both') {
    if (isYouMode) {
      desktopNavItems = allNavItems.filter(i => communityViews.includes(i.view));
      mobileNavItems = desktopNavItems.filter(i => i.view !== AppView.PROFILE).slice(0, 4);
    } else {
      desktopNavItems = allNavItems.filter(i => petCareViews.includes(i.view));
      mobileNavItems = desktopNavItems.filter(i => i.view !== AppView.HOME).slice(0, 4);
    }
  } else {
    desktopNavItems = filteredNavItems;
    mobileNavItems = filteredNavItems.filter(i => i.view !== AppView.HOME && i.view !== AppView.PROFILE && i.view !== AppView.SETTINGS).slice(0, 4);
  }

  const isHomeActive = currentView === AppView.HOME && !isYouMode;
  const showPawButton = userRole !== 'visitor';

  const renderMobileItem = (item: typeof allNavItems[0]) => {
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
            className={`transition-colors ${isActive ? 'text-familiar-500' : 'text-muted-foreground'}`}
          />
        </div>
        <span className={`text-[10px] mt-0.5 font-medium transition-colors ${isActive ? 'text-familiar-500' : 'text-muted-foreground'}`}>
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className={`hidden md:flex flex-col w-56 border-r border-border h-screen py-5 px-3 fixed left-0 top-0 z-20 transition-colors duration-500 bg-card`}>
        <div 
          className="flex items-center gap-2.5 mb-6 px-3 cursor-pointer select-none group"
          onClick={handleLogoTap}
          title={userRole === 'both' ? "Double tap to switch modes" : "Familiar"}
        >
          <div className="w-8 h-8 bg-familiar-500 rounded-lg flex items-center justify-center text-white shadow-md shadow-familiar-500/20 group-hover:scale-105 transition-transform">
            {isYouMode ? <User size={16} /> : <FamiliarLogo className="w-5 h-5" />}
          </div>
          <span className="text-lg font-bold text-foreground tracking-tight">
            {isYouMode ? 'Community' : 'Familiar'}
          </span>
        </div>
        
        <div className="flex flex-col gap-0.5">
          {desktopNavItems.map((item) => {
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => onChangeView(item.view)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-150 ${
                  isActive 
                    ? 'bg-familiar-100 text-familiar-700 font-semibold' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-auto px-3 pb-2">
          <button 
            onClick={onLogout}
            className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-destructive transition-colors w-full py-2"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 border-t border-border pb-safe z-20 rounded-t-3xl shadow-[0_-2px_20px_-4px_rgba(0,0,0,0.08)] transition-colors duration-500 bg-card/95 backdrop-blur-lg`}>
        {showQuickActions && quickActions.length > 0 && (
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
          <div className="flex flex-1 justify-around">
            {mobileNavItems.slice(0, 2).map(renderMobileItem)}
          </div>
          
          <div className="relative -top-5 mx-3 flex-shrink-0 z-30">
            {showPawButton ? (
              isYouMode ? (
                <div 
                  className="w-14 h-14 bg-muted rounded-full flex items-center justify-center text-foreground shadow-lg border-4 border-card cursor-pointer transition-transform active:scale-95"
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
                  className={`w-[60px] h-[60px] rounded-full flex items-center justify-center text-white border-4 border-card cursor-pointer transition-all active:scale-90 shadow-[0_4px_20px_-2px_hsl(var(--familiar-500)/0.4)] ${
                    isHomeActive 
                      ? 'bg-gradient-to-br from-[hsl(var(--purple-start))] to-[hsl(var(--purple-end))] scale-110' 
                      : 'bg-gradient-to-br from-[hsl(var(--purple-start))] to-[hsl(var(--purple-end))]'
                  }`}
                >
                  <FamiliarLogo className={`w-8 h-8 transition-transform ${isHomeActive ? 'scale-110' : ''}`} />
                </button>
              )
            ) : (
              // Visitor: no paw button, just a spacer or community icon
              <div 
                className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-lg border-4 border-card cursor-pointer transition-transform active:scale-95"
                onClick={() => onChangeView(AppView.COMMUNITY)}
              >
                <Users size={24} />
              </div>
            )}
          </div>

          <div className="flex flex-1 justify-around">
            {mobileNavItems.slice(2, 4).map(renderMobileItem)}
          </div>
        </div>
      </nav>
    </>
  );
};

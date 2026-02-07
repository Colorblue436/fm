import React from 'react';
import { Play, Users, Grid, User, Heart } from 'lucide-react';
import { AppView } from '@/types';

type ActiveMode = 'community' | 'pet_care';

interface CommunityNavProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  userRole: 'visitor' | 'pet_parent' | null;
  onModeSwitch: (mode: ActiveMode) => void;
  activeMode: ActiveMode;
}

export const CommunityNav: React.FC<CommunityNavProps> = ({
  currentView,
  onChangeView,
  userRole,
  onModeSwitch,
  activeMode
}) => {
  const navItems = [
    { view: AppView.DROPS, icon: Play, label: 'Drops' },
    { view: AppView.COMMUNITY, icon: Users, label: 'Community' },
    { view: AppView.GROUPS, icon: Grid, label: 'Groups' },
    { view: AppView.PROFILE, icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-lg border-t border-zinc-800 pb-safe z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => onChangeView(item.view)}
              className={`flex flex-col items-center justify-center py-2 px-4 transition-all ${
                isActive ? 'text-white scale-105' : 'text-zinc-500'
              }`}
            >
              <div className={`p-1.5 rounded-xl ${isActive ? 'bg-familiar-500' : ''}`}>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}

        {/* Mode switch button for pet parents */}
        {userRole === 'pet_parent' && (
          <button
            onClick={() => onModeSwitch('pet_care')}
            className="flex flex-col items-center justify-center py-2 px-4 text-familiar-400 hover:text-familiar-300 transition-all"
          >
            <div className="p-1.5 rounded-xl border-2 border-familiar-500/50">
              <Heart size={22} strokeWidth={2} />
            </div>
            <span className="text-[10px] mt-1 font-medium">Pet Mode</span>
          </button>
        )}
      </div>
    </nav>
  );
};

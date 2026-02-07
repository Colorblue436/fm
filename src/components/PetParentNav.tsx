import React from 'react';
import { Home, Dog, Calendar, MessageCircle, MapPin, Users } from 'lucide-react';
import { AppView } from '@/types';

type ActiveMode = 'community' | 'pet_care';

interface PetParentNavProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  onModeSwitch: (mode: ActiveMode) => void;
}

export const PetParentNav: React.FC<PetParentNavProps> = ({
  currentView,
  onChangeView,
  onModeSwitch
}) => {
  const navItems = [
    { view: AppView.HOME, icon: Home, label: 'Home' },
    { view: AppView.PETS, icon: Dog, label: 'Pets' },
    { view: AppView.REMINDERS, icon: Calendar, label: 'Tasks' },
    { view: AppView.ASSISTANT, icon: MessageCircle, label: 'Chat' },
    { view: AppView.NEARBY, icon: MapPin, label: 'Nearby' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 pb-safe z-50 shadow-lg">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => onChangeView(item.view)}
              className={`flex flex-col items-center justify-center py-2 px-3 transition-all ${
                isActive ? 'text-familiar-600 scale-105' : 'text-gray-400'
              }`}
            >
              <div className={`p-1.5 rounded-xl ${isActive ? 'bg-familiar-100' : ''}`}>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}

        {/* Switch to community mode */}
        <button
          onClick={() => onModeSwitch('community')}
          className="flex flex-col items-center justify-center py-2 px-3 text-gray-400 hover:text-familiar-500 transition-all"
        >
          <div className="p-1.5 rounded-xl border-2 border-familiar-300">
            <Users size={22} strokeWidth={2} />
          </div>
          <span className="text-[10px] mt-1 font-medium">Community</span>
        </button>
      </div>
    </nav>
  );
};

import React from 'react';
import { Dog, Calendar, MapPin, MessageCircle, Users, Play, Grid, Shield, Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FamiliarLogo } from '@/components/ui/FamiliarLogo';
import { AppView } from '@/types';

interface HomeProps {
  onNavigate: (view: AppView) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const features = [
    {
      icon: Dog,
      title: 'Pet Profiles',
      description: 'Manage all your pets in one place with health records, vaccinations, and notes.',
      action: () => onNavigate(AppView.PETS),
      color: 'bg-blue-500',
    },
    {
      icon: Calendar,
      title: 'Tasks & Reminders',
      description: 'Never miss a vet appointment, medication, or grooming session again.',
      action: () => onNavigate(AppView.REMINDERS),
      color: 'bg-green-500',
    },
    {
      icon: MapPin,
      title: 'Nearby Services',
      description: 'Find pet stores, veterinary clinics, and groomers near you with directions.',
      action: () => onNavigate(AppView.NEARBY),
      color: 'bg-amber-500',
    },
    {
      icon: MessageCircle,
      title: 'AI Pet Assistant',
      description: 'Get instant answers to pet care questions from our intelligent chatbot.',
      action: () => onNavigate(AppView.ASSISTANT),
      color: 'bg-purple-500',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Connect with other pet lovers, share tips, and get advice.',
      action: () => onNavigate(AppView.COMMUNITY),
      color: 'bg-pink-500',
    },
    {
      icon: Play,
      title: 'Drops',
      description: 'Discover trending pet content, videos, and stories from creators.',
      action: () => onNavigate(AppView.DROPS),
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="space-y-8 pb-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-familiar-500 to-familiar-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <FamiliarLogo className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Welcome to Familiar</h1>
              <p className="text-familiar-100 text-sm">Your pet's best companion</p>
            </div>
          </div>
          
          <p className="text-familiar-50 mb-6 max-w-lg">
            Familiar is your all-in-one pet care companion. Manage your pets, track their health, 
            find nearby services, and connect with a community of pet lovers.
          </p>
          
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => onNavigate(AppView.PETS)}
              className="bg-white text-familiar-600 hover:bg-familiar-50"
            >
              <Dog size={18} className="mr-2" />
              Add Your Pet
            </Button>
            <Button 
              onClick={() => onNavigate(AppView.ASSISTANT)}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <MessageCircle size={18} className="mr-2" />
              Ask AI Assistant
            </Button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles size={20} className="text-familiar-500" />
          Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature) => (
            <button
              key={feature.title}
              onClick={feature.action}
              className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-familiar-200 hover:shadow-lg transition-all text-left group"
            >
              <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon size={24} />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-500">{feature.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Heart size={18} className="text-red-500" />
          Why Pet Owners Love Familiar
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-familiar-600">100%</div>
            <div className="text-xs text-gray-500">Free to Use</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-familiar-600">24/7</div>
            <div className="text-xs text-gray-500">AI Support</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-familiar-600">
              <Shield size={24} className="mx-auto" />
            </div>
            <div className="text-xs text-gray-500">Secure Data</div>
          </div>
        </div>
      </div>

      {/* Daily Theme Info */}
      <div className="text-center text-sm text-gray-400">
        <p>✨ Theme colors change daily to keep things fresh!</p>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { MapPin, Stethoscope, Store, ExternalLink, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlaceCard } from '@/components/PlaceCard';
import { Place } from '@/types';

// Mock data for demonstration - in production would use Google Places API
const mockPlaces: Place[] = [
  {
    id: '1',
    name: 'Happy Paws Veterinary Clinic',
    type: 'vet',
    address: '123 Main Street, Downtown',
    rating: 4.8,
    reviewCount: 256,
    isOpen: true,
    distance: '0.5 mi',
    imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400',
    phone: '(555) 123-4567',
  },
  {
    id: '2',
    name: 'PetSmart',
    type: 'store',
    address: '456 Commerce Ave, Mall District',
    rating: 4.5,
    reviewCount: 892,
    isOpen: true,
    distance: '1.2 mi',
    imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400',
  },
  {
    id: '3',
    name: 'City Animal Hospital',
    type: 'vet',
    address: '789 Oak Boulevard, Medical Center',
    rating: 4.9,
    reviewCount: 512,
    isOpen: false,
    distance: '1.8 mi',
    imageUrl: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=400',
  },
  {
    id: '4',
    name: 'Petco',
    type: 'store',
    address: '321 Shopping Lane',
    rating: 4.3,
    reviewCount: 445,
    isOpen: true,
    distance: '2.1 mi',
    imageUrl: 'https://images.unsplash.com/photo-1583511655826-05700442976d?w=400',
  },
  {
    id: '5',
    name: 'Emergency Vet 24/7',
    type: 'vet',
    address: '555 Hospital Road',
    rating: 4.7,
    reviewCount: 189,
    isOpen: true,
    distance: '3.0 mi',
    imageUrl: 'https://images.unsplash.com/photo-1612531386530-97286d97c2d2?w=400',
  },
];

export const NearbyPlaces: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'vet' | 'store'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlaces = mockPlaces.filter(place => {
    const matchesTab = activeTab === 'all' || place.type === activeTab;
    const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          place.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const openGoogleMaps = (type: 'vet' | 'store') => {
    const query = type === 'vet' ? 'veterinary clinics near me' : 'pet stores near me';
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(query)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MapPin className="text-familiar-500" size={28} />
          Nearby Services
        </h1>
        <p className="text-gray-500 mt-1">Find pet stores and veterinary clinics near you</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => openGoogleMaps('vet')}
          className="bg-gradient-to-br from-red-500 to-red-600 text-white p-4 rounded-2xl flex flex-col items-center gap-2 hover:shadow-lg transition-all group"
        >
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Stethoscope size={24} />
          </div>
          <span className="font-semibold">Find Vets</span>
          <span className="text-xs text-red-100 flex items-center gap-1">
            Open in Maps <ExternalLink size={12} />
          </span>
        </button>

        <button
          onClick={() => openGoogleMaps('store')}
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-2xl flex flex-col items-center gap-2 hover:shadow-lg transition-all group"
        >
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Store size={24} />
          </div>
          <span className="font-semibold">Find Stores</span>
          <span className="text-xs text-blue-100 flex items-center gap-1">
            Open in Maps <ExternalLink size={12} />
          </span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search places..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-familiar-500 focus:border-transparent"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
        {[
          { key: 'all', label: 'All' },
          { key: 'vet', label: 'Vets', icon: Stethoscope },
          { key: 'store', label: 'Stores', icon: Store },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-1 ${
              activeTab === tab.key
                ? 'bg-white text-familiar-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon && <tab.icon size={16} />}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Places List */}
      <div className="space-y-3">
        {filteredPlaces.length > 0 ? (
          filteredPlaces.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <MapPin className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-500">No places found</p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-familiar-50 border border-familiar-100 rounded-xl p-4 text-center">
        <p className="text-sm text-familiar-700">
          💡 Tap any place card to open directions in Google Maps
        </p>
      </div>
    </div>
  );
};

import React from 'react';
import { Place } from '../types';
import { Star, MapPin, Navigation } from 'lucide-react';

interface PlaceCardProps {
  place: Place;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({ place }) => {
  const handleLocate = () => {
    const query = encodeURIComponent(`${place.name} ${place.address}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div 
      onClick={handleLocate}
      className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex gap-4 cursor-pointer hover:bg-gray-50 hover:border-familiar-200 hover:shadow-md transition-all group"
    >
      <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden relative">
        <img src={place.imageUrl} alt={place.name} className="w-full h-full object-cover" />
        {!place.isOpen && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-xs font-bold uppercase border border-white px-2 py-0.5 rounded">Closed</span>
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-gray-900 leading-tight truncate pr-6">{place.name}</h3>
            <Navigation size={16} className="text-gray-300 group-hover:text-familiar-500 transition-colors absolute top-3 right-3" />
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-bold text-gray-800">{place.rating}</span>
            <span className="text-xs text-gray-400">({place.reviewCount})</span>
          </div>
          <p className="text-xs text-gray-500 mt-1 flex items-center truncate">
            <MapPin size={12} className="mr-1 flex-shrink-0" /> {place.address}
          </p>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${place.isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {place.isOpen ? 'Open Now' : 'Closed'}
          </span>
          <span className="text-xs text-gray-400 font-medium ml-auto flex items-center gap-1">
            {place.distance} <span className="text-familiar-500 group-hover:translate-x-1 transition-transform">→</span>
          </span>
        </div>
      </div>
    </div>
  );
};

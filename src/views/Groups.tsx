import React from 'react';
import { Grid, Users } from 'lucide-react';
import { Group } from '@/types';

const mockGroups: Group[] = [
  {
    id: '1',
    name: 'Golden Retriever Lovers',
    description: 'For all golden retriever enthusiasts!',
    memberCount: 12500,
    imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
    isJoined: true,
  },
  {
    id: '2',
    name: 'Cat Parents Club',
    description: 'Share your cat adventures',
    memberCount: 8900,
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
    isJoined: false,
  },
  {
    id: '3',
    name: 'Pet Training Tips',
    description: 'Learn and share training techniques',
    memberCount: 5600,
    imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400',
    isJoined: true,
  },
  {
    id: '4',
    name: 'Bird Watchers',
    description: 'For pet bird owners',
    memberCount: 2300,
    imageUrl: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=400',
    isJoined: false,
  },
];

export const Groups: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          <Grid className="text-familiar-500" size={28} />
          Groups
        </h1>
        <p className="text-zinc-400 mt-1">Join pet communities</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {mockGroups.map((group) => (
          <div key={group.id} className="bg-zinc-800 rounded-2xl overflow-hidden border border-zinc-700/50">
            <div className="aspect-video relative">
              <img src={group.imageUrl} alt={group.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <div className="p-3">
              <h3 className="font-bold text-zinc-100 text-sm truncate">{group.name}</h3>
              <p className="text-xs text-zinc-400 truncate">{group.description}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-zinc-500 flex items-center gap-1">
                  <Users size={12} /> {(group.memberCount / 1000).toFixed(1)}k
                </span>
                <button className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  group.isJoined 
                    ? 'bg-zinc-700 text-zinc-300' 
                    : 'bg-familiar-500 text-white hover:bg-familiar-600'
                }`}>
                  {group.isJoined ? 'Joined' : 'Join'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

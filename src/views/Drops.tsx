import React from 'react';
import { Play } from 'lucide-react';
import { DropCard } from '@/components/DropCard';
import { Drop } from '@/types';

const mockDrops: Drop[] = [
  {
    id: '1',
    author: {
      id: '1',
      name: 'PetPhotography',
      avatar: 'https://i.pravatar.cc/150?img=10',
      isVerified: true,
    },
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
    description: 'Golden hour with Max 🌅 Nothing beats that sunset glow on a golden retriever!',
    tags: ['goldenretriever', 'sunset', 'petphotography'],
    metrics: { likes: 1234, comments: 89, shares: 45 },
    accessLevel: 'free',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: '2',
    author: {
      id: '2',
      name: 'Dr. PetCare',
      avatar: 'https://i.pravatar.cc/150?img=12',
      isVerified: true,
    },
    type: 'video',
    thumbnailUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400',
    description: 'Quick tip: How to properly brush your dog\'s teeth 🦷',
    tags: ['pettips', 'dentalcare', 'veterinary'],
    metrics: { likes: 2567, comments: 156, shares: 234 },
    accessLevel: 'premium',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: '3',
    author: {
      id: '3',
      name: 'CatWhisperer',
      avatar: 'https://i.pravatar.cc/150?img=15',
      isVerified: false,
    },
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
    description: 'My cat judging my life choices again 😂',
    tags: ['cats', 'funny', 'catlover'],
    metrics: { likes: 4521, comments: 234, shares: 89 },
    accessLevel: 'free',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
];

export const Drops: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          <Play className="text-familiar-500" size={28} />
          Drops
        </h1>
        <p className="text-zinc-400 mt-1">Trending pet content</p>
      </div>

      <div className="space-y-6">
        {mockDrops.map((drop) => (
          <DropCard key={drop.id} drop={drop} />
        ))}
      </div>
    </div>
  );
};

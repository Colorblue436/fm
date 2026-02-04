import React from 'react';
import { Users } from 'lucide-react';
import { CommunityPostCard } from '@/components/CommunityPostCard';
import { Post } from '@/types';

const mockPosts: Post[] = [
  {
    id: '1',
    user_id: '1',
    userName: 'Sarah Johnson',
    userAvatar: 'https://i.pravatar.cc/150?img=1',
    userRole: 'member',
    content: 'Just adopted this little guy! Any tips for first-time golden retriever owners? 🐕',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600',
    topic: 'New Pet',
    likes: 42,
    commentCount: 12,
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: '2',
    user_id: '2',
    userName: 'Dr. Mike',
    userAvatar: 'https://i.pravatar.cc/150?img=3',
    userRole: 'moderator',
    content: 'PSA: With summer coming, remember to never leave your pets in parked cars! Even with windows cracked, temperatures can become dangerous within minutes. 🌡️',
    isPinned: true,
    topic: 'Health Tips',
    likes: 156,
    commentCount: 28,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: '3',
    user_id: '3',
    userName: 'CatLover99',
    userAvatar: 'https://i.pravatar.cc/150?img=5',
    content: 'My cat has learned to open doors. Any advice on how to handle this new superpower? 😅',
    likes: 89,
    commentCount: 34,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
];

export const Community: React.FC = () => {
  const handleVote = (id: string, dir: 'up' | 'down') => {
    console.log('Vote:', id, dir);
  };

  const handleReport = (id: string) => {
    console.log('Report:', id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          <Users className="text-familiar-500" size={28} />
          Community
        </h1>
        <p className="text-zinc-400 mt-1">Connect with pet lovers</p>
      </div>

      <div className="space-y-4">
        {mockPosts.map((post) => (
          <CommunityPostCard
            key={post.id}
            post={post}
            onVote={handleVote}
            onReport={handleReport}
          />
        ))}
      </div>
    </div>
  );
};

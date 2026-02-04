import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Volume2, VolumeX, Lock, CheckCircle2, Bookmark } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Drop } from '@/types';

interface DropCardProps {
  drop: Drop;
}

export const DropCard: React.FC<DropCardProps> = ({ drop }) => {
  const [muted, setMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(drop.metrics.likes);

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(prev => prev - 1);
      setIsLiked(false);
    } else {
      setLikeCount(prev => prev + 1);
      setIsLiked(true);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out this Drop by ${drop.author.name}`,
          text: drop.description,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Share failed', err);
      }
    } else {
      alert('Copied to clipboard!');
    }
  };

  const renderMedia = () => {
    if (drop.isLocked) {
      return (
        <div className="relative aspect-[4/5] bg-zinc-800 flex flex-col items-center justify-center p-6 text-center">
          <img src={drop.mediaUrl || drop.thumbnailUrl} className="absolute inset-0 w-full h-full object-cover opacity-20 blur-lg" />
          <div className="z-10 bg-zinc-900/80 p-6 rounded-3xl backdrop-blur-xl border border-zinc-700/50">
            <div className="w-12 h-12 bg-familiar-500 rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-familiar-500/20">
              <Lock size={24} />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Premium Content</h3>
            <p className="text-zinc-400 text-sm mb-4">Subscribe to {drop.author.name} to unlock this exclusive drop.</p>
            <button className="bg-white text-zinc-900 font-bold py-2 px-6 rounded-xl hover:bg-zinc-200 transition-colors w-full">
              Unlock for $0.99
            </button>
          </div>
        </div>
      );
    }

    if (drop.type === 'video') {
      return (
        <div className="relative aspect-[4/5] bg-black group cursor-pointer" onClick={() => setMuted(!muted)}>
          <img src={drop.thumbnailUrl} className="w-full h-full object-cover opacity-90" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              {muted ? <VolumeX size={32} className="text-white" /> : <Volume2 size={32} className="text-white" />}
            </div>
          </div>
          <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md px-2 py-1 rounded-md text-xs font-bold text-white">
            VIDEO
          </div>
        </div>
      );
    }

    if (drop.type === 'image') {
      return (
        <div className="aspect-[4/5] bg-zinc-800 relative">
          <img src={drop.mediaUrl} className="w-full h-full object-cover" loading="lazy" />
        </div>
      );
    }

    return (
      <div className="aspect-[4/5] bg-gradient-to-br from-familiar-900 to-zinc-900 p-8 flex flex-col justify-center text-center relative overflow-hidden">
        <h3 className="text-2xl font-bold text-white relative z-10">{drop.description}</h3>
      </div>
    );
  };

  return (
    <div className="bg-zinc-800 rounded-3xl overflow-hidden border border-zinc-700/50 shadow-lg mb-6 max-w-md mx-auto w-full">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={drop.author.avatar} className="w-10 h-10 rounded-full object-cover border border-zinc-700" alt={drop.author.name} />
            {drop.author.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-[2px] rounded-full border-2 border-zinc-800">
                <CheckCircle2 size={10} strokeWidth={3} />
              </div>
            )}
          </div>
          <div>
            <h3 className="text-zinc-100 font-bold text-sm flex items-center gap-1">
              {drop.author.name}
              {drop.accessLevel === 'premium' && <span className="text-[10px] bg-gradient-to-r from-amber-400 to-familiar-500 text-black px-1.5 rounded font-extrabold ml-1">PRO</span>}
            </h3>
            <p className="text-zinc-500 text-xs">{formatDistanceToNow(new Date(drop.createdAt))} ago</p>
          </div>
        </div>
        <button className="text-zinc-500 hover:text-white transition-colors">
          <Bookmark size={22} className={isSaved ? "fill-white text-white" : ""} onClick={() => setIsSaved(!isSaved)} />
        </button>
      </div>

      {renderMedia()}

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-4">
            <button onClick={handleLike} className="flex items-center gap-1.5 text-zinc-300 hover:text-red-500 transition-colors group">
              <Heart size={24} className={`transition-transform group-hover:scale-110 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              <span className="text-sm font-medium">{likeCount}</span>
            </button>
            <button className="flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors group">
              <MessageCircle size={24} className="group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">{drop.metrics.comments}</span>
            </button>
          </div>
          <button onClick={handleShare} className="text-zinc-300 hover:text-white transition-colors">
            <Share2 size={24} />
          </button>
        </div>

        {!drop.isLocked && (
          <div className="space-y-2">
            <p className="text-sm text-zinc-300">
              <span className="font-bold text-zinc-100 mr-2">{drop.author.name}</span>
              {drop.description}
            </p>
            {drop.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {drop.tags.map(tag => (
                  <span key={tag} className="text-xs text-familiar-500">#{tag}</span>
                ))}
              </div>
            )}
            <button className="text-xs text-zinc-500 font-medium hover:text-zinc-400">View all {drop.metrics.comments} comments</button>
          </div>
        )}
      </div>
    </div>
  );
};

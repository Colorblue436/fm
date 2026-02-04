import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Flag, ShieldAlert, Pin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Post } from '@/types';

interface PostCardProps {
  post: Post;
  onVote: (id: string, dir: 'up' | 'down') => void;
  onReport: (id: string) => void;
}

export const CommunityPostCard: React.FC<PostCardProps> = ({ post, onVote, onReport }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [optimisticLikes, setOptimisticLikes] = useState(post.likes);
  const [hasVoted, setHasVoted] = useState(false);

  const handleVote = () => {
    if (hasVoted) {
      setOptimisticLikes(prev => prev - 1);
      setHasVoted(false);
    } else {
      setOptimisticLikes(prev => prev + 1);
      setHasVoted(true);
    }
    onVote(post.id, 'up');
  };

  return (
    <div className={`bg-zinc-800 rounded-3xl overflow-hidden shadow-sm border ${post.isPinned ? 'border-familiar-500/30 bg-zinc-800/80' : 'border-zinc-700/50'}`}>
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={post.userAvatar} className="w-10 h-10 rounded-xl object-cover bg-zinc-700" alt={post.userName} />
            {post.userRole === 'moderator' && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-0.5 rounded-full border border-zinc-800" title="Moderator">
                <ShieldAlert size={10} />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-zinc-100 text-sm">{post.userName}</h3>
              {post.isPinned && <Pin size={12} className="text-familiar-500 fill-familiar-500" />}
            </div>
            <p className="text-xs text-zinc-400 flex items-center gap-1">
              {post.topic && <span className="bg-zinc-700 px-1.5 rounded text-[10px] text-zinc-300">{post.topic}</span>}
              <span>• {formatDistanceToNow(new Date(post.timestamp))} ago</span>
            </p>
          </div>
        </div>
        
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="text-zinc-500 hover:text-zinc-300 p-2">
            <MoreHorizontal size={20} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl z-10 overflow-hidden">
              <button 
                onClick={() => { onReport(post.id); setShowMenu(false); }}
                className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-zinc-800 flex items-center gap-2"
              >
                <Flag size={16} /> Report Content
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="px-4 pb-2">
        <p className="text-zinc-300 text-sm leading-relaxed mb-3">{post.content}</p>
      </div>

      {post.image && (
        <div className="px-4 pb-3">
          <div className="rounded-2xl overflow-hidden relative aspect-video bg-zinc-900 border border-zinc-700/30">
            <img src={post.image} className="w-full h-full object-cover" alt="Post content" />
          </div>
        </div>
      )}
      
      <div className="px-4 pb-4 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            <button 
              onClick={handleVote}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${hasVoted ? 'bg-red-500/10 text-red-500' : 'text-zinc-400 hover:bg-zinc-700'}`}
            >
              <Heart size={20} className={hasVoted ? 'fill-current' : ''} /> 
              <span className="text-sm font-medium">{optimisticLikes}</span>
            </button>
            
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-full text-zinc-400 hover:bg-zinc-700 transition-colors">
              <MessageCircle size={20} /> 
              <span className="text-sm font-medium">{post.commentCount}</span>
            </button>
          </div>
          <button className="text-zinc-400 hover:text-zinc-200 p-2 hover:bg-zinc-700 rounded-full"><Share2 size={20} /></button>
        </div>
      </div>
    </div>
  );
};

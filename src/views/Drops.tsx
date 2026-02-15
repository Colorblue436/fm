import React from 'react';
import { Play, Video } from 'lucide-react';

export const Drops: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Play className="text-familiar-500" size={28} />
          Drops
        </h1>
        <p className="text-muted-foreground mt-1">Trending pet content</p>
      </div>

      <div className="bg-card rounded-2xl p-12 text-center border border-border">
        <Video size={64} className="mx-auto text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Coming Soon</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Drops are coming! Soon you'll be able to discover and share trending pet content, videos, and stories from creators.
        </p>
      </div>
    </div>
  );
};

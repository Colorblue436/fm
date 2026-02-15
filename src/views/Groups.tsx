import React from 'react';
import { Grid, Users } from 'lucide-react';

export const Groups: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Grid className="text-familiar-500" size={28} />
          Groups
        </h1>
        <p className="text-muted-foreground mt-1">Join pet communities</p>
      </div>

      <div className="bg-card rounded-2xl p-12 text-center border border-border">
        <Users size={64} className="mx-auto text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Coming Soon</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Groups are being developed. Soon you'll be able to create and join pet communities based on breeds, interests, and locations!
        </p>
      </div>
    </div>
  );
};

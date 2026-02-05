import React from 'react';
import { Users, MessageCircle } from 'lucide-react';

export const Community: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="text-familiar-500" size={28} />
          Community
        </h1>
        <p className="text-muted-foreground mt-1">Connect with pet lovers</p>
      </div>

      <div className="bg-card rounded-2xl p-12 text-center border border-border">
        <MessageCircle size={64} className="mx-auto text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Coming Soon</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Community features are being developed. Soon you'll be able to connect with other pet owners, share tips, and join discussions!
        </p>
      </div>
    </div>
  );
};

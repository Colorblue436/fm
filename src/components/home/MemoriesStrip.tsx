import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Memory {
  id: string;
  media_url?: string;
  memory_type: string;
  created_at: string;
}

interface Props {
  petId?: string;
  onSeeAll: () => void;
}

export const MemoriesStrip: React.FC<Props> = ({ petId, onSeeAll }) => {
  const [items, setItems] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let q = supabase.from('pet_memories')
        .select('id, media_url, memory_type, created_at')
        .in('memory_type', ['image', 'video'])
        .order('created_at', { ascending: false })
        .limit(6);
      if (petId) q = q.eq('pet_id', petId);
      const { data } = await q;
      setItems((data as Memory[] | null) ?? []);
      setLoading(false);
    })();
  }, [petId]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="mt-2"
    >
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-xl font-bold text-foreground tracking-tight">Memories</h2>
        <button onClick={onSeeAll} className="text-sm font-semibold text-familiar-600 hover:text-familiar-700 flex items-center gap-0.5">
          See all <ChevronRight size={14} />
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/40 px-6 py-10 text-center">
          <ImageIcon size={28} className="mx-auto text-familiar-400 mb-2" />
          <p className="text-sm text-muted-foreground">Memories you capture will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {items.slice(0, 4).map((m, idx) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: 0.05 * idx }}
              className={`relative rounded-2xl overflow-hidden bg-muted shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer ${idx % 3 === 0 ? 'aspect-[4/5]' : 'aspect-square'}`}
            >
              {m.media_url && (m.memory_type === 'image'
                ? <img src={m.media_url} alt="memory" className="w-full h-full object-cover" loading="lazy" />
                : <video src={m.media_url} className="w-full h-full object-cover" muted playsInline />)}
            </motion.div>
          ))}
        </div>
      )}
    </motion.section>
  );
};

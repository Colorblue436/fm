import React from 'react';
import { Heart, FileText, Film, Image as ImageIcon, Stethoscope, Sparkles, Trash2 } from 'lucide-react';
import type { StorageItem } from '@/hooks/useStorage';

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  photo: <ImageIcon size={14} />,
  video: <Film size={14} />,
  document: <FileText size={14} />,
  health: <Stethoscope size={14} />,
  memory: <Sparkles size={14} />,
};

interface Props {
  item: StorageItem;
  onFavorite: (i: StorageItem) => void;
  onDelete: (i: StorageItem) => void;
  view?: 'grid' | 'list';
}

export const StorageItemCard: React.FC<Props> = ({ item, onFavorite, onDelete, view = 'grid' }) => {
  const isImage = item.category === 'photo' || item.file_type?.startsWith('image/');
  const isVideo = item.category === 'video' || item.file_type?.startsWith('video/');

  if (view === 'list') {
    return (
      <div className="group flex items-center gap-3 bg-card border border-border rounded-2xl p-3 hover:shadow-md transition-all">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
          {isImage ? <img src={item.file_url} alt={item.title} className="w-full h-full object-cover" /> : CATEGORY_ICON[item.category]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-foreground truncate">{item.title}</p>
          <p className="text-xs text-muted-foreground capitalize">{item.category} · {new Date(item.created_at).toLocaleDateString()}</p>
        </div>
        <button onClick={() => onFavorite(item)} className="p-2 rounded-full hover:bg-muted">
          <Heart size={16} className={item.is_favorite ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground'} />
        </button>
        <button onClick={() => onDelete(item)} className="p-2 rounded-full hover:bg-muted opacity-0 group-hover:opacity-100">
          <Trash2 size={16} className="text-muted-foreground" />
        </button>
      </div>
    );
  }

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-lg transition-all break-inside-avoid mb-3">
      <div className="relative bg-gradient-to-br from-muted/40 to-muted">
        {isImage ? (
          <img src={item.file_url} alt={item.title} className="w-full h-auto object-cover" loading="lazy" />
        ) : isVideo ? (
          <video src={item.file_url} className="w-full h-auto" />
        ) : (
          <div className="aspect-[4/5] flex flex-col items-center justify-center p-4 bg-gradient-to-br from-familiar-50 to-card">
            <div className="w-12 h-12 rounded-xl bg-familiar-100 flex items-center justify-center text-familiar-600 mb-2">
              {CATEGORY_ICON[item.category]}
            </div>
            <p className="text-xs font-medium text-foreground text-center line-clamp-2">{item.title}</p>
          </div>
        )}

        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-card/80 backdrop-blur-md text-[10px] font-medium text-foreground flex items-center gap-1 capitalize">
          {CATEGORY_ICON[item.category]} {item.category}
        </div>

        <button
          onClick={() => onFavorite(item)}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-card/80 backdrop-blur-md flex items-center justify-center hover:scale-110 transition-transform"
        >
          <Heart size={14} className={item.is_favorite ? 'fill-rose-500 text-rose-500' : 'text-foreground'} />
        </button>

        <button
          onClick={() => onDelete(item)}
          className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-card/80 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 size={14} className="text-foreground" />
        </button>
      </div>

      {(isImage || isVideo) && (
        <div className="p-2.5">
          <p className="text-xs font-medium text-foreground truncate">{item.title}</p>
          <p className="text-[10px] text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</p>
        </div>
      )}
    </div>
  );
};

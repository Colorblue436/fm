import React, { useMemo, useState, useEffect } from 'react';
import { FolderHeart, Image as ImageIcon, Film, FileText, Stethoscope, Sparkles, Grid3x3, List, Search, Cloud, Star } from 'lucide-react';
import { useStorage, type StorageCategory } from '@/hooks/useStorage';
import { UploadDropzone } from '@/components/storage/UploadDropzone';
import { StorageItemCard } from '@/components/storage/StorageItemCard';
import { Input } from '@/components/ui/input';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/integrations/supabase/client';

interface Pet { id: string; name: string; avatar_url?: string; type?: string }

const CATEGORIES: { key: StorageCategory | 'all'; label: string; icon: React.ReactNode; tint: string }[] = [
  { key: 'all', label: 'All', icon: <FolderHeart size={16} />, tint: 'from-familiar-400 to-familiar-600' },
  { key: 'photo', label: 'Photos', icon: <ImageIcon size={16} />, tint: 'from-rose-400 to-pink-500' },
  { key: 'video', label: 'Videos', icon: <Film size={16} />, tint: 'from-violet-400 to-purple-500' },
  { key: 'document', label: 'Documents', icon: <FileText size={16} />, tint: 'from-amber-400 to-orange-500' },
  { key: 'health', label: 'Health', icon: <Stethoscope size={16} />, tint: 'from-emerald-400 to-teal-500' },
  { key: 'memory', label: 'Memories', icon: <Sparkles size={16} />, tint: 'from-sky-400 to-blue-500' },
];

const fmt = (b: number) => {
  if (b < 1024) return `${b} B`;
  if (b < 1024 ** 2) return `${(b / 1024).toFixed(1)} KB`;
  if (b < 1024 ** 3) return `${(b / 1024 ** 2).toFixed(1)} MB`;
  return `${(b / 1024 ** 3).toFixed(2)} GB`;
};

const QUOTA_BYTES = 5 * 1024 ** 3; // 5 GB friendly quota

export const Storage: React.FC = () => {
  const [activePet, setActivePet] = useState<string | 'all'>('all');
  const [pets, setPets] = useState<Pet[]>([]);
  const petId = activePet === 'all' ? null : activePet;
  const { items, loading, uploadFile, uploadProgress, toggleFavorite, deleteItem, totalBytes } = useStorage(petId);
  const [category, setCategory] = useState<StorageCategory | 'all'>('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    supabase.from('pets').select('id,name,avatar_url,type').order('created_at').then(({ data }) => {
      if (data) setPets(data as Pet[]);
    });
  }, []);

  const filtered = useMemo(() => {
    return items.filter(i => {
      if (category !== 'all' && i.category !== category) return false;
      if (search && !i.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [items, category, search]);

  const recent = items.slice(0, 6);
  const favorites = items.filter(i => i.is_favorite).slice(0, 4);
  const usagePct = Math.min(100, (totalBytes / QUOTA_BYTES) * 100);

  const handleUpload = async (files: File[]) => {
    for (const f of files) {
      try {
        await uploadFile(f, { petId });
        addToast(`Saved ${f.name}`, 'success');
      } catch (e: any) {
        addToast(e.message || 'Upload failed', 'error');
      }
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Hero */}
      <header className="rounded-3xl bg-gradient-to-br from-familiar-500 via-familiar-500 to-purple-500 text-white p-6 shadow-xl shadow-familiar-500/20 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-white/80 text-xs uppercase tracking-wider mb-1">
              <Cloud size={14} /> Storage
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">A digital life archive for your pet</h1>
            <p className="text-white/80 text-sm mt-1 max-w-md">
              Photos, vet records, milestones — kept safe and beautifully organized.
            </p>
          </div>
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 min-w-[200px]">
            <p className="text-xs text-white/80">Used</p>
            <p className="font-semibold text-lg">{fmt(totalBytes)} <span className="text-white/60 text-sm font-normal">/ 5 GB</span></p>
            <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white transition-all" style={{ width: `${usagePct}%` }} />
            </div>
            <p className="text-[11px] text-white/70 mt-1">{items.length} item{items.length === 1 ? '' : 's'}</p>
          </div>
        </div>
      </header>

      {/* Pet selector */}
      {pets.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <button
            onClick={() => setActivePet('all')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              activePet === 'all' ? 'bg-foreground text-background border-foreground' : 'bg-card text-foreground border-border hover:border-foreground/30'
            }`}
          >
            All pets
          </button>
          {pets.map(p => (
            <button
              key={p.id}
              onClick={() => setActivePet(p.id)}
              className={`flex-shrink-0 flex items-center gap-2 pl-1 pr-3 py-1 rounded-full text-xs font-medium border transition-all ${
                activePet === p.id ? 'bg-foreground text-background border-foreground' : 'bg-card text-foreground border-border hover:border-foreground/30'
              }`}
            >
              {p.avatar_url ? (
                <img src={p.avatar_url} alt={p.name} className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-familiar-100 flex items-center justify-center text-familiar-600 text-[10px] font-bold">
                  {p.name[0]}
                </div>
              )}
              {p.name}
            </button>
          ))}
        </div>
      )}

      {/* Upload */}
      <UploadDropzone onFiles={handleUpload} uploading={uploadProgress} />

      {/* AI highlights + favorites */}
      {(items.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-rose-50 dark:from-purple-950/30 dark:to-rose-950/30 border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-400 to-rose-400 flex items-center justify-center text-white">
                <Sparkles size={14} />
              </div>
              <p className="font-semibold text-foreground text-sm">AI memory highlight</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {items.length < 3
                ? "Add a few more files and Familiar will start surfacing your pet's story automatically."
                : `${items.length} memories saved across ${new Set(items.map(i => i.category)).size} categories. Your pet's timeline is growing beautifully.`}
            </p>
          </div>

          <div className="rounded-2xl bg-card border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <Star size={14} className="text-amber-500 fill-amber-500" />
              <p className="font-semibold text-foreground text-sm">Favorites</p>
            </div>
            {favorites.length === 0 ? (
              <p className="text-xs text-muted-foreground">Tap the heart on any item to keep it close.</p>
            ) : (
              <div className="flex gap-2">
                {favorites.map(f => (
                  <div key={f.id} className="w-14 h-14 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                    {f.file_type?.startsWith('image/') ? (
                      <img src={f.file_url} alt={f.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <FileText size={18} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent strip */}
      {recent.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2 px-1">Recent uploads</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {recent.map(r => (
              <div key={r.id} className="w-28 flex-shrink-0">
                <div className="w-28 h-28 rounded-2xl overflow-hidden bg-muted shadow-sm">
                  {r.file_type?.startsWith('image/') ? (
                    <img src={r.file_url} alt={r.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gradient-to-br from-familiar-50 to-card">
                      <FileText size={22} />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 truncate">{r.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {CATEGORIES.map(c => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                category === c.key
                  ? `text-white border-transparent bg-gradient-to-br ${c.tint} shadow-md`
                  : 'bg-card text-foreground border-border hover:border-foreground/30'
              }`}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search memories, vet reports…" className="pl-9 rounded-full bg-card" />
          </div>
          <div className="flex bg-card border border-border rounded-full p-0.5">
            <button onClick={() => setView('grid')} className={`p-1.5 rounded-full ${view === 'grid' ? 'bg-foreground text-background' : 'text-muted-foreground'}`}>
              <Grid3x3 size={14} />
            </button>
            <button onClick={() => setView('list')} className={`p-1.5 rounded-full ${view === 'list' ? 'bg-foreground text-background' : 'text-muted-foreground'}`}>
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid / list */}
      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Loading your archive…</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center rounded-3xl border border-dashed border-border bg-card/50">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-familiar-100 to-familiar-200 flex items-center justify-center text-familiar-600 mb-3">
            <FolderHeart size={26} />
          </div>
          <p className="font-semibold text-foreground">Nothing here yet</p>
          <p className="text-sm text-muted-foreground mt-1">Upload your first memory above — every one is saved safely.</p>
        </div>
      ) : view === 'grid' ? (
        <div className="columns-2 sm:columns-3 md:columns-4 gap-3">
          {filtered.map(item => (
            <StorageItemCard key={item.id} item={item} onFavorite={toggleFavorite} onDelete={deleteItem} view="grid" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => (
            <StorageItemCard key={item.id} item={item} onFavorite={toggleFavorite} onDelete={deleteItem} view="list" />
          ))}
        </div>
      )}
    </div>
  );
};

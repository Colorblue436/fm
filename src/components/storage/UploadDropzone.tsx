import React, { useRef, useState } from 'react';
import { UploadCloud, Camera, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onFiles: (files: File[]) => void;
  uploading?: { name: string; progress: number } | null;
}

export const UploadDropzone: React.FC<Props> = ({ onFiles, uploading }) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) onFiles(files);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`relative rounded-3xl border-2 border-dashed transition-all p-8 text-center backdrop-blur-sm ${
        dragging
          ? 'border-familiar-500 bg-familiar-50/60 scale-[1.01]'
          : 'border-border bg-gradient-to-br from-card to-muted/40'
      }`}
    >
      <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-familiar-400 to-familiar-600 flex items-center justify-center shadow-lg shadow-familiar-500/30 mb-3">
        <UploadCloud className="text-white" size={26} />
      </div>
      <h3 className="font-semibold text-foreground text-lg">Drop files to preserve a memory</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-4">
        Photos, videos, vet reports — we'll auto-organize them.
      </p>

      <div className="flex flex-wrap justify-center gap-2">
        <Button size="sm" onClick={() => inputRef.current?.click()} className="bg-familiar-500 hover:bg-familiar-600">
          <UploadCloud size={16} /> Upload
        </Button>
        <Button size="sm" variant="outline" onClick={() => cameraRef.current?.click()}>
          <Camera size={16} /> Camera
        </Button>
        <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()}>
          <FileText size={16} /> Scan doc
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && onFiles(Array.from(e.target.files))}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files && onFiles(Array.from(e.target.files))}
      />

      {uploading && (
        <div className="mt-4 mx-auto max-w-sm bg-card border border-border rounded-2xl p-3 shadow-sm text-left">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Sparkles size={14} className="text-familiar-500" />
            Uploading {uploading.name}
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-familiar-400 to-familiar-600 transition-all"
              style={{ width: `${uploading.progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

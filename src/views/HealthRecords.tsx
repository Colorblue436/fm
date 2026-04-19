import React, { useEffect, useRef, useState } from 'react';
import { Upload, FileText, Image as ImageIcon, Sparkles, Trash2, Loader2, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/context/ToastContext';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';

interface Pet {
  id: string;
  name: string;
}

interface HealthRecord {
  id: string;
  pet_id: string | null;
  title: string;
  file_url: string;
  file_path: string;
  file_type: string;
  file_size: number | null;
  ai_summary: string | null;
  summary_generated_at: string | null;
  created_at: string;
}

const ACCEPT = 'application/pdf,image/png,image/jpeg,image/webp';
const MAX_BYTES = 10 * 1024 * 1024; // 10MB

export const HealthRecords: React.FC = () => {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [viewingSummary, setViewingSummary] = useState<HealthRecord | null>(null);
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [title, setTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const [recRes, petsRes] = await Promise.all([
      supabase.from('health_records' as any).select('*').order('created_at', { ascending: false }),
      supabase.from('pets').select('id, name').order('created_at', { ascending: false }),
    ]);

    if (!recRes.error && recRes.data) setRecords(recRes.data as unknown as HealthRecord[]);
    if (!petsRes.error && petsRes.data) setPets(petsRes.data as Pet[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handlePickFile = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (file.size > MAX_BYTES) {
      addToast('File is too large (max 10MB)', 'error');
      return;
    }
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      addToast('Only PDF or image files are supported', 'error');
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');

      const ext = file.name.split('.').pop() || 'bin';
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from('health-records')
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;

      const { data: signed } = await supabase.storage
        .from('health-records')
        .createSignedUrl(path, 60 * 60 * 24 * 365);

      const { error: insErr } = await supabase.from('health_records' as any).insert({
        user_id: user.id,
        pet_id: selectedPetId || null,
        title: title.trim() || file.name,
        file_url: signed?.signedUrl || '',
        file_path: path,
        file_type: file.type,
        file_size: file.size,
      });
      if (insErr) throw insErr;

      addToast('Record uploaded', 'success');
      setTitle('');
      setSelectedPetId('');
      await fetchData();
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSummarize = async (record: HealthRecord) => {
    setSummarizingId(record.id);
    try {
      // Refresh signed URL in case it expired
      const { data: signed } = await supabase.storage
        .from('health-records')
        .createSignedUrl(record.file_path, 60 * 10);
      const fileUrl = signed?.signedUrl || record.file_url;

      const pet = pets.find(p => p.id === record.pet_id);
      const { data, error } = await supabase.functions.invoke('summarize-record', {
        body: {
          fileUrl,
          fileType: record.file_type,
          title: record.title,
          petName: pet?.name,
        },
      });

      if (error) throw error;
      const summary = (data as any)?.summary;
      if (!summary) throw new Error('No summary returned');

      const { error: updErr } = await supabase
        .from('health_records' as any)
        .update({ ai_summary: summary, summary_generated_at: new Date().toISOString() })
        .eq('id', record.id);
      if (updErr) throw updErr;

      addToast('Summary ready', 'success');
      await fetchData();
      setViewingSummary({ ...record, ai_summary: summary });
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to summarize', 'error');
    } finally {
      setSummarizingId(null);
    }
  };

  const handleDelete = async (record: HealthRecord) => {
    if (!confirm(`Delete "${record.title}"?`)) return;
    try {
      await supabase.storage.from('health-records').remove([record.file_path]);
      const { error } = await supabase.from('health_records' as any).delete().eq('id', record.id);
      if (error) throw error;
      addToast('Record deleted', 'success');
      setRecords(prev => prev.filter(r => r.id !== record.id));
    } catch (err: any) {
      addToast(err.message || 'Delete failed', 'error');
    }
  };

  const openFile = async (record: HealthRecord) => {
    const { data: signed } = await supabase.storage
      .from('health-records')
      .createSignedUrl(record.file_path, 60 * 5);
    if (signed?.signedUrl) window.open(signed.signedUrl, '_blank');
  };

  const formatBytes = (b: number | null) => {
    if (!b) return '';
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / 1024 / 1024).toFixed(1)} MB`;
  };

  const petName = (id: string | null) => pets.find(p => p.id === id)?.name || 'No pet';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Health Records</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload vet documents, lab results, or photos. Summarize them with AI.
        </p>
      </div>

      {/* Upload card */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 md:items-end">
          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground">Title (optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Annual checkup blood test"
              className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-familiar-500"
            />
          </div>
          <div className="md:w-52">
            <label className="text-xs font-medium text-muted-foreground">Pet (optional)</label>
            <select
              value={selectedPetId}
              onChange={(e) => setSelectedPetId(e.target.value)}
              className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-familiar-500"
            >
              <option value="">Unassigned</option>
              {pets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <Button
            onClick={handlePickFile}
            disabled={uploading}
            className="bg-familiar-500 hover:bg-familiar-600 text-white rounded-xl"
          >
            {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
            {uploading ? 'Uploading...' : 'Upload file'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          PDF, PNG, JPG or WEBP · max 10MB
        </p>
      </div>

      {/* Records list */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : records.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-2xl p-10 text-center">
          <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            No records yet. Upload your first health document above.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {records.map(record => {
            const isImage = record.file_type.startsWith('image/');
            return (
              <div key={record.id} className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isImage ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
                    {isImage ? <ImageIcon size={22} /> : <FileText size={22} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{record.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {petName(record.pet_id)} · {format(new Date(record.created_at), 'MMM d, yyyy')}
                      {record.file_size ? ` · ${formatBytes(record.file_size)}` : ''}
                    </p>
                    {record.ai_summary && (
                      <button
                        onClick={() => setViewingSummary(record)}
                        className="mt-2 inline-flex items-center gap-1 text-xs text-familiar-600 hover:text-familiar-700 font-medium"
                      >
                        <Sparkles size={12} /> View AI summary
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <Button
                    onClick={() => handleSummarize(record)}
                    disabled={summarizingId === record.id}
                    size="sm"
                    className="bg-familiar-500 hover:bg-familiar-600 text-white rounded-lg flex-1"
                  >
                    {summarizingId === record.id ? (
                      <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Summarizing...</>
                    ) : (
                      <><Sparkles className="w-3.5 h-3.5 mr-1.5" /> {record.ai_summary ? 'Re-summarize' : 'Summarize with AI'}</>
                    )}
                  </Button>
                  <Button
                    onClick={() => openFile(record)}
                    size="sm"
                    variant="outline"
                    className="rounded-lg"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(record)}
                    size="sm"
                    variant="ghost"
                    className="rounded-lg text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary modal */}
      {viewingSummary && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewingSummary(null)}>
          <div className="bg-card rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2">
                <Sparkles className="text-familiar-500" size={20} />
                <div>
                  <h3 className="font-bold text-foreground">{viewingSummary.title}</h3>
                  <p className="text-xs text-muted-foreground">AI-generated summary</p>
                </div>
              </div>
              <button onClick={() => setViewingSummary(null)} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto prose prose-sm max-w-none">
              <ReactMarkdown>{viewingSummary.ai_summary || ''}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

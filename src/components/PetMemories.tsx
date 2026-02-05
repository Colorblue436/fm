 import React, { useState, useEffect, useRef } from 'react';
 import { Camera, Mic, Video, FileText, Plus, Trash2, X, Play, Pause } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Textarea } from '@/components/ui/textarea';
 import { supabase } from '@/integrations/supabase/client';
 import { useToast } from '@/context/ToastContext';
 import { format } from 'date-fns';
 
 interface Memory {
   id: string;
   memory_type: 'text' | 'image' | 'video' | 'audio';
   content?: string;
   media_url?: string;
   caption?: string;
   created_at: string;
 }
 
 interface PetMemoriesProps {
   petId: string;
   petName: string;
   onClose: () => void;
 }
 
 export const PetMemories: React.FC<PetMemoriesProps> = ({ petId, petName, onClose }) => {
   const [memories, setMemories] = useState<Memory[]>([]);
   const [loading, setLoading] = useState(true);
   const [uploading, setUploading] = useState(false);
   const [showAddText, setShowAddText] = useState(false);
   const [textContent, setTextContent] = useState('');
   const [playingAudio, setPlayingAudio] = useState<string | null>(null);
   const audioRef = useRef<HTMLAudioElement | null>(null);
   const { addToast } = useToast();
 
   const fetchMemories = async () => {
     setLoading(true);
     const { data, error } = await supabase
       .from('pet_memories')
       .select('*')
       .eq('pet_id', petId)
       .order('created_at', { ascending: false });
 
     if (error) {
       console.error('Error fetching memories:', error);
     } else {
       setMemories((data || []) as Memory[]);
     }
     setLoading(false);
   };
 
   useEffect(() => {
     fetchMemories();
   }, [petId]);
 
   const handleFileUpload = async (file: File, type: 'image' | 'video' | 'audio') => {
     setUploading(true);
     
     try {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) throw new Error('Not authenticated');
 
       const fileExt = file.name.split('.').pop();
       const fileName = `${user.id}/${petId}/${Date.now()}.${fileExt}`;
 
       const { error: uploadError } = await supabase.storage
         .from('pet-media')
         .upload(fileName, file);
 
       if (uploadError) throw uploadError;
 
       const { data: { publicUrl } } = supabase.storage
         .from('pet-media')
         .getPublicUrl(fileName);
 
       const { error: insertError } = await supabase
         .from('pet_memories')
         .insert({
           pet_id: petId,
           user_id: user.id,
           memory_type: type,
           media_url: publicUrl,
         });
 
       if (insertError) throw insertError;
 
       addToast('Memory added! 📸', 'success');
       fetchMemories();
     } catch (err) {
       console.error('Upload error:', err);
       addToast('Failed to upload', 'error');
     } finally {
       setUploading(false);
     }
   };
 
   const handleAddText = async () => {
     if (!textContent.trim()) return;
     
     try {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) throw new Error('Not authenticated');
 
       const { error } = await supabase
         .from('pet_memories')
         .insert({
           pet_id: petId,
           user_id: user.id,
           memory_type: 'text',
           content: textContent.trim(),
         });
 
       if (error) throw error;
 
       addToast('Note added! 📝', 'success');
       setTextContent('');
       setShowAddText(false);
       fetchMemories();
     } catch (err) {
       console.error('Error adding note:', err);
       addToast('Failed to add note', 'error');
     }
   };
 
   const handleDelete = async (id: string, mediaUrl?: string) => {
     if (!confirm('Delete this memory?')) return;
 
     try {
       if (mediaUrl) {
         const path = mediaUrl.split('/pet-media/')[1];
         if (path) {
           await supabase.storage.from('pet-media').remove([path]);
         }
       }
 
       const { error } = await supabase.from('pet_memories').delete().eq('id', id);
       if (error) throw error;
 
       addToast('Memory deleted', 'info');
       fetchMemories();
     } catch (err) {
       console.error('Error deleting:', err);
       addToast('Failed to delete', 'error');
     }
   };
 
   const toggleAudio = (id: string, url: string) => {
     if (playingAudio === id) {
       audioRef.current?.pause();
       setPlayingAudio(null);
     } else {
       if (audioRef.current) {
         audioRef.current.src = url;
         audioRef.current.play();
       }
       setPlayingAudio(id);
     }
   };
 
   return (
     <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
       <div className="bg-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
         <div className="p-4 border-b border-border flex items-center justify-between">
           <h2 className="text-xl font-bold text-foreground">{petName}'s Memories</h2>
           <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
             <X size={20} className="text-muted-foreground" />
           </button>
         </div>
 
         {/* Add Memory Actions */}
         <div className="p-4 border-b border-border bg-muted/50">
           <p className="text-sm text-muted-foreground mb-3">Add a new memory</p>
           <div className="flex flex-wrap gap-2">
             <label className="cursor-pointer">
               <input
                 type="file"
                 accept="image/*"
                 className="hidden"
                 onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'image')}
                 disabled={uploading}
               />
               <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:border-familiar-300 transition-colors">
                 <Camera size={18} className="text-familiar-500" />
                 <span className="text-sm">Photo</span>
               </div>
             </label>
 
             <label className="cursor-pointer">
               <input
                 type="file"
                 accept="video/*"
                 className="hidden"
                 onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'video')}
                 disabled={uploading}
               />
               <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:border-familiar-300 transition-colors">
                 <Video size={18} className="text-blue-500" />
                 <span className="text-sm">Video</span>
               </div>
             </label>
 
             <label className="cursor-pointer">
               <input
                 type="file"
                 accept="audio/*"
                 className="hidden"
                 onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'audio')}
                 disabled={uploading}
               />
               <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:border-familiar-300 transition-colors">
                 <Mic size={18} className="text-purple-500" />
                 <span className="text-sm">Audio</span>
               </div>
             </label>
 
             <button
               onClick={() => setShowAddText(true)}
               className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:border-familiar-300 transition-colors"
             >
               <FileText size={18} className="text-amber-500" />
               <span className="text-sm">Note</span>
             </button>
           </div>
 
           {showAddText && (
             <div className="mt-4 space-y-2">
               <Textarea
                 placeholder="Write a memory note..."
                 value={textContent}
                 onChange={(e) => setTextContent(e.target.value)}
                 rows={3}
               />
               <div className="flex gap-2">
                 <Button onClick={handleAddText} size="sm" className="bg-familiar-500 hover:bg-familiar-600">Save</Button>
                 <Button onClick={() => setShowAddText(false)} size="sm" variant="outline">Cancel</Button>
               </div>
             </div>
           )}
 
           {uploading && (
             <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
               <div className="animate-spin w-4 h-4 border-2 border-familiar-500 border-t-transparent rounded-full" />
               Uploading...
             </div>
           )}
         </div>
 
         {/* Memories List */}
         <div className="flex-1 overflow-y-auto p-4">
           <audio ref={audioRef} onEnded={() => setPlayingAudio(null)} className="hidden" />
           
           {loading ? (
             <div className="flex justify-center py-12">
               <div className="animate-spin w-8 h-8 border-4 border-familiar-500 border-t-transparent rounded-full" />
             </div>
           ) : memories.length === 0 ? (
             <div className="text-center py-12">
               <Camera size={48} className="mx-auto text-muted-foreground/30 mb-3" />
               <p className="text-muted-foreground">No memories yet</p>
               <p className="text-sm text-muted-foreground/70">Add photos, videos, audio, or notes</p>
             </div>
           ) : (
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
               {memories.map((memory) => (
                 <div key={memory.id} className="relative group">
                   {memory.memory_type === 'image' && (
                     <div className="aspect-square rounded-xl overflow-hidden bg-muted">
                       <img
                         src={memory.media_url}
                         alt="Memory"
                         className="w-full h-full object-cover"
                       />
                     </div>
                   )}
 
                   {memory.memory_type === 'video' && (
                     <div className="aspect-square rounded-xl overflow-hidden bg-muted">
                       <video
                         src={memory.media_url}
                         className="w-full h-full object-cover"
                         controls
                       />
                     </div>
                   )}
 
                   {memory.memory_type === 'audio' && (
                     <div className="aspect-square rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex flex-col items-center justify-center p-4">
                       <button
                         onClick={() => memory.media_url && toggleAudio(memory.id, memory.media_url)}
                         className="w-16 h-16 rounded-full bg-purple-500 text-white flex items-center justify-center hover:bg-purple-600 transition-colors"
                       >
                         {playingAudio === memory.id ? <Pause size={28} /> : <Play size={28} />}
                       </button>
                       <span className="text-xs text-purple-600 mt-2">Audio</span>
                     </div>
                   )}
 
                   {memory.memory_type === 'text' && (
                     <div className="aspect-square rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 p-4 flex flex-col">
                       <p className="text-sm text-amber-900 line-clamp-6 flex-1">{memory.content}</p>
                       <span className="text-xs text-amber-600 mt-2">
                         {format(new Date(memory.created_at), 'MMM d')}
                       </span>
                     </div>
                   )}
 
                   <button
                     onClick={() => handleDelete(memory.id, memory.media_url)}
                     className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                   >
                     <Trash2 size={14} />
                   </button>
 
                   {(memory.memory_type === 'image' || memory.memory_type === 'video') && (
                     <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-0.5 rounded">
                       {format(new Date(memory.created_at), 'MMM d')}
                     </div>
                   )}
                 </div>
               ))}
             </div>
           )}
         </div>
       </div>
     </div>
   );
 };
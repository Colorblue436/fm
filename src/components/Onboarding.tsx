import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { FamiliarLogo } from '@/components/ui/FamiliarLogo';
import { useToast } from '@/context/ToastContext';
import { Users, Heart, Sparkles, ArrowRight, Check } from 'lucide-react';

interface OnboardingProps {
  userId: string;
  onComplete: (mode: 'visitor' | 'pet_owner') => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ userId, onComplete }) => {
  const [selectedMode, setSelectedMode] = useState<'visitor' | 'pet_owner' | null>(null);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleContinue = async () => {
    if (!selectedMode) return;
    
    setLoading(true);
    try {
      // Update or insert profile with user mode
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: userId,
          user_mode: selectedMode,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) throw error;
      
      addToast(
        selectedMode === 'pet_owner' 
          ? 'Welcome to Pet Care Mode! 🐾' 
          : 'Welcome to the Community! 🎉',
        'success'
      );
      onComplete(selectedMode);
    } catch (error: any) {
      console.error('Onboarding error:', error);
      addToast('Failed to save preference. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-familiar-50 to-familiar-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-familiar-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-familiar-500/30">
            <FamiliarLogo className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Welcome to Familiar!</h1>
          <p className="text-muted-foreground mt-2">How would you like to use the app?</p>
        </div>

        <div className="space-y-4">
          {/* Visitor Mode */}
          <button
            onClick={() => setSelectedMode('visitor')}
            className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
              selectedMode === 'visitor'
                ? 'border-familiar-500 bg-familiar-50 shadow-lg shadow-familiar-500/20'
                : 'border-border bg-card hover:border-familiar-300'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                selectedMode === 'visitor' ? 'bg-familiar-500 text-white' : 'bg-muted text-muted-foreground'
              }`}>
                <Users size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">Community Explorer</h3>
                  {selectedMode === 'visitor' && <Check size={18} className="text-familiar-500" />}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Browse community posts, watch drops, join groups, and connect with pet lovers
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-xs px-2 py-1 bg-muted rounded-full">Community Feed</span>
                  <span className="text-xs px-2 py-1 bg-muted rounded-full">Watch Drops</span>
                  <span className="text-xs px-2 py-1 bg-muted rounded-full">Join Groups</span>
                </div>
              </div>
            </div>
          </button>

          {/* Pet Owner Mode */}
          <button
            onClick={() => setSelectedMode('pet_owner')}
            className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
              selectedMode === 'pet_owner'
                ? 'border-familiar-500 bg-familiar-50 shadow-lg shadow-familiar-500/20'
                : 'border-border bg-card hover:border-familiar-300'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                selectedMode === 'pet_owner' ? 'bg-familiar-500 text-white' : 'bg-muted text-muted-foreground'
              }`}>
                <Heart size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">Pet Parent</h3>
                  <span className="text-xs px-2 py-0.5 bg-familiar-500 text-white rounded-full flex items-center gap-1">
                    <Sparkles size={10} /> Full Access
                  </span>
                  {selectedMode === 'pet_owner' && <Check size={18} className="text-familiar-500" />}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your pets, set reminders, store memories, use AI assistant, plus all community features
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-xs px-2 py-1 bg-familiar-100 text-familiar-700 rounded-full">Pet Profiles</span>
                  <span className="text-xs px-2 py-1 bg-familiar-100 text-familiar-700 rounded-full">Reminders</span>
                  <span className="text-xs px-2 py-1 bg-familiar-100 text-familiar-700 rounded-full">AI Assistant</span>
                  <span className="text-xs px-2 py-1 bg-familiar-100 text-familiar-700 rounded-full">Memories</span>
                  <span className="text-xs px-2 py-1 bg-muted rounded-full">+ Community</span>
                </div>
              </div>
            </div>
          </button>
        </div>

        <Button
          onClick={handleContinue}
          disabled={!selectedMode || loading}
          className="w-full h-12 rounded-xl bg-familiar-500 hover:bg-familiar-600 mt-6"
        >
          {loading ? 'Setting up...' : (
            <>
              Continue
              <ArrowRight className="ml-2" size={18} />
            </>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground mt-4">
          You can change this anytime in your profile settings
        </p>
      </div>
    </div>
  );
};

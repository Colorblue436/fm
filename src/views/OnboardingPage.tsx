import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FamiliarLogo } from '@/components/ui/FamiliarLogo';
import { useToast } from '@/context/ToastContext';
import { Users, Heart, Sparkles, ArrowRight, Check, Dog, Cat, Bird, Fish, Rabbit } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface OnboardingPageProps {
  userId: string;
  onComplete: (role: 'visitor' | 'pet_parent') => void;
}

type Step = 'role' | 'pet_details';

const petTypes = [
  { value: 'dog', label: 'Dog', icon: Dog },
  { value: 'cat', label: 'Cat', icon: Cat },
  { value: 'bird', label: 'Bird', icon: Bird },
  { value: 'fish', label: 'Fish', icon: Fish },
  { value: 'rabbit', label: 'Rabbit', icon: Rabbit },
  { value: 'other', label: 'Other', icon: Heart },
];

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ userId, onComplete }) => {
  const [step, setStep] = useState<Step>('role');
  const [selectedRole, setSelectedRole] = useState<'visitor' | 'pet_parent' | null>(null);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  // Pet details form
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('dog');
  const [petBreed, setPetBreed] = useState('');
  const [petAge, setPetAge] = useState('1');

  const handleRoleSelect = async () => {
    if (!selectedRole) return;

    setLoading(true);
    try {
      // Insert role into user_roles table
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: selectedRole
        });

      if (roleError) throw roleError;

      if (selectedRole === 'visitor') {
        // Visitors go directly to the feed
        addToast('Welcome to the community! 🎉', 'success');
        onComplete('visitor');
      } else {
        // Pet parents need to add pet details
        setStep('pet_details');
      }
    } catch (error: any) {
      console.error('Role selection error:', error);
      addToast('Failed to save your preference', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePetSubmit = async () => {
    if (!petName.trim()) {
      addToast('Please enter your pet\'s name', 'error');
      return;
    }

    setLoading(true);
    try {
      // Create pet profile
      const { error: petError } = await supabase
        .from('pets')
        .insert({
          user_id: userId,
          name: petName.trim(),
          type: petType.charAt(0).toUpperCase() + petType.slice(1),
          breed: petBreed.trim() || null,
          age: parseInt(petAge) || 1,
          status: 'active'
        });

      if (petError) throw petError;

      addToast(`Welcome! ${petName} is all set up! 🐾`, 'success');
      onComplete('pet_parent');
    } catch (error: any) {
      console.error('Pet creation error:', error);
      addToast('Failed to save pet details', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'pet_details') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-familiar-50 to-familiar-100 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-familiar-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-familiar-500/30">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Tell us about your pet!</h1>
            <p className="text-muted-foreground mt-2">Add your first furry friend</p>
          </div>

          <div className="bg-card rounded-3xl p-6 border border-border shadow-xl space-y-5">
            {/* Pet Type Selection */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Pet Type</label>
              <div className="grid grid-cols-3 gap-2">
                {petTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      onClick={() => setPetType(type.value)}
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                        petType === type.value
                          ? 'border-familiar-500 bg-familiar-50 text-familiar-600'
                          : 'border-border bg-card hover:border-familiar-300'
                      }`}
                    >
                      <Icon size={24} />
                      <span className="text-xs font-medium">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pet Name */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Pet Name</label>
              <Input
                value={petName}
                onChange={e => setPetName(e.target.value)}
                placeholder="What's your pet's name?"
                className="h-12 rounded-xl"
              />
            </div>

            {/* Breed */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Breed (optional)</label>
              <Input
                value={petBreed}
                onChange={e => setPetBreed(e.target.value)}
                placeholder="e.g., Golden Retriever"
                className="h-12 rounded-xl"
              />
            </div>

            {/* Age */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Age (years)</label>
              <Select value={petAge} onValueChange={setPetAge}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 20 }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>
                      {i + 1} {i === 0 ? 'year' : 'years'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handlePetSubmit}
              disabled={!petName.trim() || loading}
              className="w-full h-12 rounded-xl bg-familiar-500 hover:bg-familiar-600 mt-2"
            >
              {loading ? 'Setting up...' : (
                <>
                  Continue
                  <ArrowRight className="ml-2" size={18} />
                </>
              )}
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            You can add more pets anytime from your profile
          </p>
        </div>
      </div>
    );
  }

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
            onClick={() => setSelectedRole('visitor')}
            className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
              selectedRole === 'visitor'
                ? 'border-familiar-500 bg-familiar-50 shadow-lg shadow-familiar-500/20'
                : 'border-border bg-card hover:border-familiar-300'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                selectedRole === 'visitor' ? 'bg-familiar-500 text-white' : 'bg-muted text-muted-foreground'
              }`}>
                <Users size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">Community Visitor</h3>
                  {selectedRole === 'visitor' && <Check size={18} className="text-familiar-500" />}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Watch drops, like content, and connect with pet lovers
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-xs px-2 py-1 bg-muted rounded-full">Watch Drops</span>
                  <span className="text-xs px-2 py-1 bg-muted rounded-full">Like & Comment</span>
                  <span className="text-xs px-2 py-1 bg-muted rounded-full">Join Groups</span>
                </div>
              </div>
            </div>
          </button>

          {/* Pet Parent Mode */}
          <button
            onClick={() => setSelectedRole('pet_parent')}
            className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
              selectedRole === 'pet_parent'
                ? 'border-familiar-500 bg-familiar-50 shadow-lg shadow-familiar-500/20'
                : 'border-border bg-card hover:border-familiar-300'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                selectedRole === 'pet_parent' ? 'bg-familiar-500 text-white' : 'bg-muted text-muted-foreground'
              }`}>
                <Heart size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">Pet Parent</h3>
                  <span className="text-xs px-2 py-0.5 bg-familiar-500 text-white rounded-full flex items-center gap-1">
                    <Sparkles size={10} /> Dual Access
                  </span>
                  {selectedRole === 'pet_parent' && <Check size={18} className="text-familiar-500" />}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage pets, set reminders, use AI assistant, PLUS all community features
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-xs px-2 py-1 bg-familiar-100 text-familiar-700 rounded-full">Pet Profiles</span>
                  <span className="text-xs px-2 py-1 bg-familiar-100 text-familiar-700 rounded-full">Reminders</span>
                  <span className="text-xs px-2 py-1 bg-familiar-100 text-familiar-700 rounded-full">AI Assistant</span>
                  <span className="text-xs px-2 py-1 bg-muted rounded-full">+ Community</span>
                </div>
              </div>
            </div>
          </button>
        </div>

        <Button
          onClick={handleRoleSelect}
          disabled={!selectedRole || loading}
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
          Visitors can upgrade to Pet Parent anytime
        </p>
      </div>
    </div>
  );
};

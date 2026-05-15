// Gamification math: XP curves, levels, mood, streaks
import type { TaskCategory } from './taskEngine';

export const xpForLevel = (level: number) => 50 * level * level;

export function levelFromXp(xp: number): { level: number; xpInLevel: number; xpToNext: number; progress: number } {
  let level = 1;
  while (xp >= xpForLevel(level)) {
    xp -= xpForLevel(level);
    level++;
  }
  const xpToNext = xpForLevel(level);
  return { level, xpInLevel: xp, xpToNext, progress: xp / xpToNext };
}

export type Mood = 'happy' | 'sleepy' | 'hungry' | 'playful' | 'lonely' | 'sick';

export const MOOD_META: Record<Mood, { emoji: string; label: string; tone: string; color: string }> = {
  happy:   { emoji: '😊', label: 'Happy',   tone: 'Loving life',          color: 'mood-happy' },
  playful: { emoji: '🐾', label: 'Playful', tone: 'Wants to play',        color: 'mood-playful' },
  sleepy:  { emoji: '😴', label: 'Sleepy',  tone: 'Resting up',           color: 'mood-sleepy' },
  hungry:  { emoji: '🍖', label: 'Hungry',  tone: 'Could use a meal',     color: 'mood-hungry' },
  lonely:  { emoji: '🥺', label: 'Lonely',  tone: 'Misses you',           color: 'mood-lonely' },
  sick:    { emoji: '🤒', label: 'Unwell',  tone: 'Needs attention',      color: 'mood-sick' },
};

export interface MoodInputs {
  happiness: number;
  health: number;
  hoursSinceFeed?: number;
  hoursSinceWalk?: number;
  hoursSinceActivity?: number;
}

export function deriveMood(input: MoodInputs): Mood {
  if (input.health < 40) return 'sick';
  if ((input.hoursSinceFeed ?? 0) > 8) return 'hungry';
  if ((input.hoursSinceActivity ?? 0) > 24) return 'lonely';
  if (input.happiness >= 80) return 'playful';
  if (input.happiness >= 60) return 'happy';
  if ((input.hoursSinceWalk ?? 0) > 12 && input.happiness < 60) return 'sleepy';
  return 'happy';
}

export const CATEGORY_XP: Record<TaskCategory, number> = {
  feeding: 10,
  walk: 20,
  medicine: 15,
  grooming: 15,
  hydration: 5,
  litter: 10,
  play: 12,
  training: 18,
  other: 8,
};

export function happinessDelta(category: TaskCategory): number {
  switch (category) {
    case 'play': case 'walk': return 8;
    case 'feeding': case 'hydration': return 4;
    case 'grooming': return 6;
    case 'medicine': return 3;
    case 'training': return 7;
    default: return 3;
  }
}

export function healthDelta(category: TaskCategory): number {
  switch (category) {
    case 'medicine': return 6;
    case 'feeding': case 'hydration': return 3;
    case 'walk': case 'grooming': case 'litter': return 4;
    default: return 1;
  }
}

export function calcStreak(completionDates: Date[]): number {
  if (!completionDates.length) return 0;
  const days = new Set(completionDates.map(d => d.toDateString()));
  let streak = 0;
  const cur = new Date();
  cur.setHours(0, 0, 0, 0);
  // Allow today to be empty without breaking streak
  if (!days.has(cur.toDateString())) cur.setDate(cur.getDate() - 1);
  while (days.has(cur.toDateString())) {
    streak++;
    cur.setDate(cur.getDate() - 1);
  }
  return streak;
}

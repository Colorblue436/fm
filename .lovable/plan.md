## Familiar — Gamified Pet Productivity Transformation

Evolve the existing app into a Habitica/Finch-style pet care companion with daily tasks, gamification, mood states, and a cozy redesign. Nothing existing is removed — pets, reminders, vaccinations, community, memories, health records all stay.

### 1. Database (new tables, migration)
- `pet_tasks` — recurring daily care tasks per pet (`pet_id`, `user_id`, `category` enum: feeding/walk/medicine/grooming/hydration/litter, `title`, `xp_reward`, `recurrence` (daily/weekly), `time_of_day`, `is_active`).
- `task_completions` — log of completions (`task_id`, `user_id`, `pet_id`, `completed_at`, `xp_earned`). Used for streaks + history.
- `pet_stats` — gamification per pet (`pet_id`, `happiness` 0–100, `health_score` 0–100, `mood` enum: happy/sleepy/hungry/playful/lonely, `xp`, `level`, `current_streak`, `longest_streak`, `last_activity_at`).
- `user_achievements` — earned badges (`user_id`, `badge_key`, `earned_at`).
- RLS: owner-only on all four. Triggers to auto-create `pet_stats` row when a pet is inserted.

### 2. New core logic modules (`src/lib/`)
- `gamification.ts` — XP curve, level thresholds, mood derivation from recent completions, happiness/health decay, streak calc.
- `taskEngine.ts` — generate today's task instances from `pet_tasks`, mark complete, award XP, update stats.
- `achievements.ts` — badge definitions (First Walk, 7-Day Streak, Level 5, Hydration Hero, etc.) + check function.

### 3. New hooks (`src/hooks/`)
- `usePetStats(petId)` — realtime pet_stats + mood.
- `useDailyTasks(petId)` — today's tasks + completion state.
- `useGamification()` — total XP, level, streak, badges across user.

### 4. UI — new components (`src/components/gamification/`)
- `MoodBubble.tsx` — animated emoji + label per mood.
- `HappinessMeter.tsx`, `HealthMeter.tsx` — animated gradient progress bars.
- `XPBar.tsx` — level + XP-to-next with shimmer.
- `StreakFlame.tsx` — flame icon + day count.
- `TaskCard.tsx` — category icon, swipe/tap to complete, confetti + XP popup on complete.
- `BadgeGrid.tsx` — earned + locked achievements.
- `LevelUpDialog.tsx` — celebratory modal.

### 5. New views
- `src/views/Tasks.tsx` — full daily task list grouped by pet, filter chips per category, completion animations (framer-motion + canvas-confetti).
- Keep existing `AiAssistant.tsx` but rebrand header as "Familiar" with cozy chat bubbles and motivational quick prompts (UI polish only — backend already exists).

### 6. Dashboard redesign (`src/views/Home.tsx`)
Reorder to: Pet header → Mood + Happiness/Health meters → XP bar + streak → Today's tasks (with quick-complete) → Upcoming reminders → Recent activity → Quick actions. Reuse existing `PetHeaderCard`, add new gamification components above the fold.

### 7. Navigation
Mobile bottom nav simplified to: Home, Pets, **Tasks**, Assistant, Profile. Desktop sidebar keeps full menu (Records, Reminders, Community, etc. still reachable). Add `AppView.TASKS` to enum + role access (Pet Parent + Both).

### 8. Design system polish (`src/index.css`, `tailwind.config.ts`)
- Add cozy gradient tokens (`--gradient-cozy`, `--gradient-mood-happy`, etc.).
- Add `glass` utility (backdrop-blur + translucent bg).
- Add keyframes: `bounce-soft`, `pop`, `shimmer`, `float`.
- Keep daily accent theme rule from memory.

### 9. Mock/seed data
On first load with zero tasks, auto-seed a default daily set per pet (feed AM/PM, walk, hydration, grooming weekly) via `taskEngine.ensureDefaults()`. No fake community/drops data (per memory rule: live data only for social).

### 10. Refactor
Move existing scattered logic into the three lib modules above. No file renames in unrelated areas. Existing reminders, vaccinations, health records, community untouched functionally.

### Tech notes
- `canvas-confetti` for completion bursts (small dep).
- `framer-motion` already implied by animations skill — add if missing.
- All new colors via HSL tokens; no raw color classes in components.
- Realtime: enable `pet_stats` + `task_completions` on supabase_realtime publication so dashboards update live.

### Out of scope (this pass)
- Real push notifications (use existing in-app reminders).
- AI-powered task suggestions (UI only for assistant; chat backend already wired).
- Social leaderboards.

### Step order
1. Migration (tables + RLS + triggers + realtime).
2. lib + hooks.
3. Gamification components.
4. Tasks view + nav entry + role access.
5. Home redesign.
6. Assistant cozy reskin.
7. Design tokens + animations.
8. Manual smoke test in preview.

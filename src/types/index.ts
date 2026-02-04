export enum AppView {
  HOME = 'home',
  DASHBOARD = 'dashboard',
  PETS = 'pets',
  REMINDERS = 'reminders',
  ASSISTANT = 'assistant',
  NEARBY = 'nearby',
  COMMUNITY = 'community',
  DROPS = 'drops',
  GROUPS = 'groups',
  PROFILE = 'profile',
  AUTH = 'auth',
}

export enum PetType {
  DOG = 'Dog',
  CAT = 'Cat',
  BIRD = 'Bird',
  FISH = 'Fish',
  REPTILE = 'Reptile',
  OTHER = 'Other',
}

export interface Pet {
  id: string;
  user_id: string;
  name: string;
  type: PetType;
  breed?: string;
  age: number;
  avatarUrl?: string;
  favoriteToys?: string[];
  notes?: string;
  status?: 'active' | 'in_care';
  created_at?: string;
}

export interface Vaccination {
  id: string;
  pet_id: string;
  name: string;
  date: string;
  next_due?: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  pet_id: string;
  title: string;
  date: string;
  isCompleted: boolean;
  created_at?: string;
}

export interface Place {
  id: string;
  name: string;
  type: 'vet' | 'store';
  address: string;
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  distance: string;
  imageUrl: string;
  phone?: string;
}

export interface Post {
  id: string;
  user_id: string;
  userName: string;
  userAvatar: string;
  userRole?: 'member' | 'moderator';
  content: string;
  image?: string;
  topic?: string;
  likes: number;
  commentCount: number;
  isPinned?: boolean;
  timestamp: string;
}

export interface Drop {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    isVerified: boolean;
  };
  type: 'video' | 'image' | 'text';
  mediaUrl?: string;
  thumbnailUrl?: string;
  description: string;
  tags: string[];
  metrics: {
    likes: number;
    comments: number;
    shares: number;
  };
  isLocked?: boolean;
  accessLevel: 'free' | 'premium';
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  imageUrl: string;
  isJoined: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  created_at?: string;
}

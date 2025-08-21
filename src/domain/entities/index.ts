// Domain entity types for Ogiri Battle
export type ID = string;

export interface User {
  id: ID;
  displayName: string;
  handle?: string | null;
  avatarUrl?: string | null;
  createdAt: string; // ISO timestamp
}

export type PromptKind = 'text' | 'image';

export interface Prompt {
  id: ID;
  title: string; // for image prompt, can be a short descriptor
  body?: string | null; // extended text (optional)
  createdAt: string;
  isActive: boolean;
  status: 'upcoming' | 'active' | 'closed';
  kind?: PromptKind; // defaults to text
  imageUrl?: string | null; // when kind === 'image'
}

export interface Joke {
  id: ID;
  promptId: ID;
  userId: ID | null; // could be null if imported from external (LINE) before mapping
  body: string;
  createdAt: string;
  tags?: string[]; // simple for now; later normalize
  source?: 'app' | 'line';
}

export type VoteType = 'ippon' | 'waza' | 'valid';

export interface Vote {
  id: ID;
  jokeId: ID;
  voterUserId?: ID | null; // null when guest
  guestName?: string | null;
  type: VoteType;
  weight: number; // denormalized for fast scoreboard
  createdAt: string;
}

export interface Comment {
  id: ID;
  jokeId: ID;
  userId?: ID | null;
  guestName?: string | null;
  body: string;
  createdAt: string;
}

export interface RecentUserScore {
  userId: ID;
  totalScore: number;
}

export interface VoteWeightsConfig {
  ippon: number;
  waza: number;
  valid: number;
}

export const DEFAULT_VOTE_WEIGHTS: VoteWeightsConfig = {
  ippon: 3,
  waza: 2,
  valid: 1,
};

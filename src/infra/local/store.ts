// Simple in-memory + JSON import store for early prototyping. Later replace with Supabase.
import { DEFAULT_VOTE_WEIGHTS, ID, Joke, Prompt, User, Vote, VoteType, Comment } from '../../domain/entities';
import { randomUUID } from 'crypto';

interface DatabaseShape {
  users: User[];
  prompts: Prompt[];
  jokes: Joke[];
  votes: Vote[];
  comments: Comment[];
  voteWeights: typeof DEFAULT_VOTE_WEIGHTS;
}

const now = () => new Date().toISOString();

const demoUsers: User[] = [
  { id: randomUUID(), displayName: 'Alice', createdAt: now() },
  { id: randomUUID(), displayName: 'Bob', createdAt: now() },
  { id: randomUUID(), displayName: 'Charlie', createdAt: now() },
];

const demoPrompts: Prompt[] = Array.from({ length: 12 }).map((_, i) => ({
  id: randomUUID(),
  title: `お題 ${i + 1}`,
  body: null,
  createdAt: new Date(Date.now() - i * 3600_000).toISOString(),
  isActive: i < 2,
  status: i === 0 ? 'active' : i < 5 ? 'closed' : 'upcoming',
}));

const prompt0 = demoPrompts[0];

const demoJokes: Joke[] = Array.from({ length: 25 }).map((_, i) => ({
  id: randomUUID(),
  promptId: prompt0.id,
  userId: demoUsers[i % demoUsers.length].id,
  body: `ボケサンプル ${i + 1}`,
  createdAt: now(),
  tags: [],
  source: 'app',
}));

const db: DatabaseShape = {
  users: demoUsers,
  prompts: demoPrompts,
  jokes: demoJokes,
  votes: [],
  comments: [],
  voteWeights: DEFAULT_VOTE_WEIGHTS,
};

export const localDB = db;

export function getVoteWeight(type: VoteType) {
  return db.voteWeights[type];
}

export function upsertVote(v: { jokeId: ID; voterUserId?: ID | null; guestName?: string | null; type: VoteType }): Vote {
  // constraint: one vote per (jokeId + (voterUserId|guestName))
  // self-vote prohibition: if voterUserId equals joke userId, reject
  if (v.voterUserId) {
    const joke = db.jokes.find(j => j.id === v.jokeId);
    if (joke && joke.userId === v.voterUserId) {
      throw new Error('Cannot vote for own joke');
    }
  }
  const keyMatch = (vote: Vote) =>
    vote.jokeId === v.jokeId &&
    ((v.voterUserId && vote.voterUserId === v.voterUserId) || (!v.voterUserId && v.guestName && vote.guestName === v.guestName));
  const existing = db.votes.find(keyMatch);
  const weight = getVoteWeight(v.type);
  if (existing) {
    existing.type = v.type;
    existing.weight = weight;
    return existing;
  }
  const newVote: Vote = {
    id: randomUUID(),
    jokeId: v.jokeId,
    voterUserId: v.voterUserId ?? null,
    guestName: v.guestName ?? null,
    type: v.type,
    weight,
    createdAt: now(),
  };
  db.votes.push(newVote);
  return newVote;
}

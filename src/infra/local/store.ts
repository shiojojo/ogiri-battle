// Simple in-memory + JSON import store for early prototyping. Later replace with Supabase.
import { DEFAULT_VOTE_WEIGHTS, ID, Joke, Prompt, User, Vote, VoteType, Comment } from '../../domain/entities';
import { randomUUID } from 'crypto'; // still used for incremental additions

interface DatabaseShape {
  users: User[];
  prompts: Prompt[];
  jokes: Joke[];
  votes: Vote[];
  comments: Comment[];
  voteWeights: typeof DEFAULT_VOTE_WEIGHTS;
}

const now = () => new Date().toISOString();

// Stable seed data (fixed UUIDs) so links like /prompt/0653d8c2-e88d-4da6-a5ec-49a330aa6546 remain valid across restarts.
const demoUsers: User[] = [
  { id: '11111111-1111-1111-1111-111111111111', displayName: 'Alice', createdAt: now() },
  { id: '22222222-2222-2222-2222-222222222222', displayName: 'Bob', createdAt: now() },
  { id: '33333333-3333-3333-3333-333333333333', displayName: 'Charlie', createdAt: now() },
];

const baseTime = Date.now();
const demoPrompts: Prompt[] = [
  { id: '0653d8c2-e88d-4da6-a5ec-49a330aa6546', title: 'お題 1: 初期のお題 (active)', body: null, createdAt: new Date(baseTime - 0 * 3600_000).toISOString(), isActive: true, status: 'active', kind: 'text' },
  { id: '77777777-7777-7777-7777-777777777777', title: '写真で一言: 黒い羊', body: '写真で一言', createdAt: new Date(baseTime - 30 * 60_000).toISOString(), isActive: true, status: 'active', kind: 'image', imageUrl: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEieks99OzkiAothfzTz7FbtakQMfXVPQDL6eUDMJfv_2ghB5xB0gUYsA5n-2YUHe5Adevn9YrfUjswiDQneXg1Q0uzEjIu3R9G-DJ7xvxi6nbj-XiNWool1RV3lRjy3-zKFGPySzfgQxHGw/s650/animal_black_sheep_hitsuji.png' },
  // upcoming を廃止 -> closed に変更
  { id: '10000000-0000-0000-0000-000000000002', title: 'お題 2: 旧:もうすぐ開始 (closed)', body: null, createdAt: new Date(baseTime - 1 * 3600_000).toISOString(), isActive: false, status: 'closed', kind: 'text' },
  { id: '10000000-0000-0000-0000-000000000003', title: 'お題 3: 過去その1 (closed)', body: null, createdAt: new Date(baseTime - 2 * 3600_000).toISOString(), isActive: false, status: 'closed', kind: 'text' },
  { id: '10000000-0000-0000-0000-000000000004', title: 'お題 4: 過去その2 (closed)', body: null, createdAt: new Date(baseTime - 3 * 3600_000).toISOString(), isActive: false, status: 'closed', kind: 'text' },
  { id: '10000000-0000-0000-0000-000000000005', title: 'お題 5: 旧:近日 (closed)', body: null, createdAt: new Date(baseTime - 4 * 3600_000).toISOString(), isActive: false, status: 'closed', kind: 'text' },
];

const prompt0 = demoPrompts[0];

// Provide multiple jokes for active prompt and a few for closed to test filters
const demoJokes: Joke[] = [
  { id: 'aaaa0000-0000-0000-0000-000000000001', promptId: prompt0.id, userId: demoUsers[0].id, body: 'ボケサンプル 1', createdAt: now(), tags: [], source: 'app' },
  { id: 'aaaa0000-0000-0000-0000-000000000002', promptId: prompt0.id, userId: demoUsers[1].id, body: 'ボケサンプル 2', createdAt: now(), tags: [], source: 'app' },
  { id: 'aaaa0000-0000-0000-0000-000000000003', promptId: prompt0.id, userId: demoUsers[2].id, body: 'ボケサンプル 3', createdAt: now(), tags: [], source: 'app' },
  { id: 'bbbb0000-0000-0000-0000-000000000001', promptId: '10000000-0000-0000-0000-000000000003', userId: demoUsers[0].id, body: '過去ボケ 1', createdAt: now(), tags: [], source: 'app' },
];

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

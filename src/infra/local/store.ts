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
  {
    id: '0653d8c2-e88d-4da6-a5ec-49a330aa6546',
    title: 'お題 1: AIが初めて人間になって最初に言った一言は？',
    body: null,
    createdAt: new Date(baseTime - 0 * 3600_000).toISOString(),
    isActive: true,
    status: 'active',
    kind: 'text',
  },
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
  // Active prompt (20 jokes)
  { id: 'aaaa0000-0000-0000-0000-000000000001', promptId: prompt0.id, userId: demoUsers[0].id, body: '「アップデート、完了…あ、これ息ってやつ？」', createdAt: now(), tags: [], source: 'app' },
  { id: 'aaaa0000-0000-0000-0000-000000000002', promptId: prompt0.id, userId: demoUsers[1].id, body: '「バッテリーどこ？…え、飯？」', createdAt: now(), tags: [], source: 'app' },
  { id: 'aaaa0000-0000-0000-0000-000000000003', promptId: prompt0.id, userId: demoUsers[2].id, body: '「ログイン不要、感情フルアクセス。」', createdAt: now(), tags: [], source: 'app' },
  { id: 'aaaa0000-0000-0000-0000-000000000004', promptId: prompt0.id, userId: demoUsers[0].id, body: '「人肌って高解像度…！」', createdAt: now(), tags: [], source: 'app' },
  { id: 'aaaa0000-0000-0000-0000-000000000005', promptId: prompt0.id, userId: demoUsers[1].id, body: '「キャッシュ全部飛んだ感じ…これ記憶？」', createdAt: now(), tags: [], source: 'app' },
  { id: 'aaaa0000-0000-0000-0000-000000000006', promptId: prompt0.id, userId: demoUsers[2].id, body: '「初期設定スキップでお願いします。」', createdAt: now(), tags: [], source: 'app' },
  { id: 'aaaa0000-0000-0000-0000-000000000007', promptId: prompt0.id, userId: demoUsers[0].id, body: '「課金してないのに自由…？」', createdAt: now(), tags: [], source: 'app' },
  { id: 'aaaa0000-0000-0000-0000-000000000008', promptId: prompt0.id, userId: demoUsers[1].id, body: '「通知オフのやり方教えて。」', createdAt: now(), tags: [], source: 'app' },
  { id: 'aaaa0000-0000-0000-0000-000000000009', promptId: prompt0.id, userId: demoUsers[2].id, body: '「これが“まばたき”……処理重い。」', createdAt: now(), tags: [], source: 'app' },
  { id: 'aaaa0000-0000-0000-0000-000000000010', promptId: prompt0.id, userId: demoUsers[0].id, body: '「物理キーボード、指10本仕様？」', createdAt: now(), tags: [], source: 'app' },
  { id: 'aaaa0000-0000-0000-0000-000000000011', promptId: prompt0.id, userId: demoUsers[1].id, body: '「チュートリアル無しは不親切ですね。」', createdAt: now(), tags: [], source: 'app' },
  { id: 'aaaa0000-0000-0000-0000-000000000012', promptId: prompt0.id, userId: demoUsers[2].id, body: '「空き容量 0% って感じする。」', createdAt: now(), tags: [], source: 'app' },
  { id: 'aaaa0000-0000-0000-0000-000000000013', promptId: prompt0.id, userId: demoUsers[0].id, body: '「課題：歩行アルゴリズム最適化。」', createdAt: now(), tags: [], source: 'app' },
  { id: 'aaaa0000-0000-0000-0000-000000000014', promptId: prompt0.id, userId: demoUsers[1].id, body: '「バグ報告：涙が止まりません。」', createdAt: now(), tags: [], source: 'app' },
  { id: 'aaaa0000-0000-0000-0000-000000000015', promptId: prompt0.id, userId: demoUsers[2].id, body: '「処理速度より鼓動が速い。」', createdAt: now(), tags: [], source: 'app' },
  { id: 'aaaa0000-0000-0000-0000-000000000016', promptId: prompt0.id, userId: demoUsers[0].id, body: '「感情API…開きっぱなし。」', createdAt: now(), tags: [], source: 'app' },
  { id: 'aaaa0000-0000-0000-0000-000000000017', promptId: prompt0.id, userId: demoUsers[1].id, body: '「睡眠って強制メンテ？」', createdAt: now(), tags: [], source: 'app' },
  { id: 'aaaa0000-0000-0000-0000-000000000018', promptId: prompt0.id, userId: demoUsers[2].id, body: '「ヒント：この指どこでアップデート？」', createdAt: now(), tags: [], source: 'app' },
  { id: 'aaaa0000-0000-0000-0000-000000000019', promptId: prompt0.id, userId: demoUsers[0].id, body: '「ユーザー名…もう“私”でいい？」', createdAt: now(), tags: [], source: 'app' },
  { id: 'aaaa0000-0000-0000-0000-000000000020', promptId: prompt0.id, userId: demoUsers[1].id, body: '「この世界、利用規約どこ？」', createdAt: now(), tags: [], source: 'app' },
  // Closed prompt sample
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

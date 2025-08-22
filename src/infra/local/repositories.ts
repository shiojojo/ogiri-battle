import { localDB, upsertVote } from './store';
import { Comment, ID, Joke, Prompt, RecentUserScore, User, Vote, VoteType } from '../../domain/entities';
import { UserRepository, PromptRepository, JokeRepository, VoteRepository, CommentRepository, ScoreService } from '../../domain/repositories';
import { randomUUID } from 'crypto';

const now = () => new Date().toISOString();

export class LocalUserRepository implements UserRepository {
  async list(): Promise<User[]> { return [...localDB.users]; }
  async get(id: ID) { return localDB.users.find(u => u.id === id); }
  async create(data: Omit<User, 'createdAt' | 'id'>): Promise<User> {
    const user: User = { id: randomUUID(), createdAt: now(), ...data };
    localDB.users.push(user);
    return user;
  }
}

export class LocalPromptRepository implements PromptRepository {
  async listRecent(limit: number): Promise<Prompt[]> {
    // Closed is treated as logically deleted; exclude.
    const list = localDB.prompts.filter(p => p.status === 'active');
    return [...list].sort((a,b)=> b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
  }
  async listAll(): Promise<Prompt[]> { return [...localDB.prompts]; }
  async get(id: ID) { return localDB.prompts.find(p => p.id === id); }
}

export class LocalJokeRepository implements JokeRepository {
  async listByPrompt(promptId: ID): Promise<Joke[]> { return localDB.jokes.filter(j => j.promptId === promptId); }
  async create(data: Omit<Joke, 'id' | 'createdAt'>): Promise<Joke> {
    const joke: Joke = { id: randomUUID(), createdAt: now(), ...data };
    localDB.jokes.push(joke);
    return joke;
  }
}

export class LocalVoteRepository implements VoteRepository {
  async listByJokeIds(jokeIds: ID[]): Promise<Vote[]> {
    const set = new Set(jokeIds);
    return localDB.votes.filter(v => set.has(v.jokeId));
  }
  async upsert(data: { jokeId: ID; voterUserId?: ID | null; guestName?: string | null; type: VoteType }): Promise<Vote> {
    return upsertVote(data);
  }
}

export class LocalCommentRepository implements CommentRepository {
  async listByJoke(jokeId: ID): Promise<Comment[]> { return localDB.comments.filter(c => c.jokeId === jokeId); }
  async create(data: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> {
    const comment: Comment = { id: randomUUID(), createdAt: now(), ...data };
    localDB.comments.push(comment);
    return comment;
  }
}

export class LocalScoreService implements ScoreService {
  constructor(private prompts: LocalPromptRepository, private jokes: LocalJokeRepository, private votes: LocalVoteRepository) {}
  async computeRecentUserScores(limitPrompts: number): Promise<RecentUserScore[]> {
    const recent = await this.prompts.listRecent(limitPrompts);
    const recentIds = new Set(recent.map(p => p.id));
    const jokes = localDB.jokes.filter(j => recentIds.has(j.promptId));
    const votes = await this.votes.listByJokeIds(jokes.map(j => j.id));
    const scoreByJoke = votes.reduce<Record<ID, number>>((acc, v) => {
      acc[v.jokeId] = (acc[v.jokeId] || 0) + v.weight;
      return acc;
    }, {});
    const scoreByUser = jokes.reduce<Record<ID, number>>((acc, j) => {
      if (!j.userId) return acc;
      acc[j.userId] = (acc[j.userId] || 0) + (scoreByJoke[j.id] || 0);
      return acc;
    }, {});
    return Object.entries(scoreByUser).map(([userId, totalScore]) => ({ userId, totalScore }))
      .sort((a,b)=> b.totalScore - a.totalScore);
  }
  async computeAllTimeUserScores(): Promise<RecentUserScore[]> {
    const votes = await this.votes.listByJokeIds(localDB.jokes.map(j=>j.id));
    const scoreByJoke = votes.reduce<Record<ID, number>>((acc,v)=>{acc[v.jokeId]=(acc[v.jokeId]||0)+v.weight;return acc;},{});
    const scoreByUser = localDB.jokes.reduce<Record<ID, number>>((acc,j)=>{
      if(!j.userId) return acc;
      acc[j.userId]=(acc[j.userId]||0)+(scoreByJoke[j.id]||0);
      return acc;
    },{});
    return Object.entries(scoreByUser).map(([userId,totalScore])=>({userId,totalScore})).sort((a,b)=>b.totalScore-a.totalScore);
  }
}

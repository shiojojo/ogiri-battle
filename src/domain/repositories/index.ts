import { Comment, ID, Joke, Prompt, RecentUserScore, User, Vote, VoteType } from '../entities';

export interface UserRepository {
  list(): Promise<User[]>;
  get(id: ID): Promise<User | undefined>;
  create(data: Omit<User, 'createdAt' | 'id'>): Promise<User>;
}

export interface PromptRepository {
  listRecent(limit: number, includeClosed?: boolean): Promise<Prompt[]>;
  listAll(): Promise<Prompt[]>;
  get(id: ID): Promise<Prompt | undefined>;
}

export interface JokeRepository {
  listByPrompt(promptId: ID): Promise<Joke[]>;
  create(data: Omit<Joke, 'id' | 'createdAt'>): Promise<Joke>;
}

export interface VoteRepository {
  listByJokeIds(jokeIds: ID[]): Promise<Vote[]>;
  upsert(data: { jokeId: ID; voterUserId?: ID | null; guestName?: string | null; type: VoteType }): Promise<Vote>; // overwrite previous by same (jokeId + voterUserId|guestName)
}

export interface CommentRepository {
  listByJoke(jokeId: ID): Promise<Comment[]>;
  create(data: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment>;
}

export interface ScoreService {
  computeRecentUserScores(limitPrompts: number, includeClosed?: boolean): Promise<RecentUserScore[]>;
  computeAllTimeUserScores(): Promise<RecentUserScore[]>;
}

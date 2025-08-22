import {
  LocalJokeRepository,
  LocalVoteRepository,
  LocalPromptRepository,
  LocalCommentRepository,
  LocalUserRepository,
} from '../../infra/local/repositories';
import PopularClient from './PopularClient';
import { Joke, Vote, User } from '../../domain/entities';

export default async function PopularPage() {
  const jokeRepo = new LocalJokeRepository();
  const voteRepo = new LocalVoteRepository();
  const promptRepo = new LocalPromptRepository();
  const commentRepo = new LocalCommentRepository();
  const jokes: Joke[] = await jokeRepo.listAll();
  const votes: Vote[] = await voteRepo.listByJokeIds(jokes.map(j => j.id));
  const prompts = await promptRepo.listAll();
  const userRepo = new LocalUserRepository();
  const users: User[] = await userRepo.list();
  const commentsArr = await Promise.all(
    jokes.map(j => commentRepo.listByJoke(j.id))
  );
  const comments = commentsArr.flat();
  const scores = votes.reduce<Record<string, number>>((acc, v) => {
    acc[v.jokeId] = (acc[v.jokeId] || 0) + v.weight;
    return acc;
  }, {});
  return (
    <PopularClient
      jokes={jokes}
      prompts={prompts}
      votes={votes}
      users={users}
      comments={comments}
      scores={scores}
    />
  );
}

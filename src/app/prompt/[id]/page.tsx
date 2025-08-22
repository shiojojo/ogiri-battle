import {
  LocalPromptRepository,
  LocalJokeRepository,
  LocalVoteRepository,
  LocalUserRepository,
} from '../../../infra/local/repositories';
import PromptJokesClient from './PromptJokesClient';
import { LocalCommentRepository } from '../../../infra/local/repositories';

interface Props {
  params: { id: string };
}

async function getData(promptId: string) {
  const promptRepo = new LocalPromptRepository();
  const jokeRepo = new LocalJokeRepository();
  const voteRepo = new LocalVoteRepository();
  const userRepo = new LocalUserRepository();
  const commentRepo = new LocalCommentRepository();
  const prompt = await promptRepo.get(promptId);
  const jokes = await jokeRepo.listByPrompt(promptId);
  const votes = await voteRepo.listByJokeIds(jokes.map(j => j.id));
  const users = await userRepo.list();
  const comments = await Promise.all(
    jokes.map(j => commentRepo.listByJoke(j.id))
  );
  return { prompt, jokes, votes, users, comments: comments.flat() };
}

export default async function PromptDetailPage({ params }: Props) {
  const { prompt, jokes, votes, users, comments } = await getData(params.id);
  if (!prompt) return <div className="p-4">Not found</div>;
  const voteByJoke = votes.reduce<Record<string, number>>((acc, v) => {
    acc[v.jokeId] = (acc[v.jokeId] || 0) + v.weight;
    return acc;
  }, {});
  return (
    <main className="p-0 max-w-xl mx-auto flex flex-col h-[calc(100vh-60px)] pb-24 sm:pb-0">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b p-4 space-y-3">
        <h1 className="text-2xl font-bold leading-snug">{prompt.title}</h1>
        {prompt.kind === 'image' && prompt.imageUrl && (
          <div className="w-full bg-white dark:bg-white rounded border p-2 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={prompt.imageUrl}
              alt={prompt.title}
              className="max-h-56 w-auto object-contain"
            />
          </div>
        )}
        {prompt.status === 'closed' && (
          <div className="text-xs text-amber-500">
            過去お題ですが投票は可能です。
          </div>
        )}
      </div>
      <PromptJokesClient
        jokes={jokes}
        users={users}
        initialScores={voteByJoke}
        comments={comments}
        votes={votes}
      />
    </main>
  );
}

// Client VoteButtons imported above

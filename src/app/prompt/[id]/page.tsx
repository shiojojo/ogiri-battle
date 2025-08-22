import {
  LocalPromptRepository,
  LocalJokeRepository,
  LocalVoteRepository,
  LocalUserRepository,
} from '../../../infra/local/repositories';
import VoteClient from './VoteClient';

interface Props {
  params: { id: string };
}

async function getData(promptId: string) {
  const promptRepo = new LocalPromptRepository();
  const jokeRepo = new LocalJokeRepository();
  const voteRepo = new LocalVoteRepository();
  const userRepo = new LocalUserRepository();
  const prompt = await promptRepo.get(promptId);
  const jokes = await jokeRepo.listByPrompt(promptId);
  const votes = await voteRepo.listByJokeIds(jokes.map(j => j.id));
  const users = await userRepo.list();
  return { prompt, jokes, votes, users };
}

export default async function PromptDetailPage({ params }: Props) {
  const { prompt, jokes, votes, users } = await getData(params.id);
  if (!prompt) return <div className="p-4">Not found</div>;
  const voteByJoke = votes.reduce<Record<string, number>>((acc, v) => {
    acc[v.jokeId] = (acc[v.jokeId] || 0) + v.weight;
    return acc;
  }, {});
  return (
    <main className="p-0 max-w-xl mx-auto flex flex-col h-[calc(100vh-60px)] pb-24 sm:pb-0">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b p-4 space-y-3">
        <h1 className="text-lg font-bold leading-snug">{prompt.title}</h1>
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
      <ul className="flex-1 overflow-y-auto p-4 space-y-3 pb-24 sm:pb-6">
        {jokes.map(j => {
          const author = users.find(u => u.id === j.userId);
          const total = voteByJoke[j.id] || 0;
          return (
            <li key={j.id} className="border rounded p-3 bg-white/5 space-y-2">
              <div className="text-sm text-gray-400">
                {author?.displayName || 'Unknown'}
              </div>
              <div>{j.body}</div>
              <div className="flex items-center justify-between text-sm">
                <span>Score: {total}</span>
                <VoteClient jokeId={j.id} jokeUserId={j.userId || undefined} />
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

// Client VoteButtons imported above

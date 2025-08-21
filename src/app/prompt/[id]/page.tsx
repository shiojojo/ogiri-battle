import {
  LocalPromptRepository,
  LocalJokeRepository,
  LocalVoteRepository,
  LocalUserRepository,
} from '../../../infra/local/repositories';
import { VoteButtons } from '../../../components/vote/VoteButtons';

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
    <main className="p-4 space-y-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold sticky top-0 bg-background/80 backdrop-blur p-2">
        {prompt.title}
      </h1>
      {prompt.status === 'closed' && (
        <div className="text-xs text-amber-500">
          過去お題ですが投票は可能です。
        </div>
      )}
      <ul className="space-y-3">
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
                <VoteButtons
                  jokeId={j.id}
                  jokeUserId={j.userId || undefined}
                  // TODO: current user context
                  currentUserId={undefined}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

// Client VoteButtons imported above

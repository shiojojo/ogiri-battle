import {
  LocalPromptRepository,
  LocalJokeRepository,
  LocalVoteRepository,
  LocalUserRepository,
  LocalScoreService,
} from '../../infra/local/repositories';

async function getData(includeClosed: boolean) {
  const userRepo = new LocalUserRepository();
  const promptRepo = new LocalPromptRepository();
  const jokeRepo = new LocalJokeRepository();
  const voteRepo = new LocalVoteRepository();
  const scoreService = new LocalScoreService(promptRepo, jokeRepo, voteRepo);
  const users = await userRepo.list();
  const scores = await scoreService.computeRecentUserScores(10, includeClosed);
  const data = scores.map(s => ({
    user: users.find(u => u.id === s.userId)!,
    total: s.totalScore,
  }));
  return data;
}

export default async function ScoreboardPage({
  searchParams,
}: {
  searchParams: { closed?: string };
}) {
  const includeClosed = searchParams.closed === '1';
  const rows = await getData(includeClosed);
  return (
    <main className="p-4 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Scoreboard (Recent 10 Prompts)</h1>
      <div className="text-xs flex gap-2 items-center">
        <a
          href="/scoreboard"
          className={!includeClosed ? 'font-bold underline' : 'opacity-60'}
        >
          Active/Upcoming
        </a>
        <a
          href="/scoreboard?closed=1"
          className={includeClosed ? 'font-bold underline' : 'opacity-60'}
        >
          Include Closed
        </a>
      </div>
      <ul className="space-y-2">
        {rows.map((r, i) => (
          <li
            key={r.user.id}
            className="flex items-center justify-between rounded border p-2 bg-white/5"
          >
            <span className="flex items-center gap-2">
              <span className="w-6 text-right">{i + 1}</span>{' '}
              {r.user.displayName}
            </span>
            <span className="font-mono">{r.total}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}

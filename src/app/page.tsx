import Link from 'next/link';
import {
  LocalPromptRepository,
  LocalScoreService,
  LocalJokeRepository,
  LocalVoteRepository,
  LocalUserRepository,
} from '../infra/local/repositories';

async function getDashboardData() {
  const promptRepo = new LocalPromptRepository();
  const prompts = await promptRepo.listRecent(10, true); // last 10 (active + closed)
  const active = prompts.find(p => p.status === 'active') || prompts[0];
  // mini scoreboard
  const userRepo = new LocalUserRepository();
  const jokeRepo = new LocalJokeRepository();
  const voteRepo = new LocalVoteRepository();
  const scoreService = new LocalScoreService(promptRepo, jokeRepo, voteRepo);
  const users = await userRepo.list();
  const recentScores = await scoreService.computeRecentUserScores(10);
  const allTimeScores = await scoreService.computeAllTimeUserScores();
  const scoreboard = recentScores.slice(0, 5).map(s => ({
    name: users.find(u => u.id === s.userId)?.displayName || 'Unknown',
    total: s.totalScore,
  }));
  const allTimeMini = allTimeScores.slice(0, 5).map(s => ({
    name: users.find(u => u.id === s.userId)?.displayName || 'Unknown',
    total: s.totalScore,
  }));
  return { activePrompt: active, prompts, scoreboard, allTimeMini };
}

export default async function Home() {
  const { activePrompt, prompts, scoreboard, allTimeMini } =
    await getDashboardData();
  return (
    <main className="p-4 space-y-6 max-w-xl mx-auto">
      <section className="space-y-2">
        <h1 className="text-2xl font-bold">現在のお題</h1>
        {activePrompt ? (
          <div className="border rounded p-3 bg-white/5 space-y-2">
            <div className="font-semibold">{activePrompt.title}</div>
            <div className="flex gap-2 text-sm">
              <Link
                href={`/prompt/${activePrompt.id}`}
                className="text-blue-500"
              >
                ボケを見る / 投票
              </Link>
              <Link href="/jokes/new" className="text-blue-500">
                投稿
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            アクティブなお題はありません。
          </div>
        )}
        <div className="text-xs flex flex-wrap gap-2">
          {prompts.map(p => (
            <Link
              key={p.id}
              href={`/prompt/${p.id}`}
              className={`px-2 py-1 rounded border text-xs ${
                p.id === activePrompt?.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/5'
              }`}
            >
              {p.title}
            </Link>
          ))}
        </div>
      </section>
      <section className="space-y-2">
        <header className="flex items-center justify-between">
          <h2 className="text-xl font-bold">ランキング (直近10)</h2>
          <Link href="/scoreboard" className="text-xs text-blue-500">
            全て見る
          </Link>
        </header>
        <ul className="space-y-1">
          {scoreboard.map((r, i) => (
            <li
              key={i}
              className="flex justify-between text-sm border rounded px-2 py-1 bg-white/5"
            >
              <span>
                {i + 1}. {r.name}
              </span>
              <span className="font-mono">{r.total}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-bold">All Time 上位</h2>
        <ul className="space-y-1">
          {allTimeMini.map((r, i) => (
            <li
              key={i}
              className="flex justify-between text-sm border rounded px-2 py-1 bg-white/5"
            >
              <span>
                {i + 1}. {r.name}
              </span>
              <span className="font-mono">{r.total}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="grid grid-cols-2 gap-3 text-sm">
        <Link
          href="/archive"
          className="border rounded p-3 bg-white/5 hover:bg-white/10"
        >
          過去お題
        </Link>
        <Link
          href="/jokes/new"
          className="border rounded p-3 bg-white/5 hover:bg-white/10"
        >
          ボケ投稿
        </Link>
        <Link
          href="/users/new"
          className="border rounded p-3 bg-white/5 hover:bg-white/10"
        >
          ユーザー作成
        </Link>
        <Link
          href="/auth"
          className="border rounded p-3 bg-white/5 hover:bg-white/10"
        >
          ユーザー切替
        </Link>
      </section>
    </main>
  );
}

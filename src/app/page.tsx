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
  const prompts = await promptRepo.listRecent(10); // active prompts only
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
            <div className="font-semibold flex items-center gap-2">
              {activePrompt.kind === 'image' && activePrompt.imageUrl && (
                <div className="w-20 h-20 rounded border bg-white dark:bg-white flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activePrompt.imageUrl}
                    alt={activePrompt.title}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
              <span>
                {activePrompt.kind === 'image' ? '🖼' : '📝'}{' '}
                {activePrompt.title}
              </span>
            </div>
            <div className="flex gap-3 pt-1">
              <Link
                href={`/prompt/${activePrompt.id}`}
                className="flex-1 inline-flex items-center justify-center px-4 py-3 rounded-md bg-blue-600 text-white font-semibold text-base shadow hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                投票
              </Link>
              <Link
                href="/jokes/new"
                className="flex-1 inline-flex items-center justify-center px-4 py-3 rounded-md bg-emerald-600 text-white font-semibold text-base shadow hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
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
              {p.kind === 'image' ? '🖼' : '📝'} {p.title}
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
          href="/popular"
          className="border rounded p-3 bg-white/5 hover:bg-white/10"
        >
          人気ボケ
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

'use client';
import { useMemo, useState } from 'react';
import { Prompt } from '../../domain/entities';

interface PromptStats {
  jokeCount: number;
  voteCount: number;
  score: number;
}
interface Props {
  prompts: Prompt[];
  stats?: Record<string, PromptStats>;
  initialSort?: string;
}

export default function ArchiveClient({ prompts, stats, initialSort }: Props) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [search, setSearch] = useState('');
  // Prompt tags removed
  const [list] = useState(prompts);
  const [sort, setSort] = useState<string>(initialSort || 'new');

  const filtered = useMemo(() => {
    const base = list.filter(p => {
      if (from && p.createdAt < from) return false;
      if (to && p.createdAt > to + 'T23:59:59') return false;
      if (
        search &&
        !(p.title.includes(search) || (p.body || '').includes(search))
      )
        return false;
      return true;
    });
    const withStats = (p: Prompt) =>
      stats?.[p.id] || { jokeCount: 0, voteCount: 0, score: 0 };
    const sorted = [...base].sort((a, b) => {
      switch (sort) {
        case 'old':
          return a.createdAt.localeCompare(b.createdAt);
        case 'jokes':
          return (
            withStats(b).jokeCount - withStats(a).jokeCount ||
            b.createdAt.localeCompare(a.createdAt)
          );
        case 'votes':
          return (
            withStats(b).voteCount - withStats(a).voteCount ||
            b.createdAt.localeCompare(a.createdAt)
          );
        case 'score':
          return (
            withStats(b).score - withStats(a).score ||
            b.createdAt.localeCompare(a.createdAt)
          );
        case 'new':
        default:
          return b.createdAt.localeCompare(a.createdAt);
      }
    });
    return sorted;
  }, [list, from, to, search, sort, stats]);

  // tag add function removed

  return (
    <main className="p-4 max-w-lg mx-auto space-y-4">
      <h1 className="text-xl font-bold">過去お題検索</h1>
      <div className="flex items-center gap-2 text-xs">
        <label className="flex items-center gap-1">
          ソート:
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="border rounded px-1 py-0.5 bg-white/5"
          >
            <option value="new">新しい順</option>
            <option value="old">古い順</option>
            <option value="jokes">ボケ数</option>
            <option value="votes">投票数</option>
            <option value="score">スコア</option>
          </select>
        </label>
      </div>
      <div className="grid gap-3 text-sm md:grid-cols-2">
        <div>
          <label className="block mb-1">From (YYYY-MM-DD)</label>
          <input
            type="date"
            value={from}
            onChange={e => setFrom(e.target.value)}
            className="w-full border rounded px-2 py-1 bg-white/5"
          />
        </div>
        <div>
          <label className="block mb-1">To</label>
          <input
            type="date"
            value={to}
            onChange={e => setTo(e.target.value)}
            className="w-full border rounded px-2 py-1 bg-white/5"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block mb-1">キーワード</label>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border rounded px-2 py-1 bg-white/5"
            placeholder="タイトル/本文"
          />
        </div>
        {/* Tag filter removed */}
      </div>
      <ul className="space-y-2">
        {filtered.map(p => (
          <li
            key={p.id}
            className="border rounded bg-white/5 hover:ring-2 hover:ring-blue-400 transition"
          >
            <a href={`/prompt/${p.id}`} className="flex items-center gap-3 p-2">
              {p.kind === 'image' && (
                <div className="w-12 h-12 rounded border bg-white dark:bg-white flex items-center justify-center overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.imageUrl || ''}
                    alt={p.title}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
              <span className="truncate font-medium flex-1">
                {p.kind === 'image' ? '🖼' : '📝'} {p.title}
              </span>
              {stats && (
                <span className="hidden sm:flex flex-col text-[10px] text-gray-400 items-end ml-2">
                  <span>🗨 {stats[p.id]?.jokeCount ?? 0}</span>
                  <span>🗳 {stats[p.id]?.voteCount ?? 0}</span>
                  <span>★ {stats[p.id]?.score ?? 0}</span>
                </span>
              )}
              <span className="text-[10px] text-blue-500">→</span>
            </a>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="text-sm text-gray-500">該当なし</li>
        )}
      </ul>
    </main>
  );
}

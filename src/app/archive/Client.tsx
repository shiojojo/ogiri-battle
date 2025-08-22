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
  const [tag, setTag] = useState('');
  const [newTagBy, setNewTagBy] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [list, setList] = useState(prompts);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [sort, setSort] = useState<string>(initialSort || 'new');

  const allTags = useMemo(
    () => Array.from(new Set(prompts.flatMap(p => p.tags || []))).sort(),
    [prompts]
  );

  const filtered = useMemo(() => {
    const base = list.filter(p => {
      if (from && p.createdAt < from) return false;
      if (to && p.createdAt > to + 'T23:59:59') return false;
      if (
        search &&
        !(p.title.includes(search) || (p.body || '').includes(search))
      )
        return false;
      if (tag && !(p.tags || []).includes(tag)) return false;
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
  }, [list, from, to, search, tag, sort, stats]);

  async function addTag(promptId: string) {
    if (!tagInput) return;
    setAdding(true);
    try {
      const res = await fetch('/api/prompt/tag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptId, tag: tagInput }),
      });
      if (res.ok) {
        const data = await res.json();
        setList(ls => ls.map(p => (p.id === promptId ? data.prompt : p)));
        setTagInput('');
        setNewTagBy(null);
      }
    } finally {
      setAdding(false);
    }
  }

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
        <div className="md:col-span-2">
          <label className="block mb-1">タグ</label>
          <select
            value={tag}
            onChange={e => setTag(e.target.value)}
            className="w-full border rounded px-2 py-1 bg-white/5"
          >
            <option value="">(指定なし)</option>
            {allTags.map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>
      <ul className="space-y-2">
        {filtered.map(p => {
          const isOpen = expanded === p.id;
          return (
            <li
              key={p.id}
              className={`border rounded bg-white/5 ${
                isOpen ? 'ring-2 ring-blue-400' : ''
              }`}
            >
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : p.id)}
                className="w-full text-left p-2 flex items-center gap-3"
              >
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
                <span className="text-[10px] text-gray-500">
                  {isOpen ? '閉じる' : '詳細'}
                </span>
              </button>
              {isOpen && (
                <div className="border-t px-3 py-2 space-y-2 text-xs">
                  <div className="space-y-1">
                    <div className="font-semibold">タグ</div>
                    {(p.tags || []).length ? (
                      <div className="flex flex-wrap gap-1">
                        {(p.tags || []).map(t => (
                          <span
                            key={t}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-blue-600/20 border border-blue-600/40"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500">タグなし</div>
                    )}
                  </div>
                  <div className="space-y-1">
                    {newTagBy === p.id ? (
                      <div className="flex gap-2 items-center">
                        <input
                          value={tagInput}
                          onChange={e => setTagInput(e.target.value)}
                          className="flex-1 border rounded px-2 py-1 bg-white/5"
                          placeholder="新タグ"
                        />
                        <button
                          disabled={adding || !tagInput}
                          onClick={() => addTag(p.id)}
                          className="px-3 py-1 rounded bg-blue-600 text-white text-[11px] disabled:opacity-40"
                        >
                          追加
                        </button>
                        <button
                          onClick={() => {
                            setNewTagBy(null);
                            setTagInput('');
                          }}
                          className="px-2 py-1 rounded text-[11px] text-gray-400"
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setNewTagBy(p.id);
                          setTagInput('');
                        }}
                        className="text-xs text-blue-500"
                      >
                        + タグ追加
                      </button>
                    )}
                  </div>
                  <div>
                    <a
                      href={`/prompt/${p.id}`}
                      className="text-blue-500 underline underline-offset-2"
                    >
                      お題詳細へ
                    </a>
                  </div>
                </div>
              )}
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="text-sm text-gray-500">該当なし</li>
        )}
      </ul>
    </main>
  );
}

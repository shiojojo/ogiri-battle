'use client';
import { useMemo, useState } from 'react';
import { Joke, Prompt, Comment, Vote, User } from '../../domain/entities';
import Link from 'next/link';

interface Props {
  jokes: Joke[];
  prompts: Prompt[];
  comments: Comment[];
  scores: Record<string, number>;
  votes: Vote[];
  users: User[];
}

export default function PopularClient({
  jokes,
  prompts,
  comments,
  scores,
  votes,
  users,
}: Props) {
  const [onlyWithTags, setOnlyWithTags] = useState(false);
  const [onlyWithComments, setOnlyWithComments] = useState(false);
  const [minScore, setMinScore] = useState<number>(0);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  const commentByJoke = useMemo(
    () =>
      comments.reduce<Record<string, Comment[]>>((a, c) => {
        (a[c.jokeId] ||= []).push(c);
        return a;
      }, {}),
    [comments]
  );
  const allTags = useMemo(
    () => Array.from(new Set(jokes.flatMap(j => j.tags || []))).sort(),
    [jokes]
  );

  const votesByJoke = useMemo(() => {
    return votes.reduce<Record<string, Vote[]>>((acc, v) => {
      (acc[v.jokeId] ||= []).push(v);
      return acc;
    }, {});
  }, [votes]);

  const filtered = useMemo(() => {
    return jokes
      .filter(j => {
        if (minScore > 0 && (scores[j.id] || 0) < minScore) return false;
        if (onlyWithTags && !(j.tags && j.tags.length)) return false;
        if (onlyWithComments && !commentByJoke[j.id]) return false;
        if (search && !j.body.includes(search)) return false;
        if (tagFilter && !(j.tags || []).includes(tagFilter)) return false;
        return true;
      })
      .sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));
  }, [
    jokes,
    minScore,
    onlyWithTags,
    onlyWithComments,
    search,
    tagFilter,
    scores,
    commentByJoke,
  ]);

  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <main className="p-4 max-w-xl mx-auto space-y-5">
      <h1 className="text-2xl font-bold">人気ボケ</h1>
      <div className="grid gap-3 text-sm md:grid-cols-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={onlyWithTags}
            onChange={e => setOnlyWithTags(e.target.checked)}
          />
          タグあり
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={onlyWithComments}
            onChange={e => setOnlyWithComments(e.target.checked)}
          />
          コメントあり
        </label>
        <div>
          <label className="block mb-1">最低スコア</label>
          <input
            type="number"
            value={minScore}
            onChange={e => setMinScore(Number(e.target.value) || 0)}
            className="w-full border rounded px-2 py-1 bg-white/5"
          />
        </div>
        <div>
          <label className="block mb-1">本文検索</label>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border rounded px-2 py-1 bg-white/5"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block mb-1">タグ</label>
          <select
            value={tagFilter}
            onChange={e => setTagFilter(e.target.value)}
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
      <ul className="space-y-4">
        {filtered.map(j => {
          const prompt = prompts.find(p => p.id === j.promptId);
          const commentsFor = commentByJoke[j.id] || [];
          const isOpen = expanded === j.id;
          return (
            <li
              key={j.id}
              className={`border rounded-2xl bg-white/5 shadow-sm ${
                isOpen ? 'ring-2 ring-blue-400' : ''
              }`}
            >
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : j.id)}
                className="w-full text-left p-4 space-y-3 focus:outline-none"
              >
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span className="truncate max-w-[60%] font-semibold text-gray-200 text-base leading-snug">
                    {prompt?.title}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-sm text-white">
                      {scores[j.id] || 0}
                    </span>
                    {commentsFor.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-600/30 text-indigo-200 border border-indigo-500/40">
                        コメ {commentsFor.length}
                      </span>
                    )}
                  </span>
                </div>
                <div className="text-lg leading-snug font-semibold whitespace-pre-wrap break-words">
                  {j.body}
                </div>
                <div className="text-[10px] text-gray-500">
                  タップして{isOpen ? '閉じる' : 'コメントを見る'}
                </div>
              </button>
              {isOpen && (
                <div className="border-t px-4 pb-4 pt-2 space-y-4 bg-white/10 rounded-b-2xl text-xs">
                  <div className="space-y-1">
                    <div className="font-semibold">タグ</div>
                    {(j.tags || []).length ? (
                      <div className="flex flex-wrap gap-1">
                        {(j.tags || []).map(t => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded bg-blue-600/20 border border-blue-600/40 text-[10px]"
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
                    <div className="font-semibold">コメント</div>
                    {commentsFor.length ? (
                      <ul className="space-y-1">
                        {commentsFor.map(c => (
                          <li key={c.id} className="flex gap-2">
                            <span className="text-gray-400">
                              {users.find(u => u.id === c.userId)
                                ?.displayName ||
                                c.guestName ||
                                'Anon'}
                              :
                            </span>
                            <span className="flex-1 break-words">{c.body}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-gray-500">コメントなし</div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold">投票内訳</div>
                    {votesByJoke[j.id]?.length ? (
                      <ul className="space-y-1">
                        {votesByJoke[j.id].map(v => (
                          <li
                            key={v.id}
                            className="flex justify-between items-center gap-2"
                          >
                            <span className="truncate max-w-[55%]">
                              {users.find(u => u.id === v.voterUserId)
                                ?.displayName ||
                                v.guestName ||
                                'Anon'}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded bg-blue-600/20 border border-blue-600/40">
                              {v.type === 'ippon'
                                ? '一本'
                                : v.type === 'waza_ari'
                                ? '技あり'
                                : '有効'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-gray-500">まだ投票なし</div>
                    )}
                  </div>
                  <Link
                    href={`/prompt/${j.promptId}`}
                    className="inline-block text-xs text-blue-400 underline underline-offset-2"
                  >
                    元お題へ
                  </Link>
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

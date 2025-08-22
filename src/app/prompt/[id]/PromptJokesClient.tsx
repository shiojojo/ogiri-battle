'use client';
import { useState } from 'react';
import { Joke, Comment, User, Vote } from '../../../domain/entities';
import { VoteButtons } from '../../../components/vote/VoteButtons';
import { useUser } from '../../../components/user/UserContext';

interface Props {
  jokes: Joke[];
  users: User[];
  initialScores: Record<string, number>;
  comments: Comment[];
  votes: Vote[];
}

export default function PromptJokesClient({
  jokes,
  users,
  initialScores,
  comments,
  votes,
}: Props) {
  const { currentUser } = useUser();
  const [scores, setScores] = useState<Record<string, number>>(initialScores);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [lastVoted, setLastVoted] = useState<string | null>(null);

  const commentsByJoke = comments.reduce<Record<string, Comment[]>>(
    (acc, c) => {
      (acc[c.jokeId] ||= []).push(c);
      return acc;
    },
    {}
  );

  const votesByJoke = votes.reduce<Record<string, Vote[]>>((acc, v) => {
    (acc[v.jokeId] ||= []).push(v);
    return acc;
  }, {});

  return (
    <ul className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 sm:pb-6">
      {jokes.map(j => {
        const author = users.find(u => u.id === j.userId);
        const total = scores[j.id] || 0;
        const isExpanded = expanded === j.id;
        const hasTags = !!j.tags?.length;
        const hasComments = !!commentsByJoke[j.id]?.length;
        return (
          <li
            key={j.id}
            className={`border rounded bg-white/5 ${
              lastVoted === j.id ? 'ring-2 ring-blue-400' : ''
            }`}
          >
            <button
              type="button"
              onClick={() => setExpanded(isExpanded ? null : j.id)}
              className="w-full text-left p-3 space-y-2"
            >
              <div className="text-xs text-gray-400 flex items-center justify-between gap-2">
                <span className="truncate max-w-[55%]">
                  {author?.displayName || 'Unknown'}
                </span>
                <span className="flex items-center gap-2">
                  {(hasTags || hasComments) && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-600/20 text-indigo-300 border border-indigo-500/40">
                      {hasTags && hasComments
                        ? 'タグ/コメ'
                        : hasTags
                        ? 'タグ'
                        : 'コメ'}
                    </span>
                  )}
                </span>
              </div>
              <div className="text-base leading-snug font-medium">{j.body}</div>
            </button>
            <div className="px-3 pb-3 flex items-center justify-between gap-4">
              <div className="font-mono text-xs text-gray-400">{total}</div>
              {(() => {
                const existingVote = votesByJoke[j.id]?.find(
                  v => v.voterUserId === currentUser?.id
                );
                return (
                  <VoteButtons
                    jokeId={j.id}
                    jokeUserId={j.userId || undefined}
                    currentUserId={currentUser?.id}
                    existing={
                      existingVote
                        ? {
                            type: existingVote.type,
                            weight: existingVote.weight,
                          }
                        : undefined
                    }
                    onVoted={({ delta }) => {
                      setScores(s => ({
                        ...s,
                        [j.id]: (s[j.id] || 0) + delta,
                      }));
                      setLastVoted(j.id);
                      setTimeout(
                        () => setLastVoted(l => (l === j.id ? null : l)),
                        1200
                      );
                    }}
                  />
                );
              })()}
            </div>
            {isExpanded && (
              <div className="border-t bg-white/10 px-3 py-2 space-y-2 text-xs">
                {j.tags?.length ? (
                  <div className="flex flex-wrap gap-1">
                    {j.tags.map(t => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded bg-blue-600/20 border border-blue-600/40"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500">タグなし</div>
                )}
                <div className="space-y-1">
                  <div className="font-semibold">コメント</div>
                  {commentsByJoke[j.id]?.length ? (
                    <ul className="space-y-1">
                      {commentsByJoke[j.id].map(c => (
                        <li key={c.id} className="flex gap-2">
                          <span className="text-gray-400">
                            {users.find(u => u.id === c.userId)?.displayName ||
                              c.guestName ||
                              'Anon'}
                            :
                          </span>
                          <span>{c.body}</span>
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
                        <li key={v.id} className="flex justify-between">
                          <span className="truncate max-w-[60%]">
                            {users.find(u => u.id === v.voterUserId)
                              ?.displayName ||
                              v.guestName ||
                              'Anon'}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-blue-600/20 border border-blue-600/40">
                            {v.type}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-gray-500">まだ投票なし</div>
                  )}
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

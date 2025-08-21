'use client';
import { useState, useTransition } from 'react';

interface Props {
  jokeId: string;
  currentUserId?: string | null;
  jokeUserId?: string | null;
  onVoted?: (payload: { type: VoteType; weight: number }) => void;
  existing?: VoteSummary | null;
}

type VoteType = 'ippon' | 'waza' | 'valid';
interface VoteSummary {
  type: VoteType;
  weight: number;
}

const weightMap: Record<VoteType, number> = { ippon: 3, waza: 2, valid: 1 };

export function VoteButtons({
  jokeId,
  currentUserId,
  jokeUserId,
  onVoted,
  existing,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<VoteSummary | null>(existing || null);
  const [error, setError] = useState<string | null>(null);
  const self = currentUserId && jokeUserId && currentUserId === jokeUserId;

  const act = (type: VoteType) => {
    if (pending || self) return;
    const prev = state;
    const optimistic: VoteSummary = { type, weight: weightMap[type] };
    setState(optimistic);
    setError(null);
    startTransition(async () => {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jokeId, type, userId: currentUserId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Error' }));
        setError(data.error || 'Error');
        setState(prev); // rollback
      } else {
        await res.json(); // ignore content
        onVoted?.({ type, weight: optimistic.weight });
      }
    });
  };

  const btn = (label: string, type: VoteType) => {
    const active = state?.type === type;
    return (
      <button
        disabled={!!pending || !!self}
        onClick={() => act(type)}
        className={`px-2 py-1 rounded text-xs border transition ${
          active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white/5'
        } ${self ? 'opacity-30 cursor-not-allowed' : ''}`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-1">
        {btn('一本', 'ippon')}
        {btn('技あり', 'waza')}
        {btn('有効', 'valid')}
      </div>
      {error && (
        <div
          className="text-[10px] text-red-500 max-w-[140px] truncate"
          title={error}
        >
          {error}
        </div>
      )}
      {self && (
        <div className="text-[10px] text-gray-400">自分の投稿には投票不可</div>
      )}
    </div>
  );
}

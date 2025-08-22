'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../../components/user/UserContext';

interface Props {
  activePrompts: { id: string; title: string }[];
}

export default function JokeNewClient({ activePrompts }: Props) {
  const { currentUser } = useUser();
  const [promptId, setPromptId] = useState(activePrompts[0]?.id || '');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <main className="p-4 max-w-md mx-auto space-y-4">
      <h1 className="text-xl font-bold">ボケ投稿</h1>
      <div className="space-y-2">
        <label className="block text-sm font-medium">お題</label>
        <select
          value={promptId}
          onChange={e => setPromptId(e.target.value)}
          className="w-full border rounded p-2 bg-white/5"
        >
          {activePrompts.map(p => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium">本文 (140文字まで)</label>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          maxLength={140}
          rows={4}
          className="w-full border rounded p-2 bg-white/5"
        />
        <div className="text-xs text-gray-400 text-right">
          {body.length}/140
        </div>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          タグ (カンマ区切り最大5)
        </label>
        <input
          value={tags}
          onChange={e => setTags(e.target.value)}
          className="w-full border rounded p-2 bg-white/5"
          placeholder="AI, 初回"
        />
      </div>
      {error && <div className="text-sm text-red-500">{error}</div>}
      <button
        disabled={pending || !body || !promptId}
        onClick={() => {
          setError(null);
          start(async () => {
            const tagArr = tags
              .split(',')
              .map(t => t.trim())
              .filter(Boolean)
              .slice(0, 5);
            const res = await fetch('/api/jokes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                promptId,
                body,
                userId: currentUser?.id,
                tags: tagArr,
              }),
            });
            if (!res.ok) {
              const d = await res.json().catch(() => ({ error: 'Error' }));
              setError(d.error || 'error');
            } else {
              router.push(`/prompt/${promptId}`);
              router.refresh();
            }
          });
        }}
        className="w-full py-3 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-semibold disabled:opacity-40"
      >
        投稿する
      </button>
    </main>
  );
}

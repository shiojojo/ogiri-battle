'use client';
import { useState, useTransition } from 'react';
import { useUser } from '../../../components/user/UserContext';
import { useRouter } from 'next/navigation';

export default function NewUserClient() {
  const { users, setCurrentUser, refresh, currentUser } = useUser();
  const [name, setName] = useState('');
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const create = () => {
    if (!name.trim()) return;
    setError(null);
    start(async () => {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: name.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'error' }));
        setError(data.error || '作成失敗');
        return;
      }
      const data = await res.json();
      await refresh();
      const created = data.user;
      if (created) setCurrentUser(created);
      setName('');
      router.refresh();
    });
  };

  return (
    <main className="p-4 max-w-sm mx-auto space-y-6">
      <h1 className="text-xl font-bold">ユーザー作成 / 切替</h1>
      <section className="space-y-3">
        <div className="flex gap-2">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="表示名"
            maxLength={24}
            className="flex-1 border rounded px-2 py-2 bg-white/5"
          />
          <button
            onClick={create}
            disabled={pending || !name.trim()}
            className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-semibold disabled:opacity-40"
          >
            {pending ? '作成中' : '作成'}
          </button>
        </div>
        {error && <div className="text-xs text-red-500">{error}</div>}
      </section>
      <section className="space-y-2">
        <h2 className="text-sm font-semibold">既存ユーザー</h2>
        <ul className="space-y-1">
          {users.map(u => (
            <li key={u.id}>
              <button
                onClick={() => setCurrentUser(u)}
                className={`w-full flex justify-between items-center px-3 py-2 rounded border text-left text-sm ${
                  currentUser?.id === u.id
                    ? 'bg-emerald-600/20 border-emerald-500'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <span className="truncate">{u.displayName}</span>
                {currentUser?.id === u.id && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-600 text-white">
                    現在
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

'use client';
import { useState, useTransition } from 'react';
import { Prompt } from '../../../domain/entities';
import { useUser } from '../../../components/user/UserContext';
import { useRouter } from 'next/navigation';

export default function PromptSelect({ prompts }: { prompts: Prompt[] }) {
  const { currentUser } = useUser();
  const router = useRouter();
  const [promptId, setPromptId] = useState<string>(() => prompts[0]?.id || '');
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();
  const selected = prompts.find(p => p.id === promptId);

  const submit = () => {
    if (!promptId || !body.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await fetch('/api/jokes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptId,
          body: body.trim(),
          userId: currentUser?.id,
          tags: [],
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Error' }));
        setError(data.error || '投稿失敗');
      } else {
        const data = await res.json();
        const newId = data?.joke?.id;
        setSuccess(true);
        setBody('');
        if (newId && typeof window !== 'undefined') {
          try {
            sessionStorage.setItem('lastNewJoke', newId);
          } catch {}
        }
        router.push(`/prompt/${promptId}`);
      }
    });
  };

  const singleMode = prompts.length === 1;

  const changePrompt = () => {
    if (singleMode) return;
    if (!prompts.length) return;
    // ランダムで現在と異なるものを選択（最大10回トライ）
    let next = promptId;
    for (let i = 0; i < 10 && next === promptId; i++) {
      next =
        prompts[Math.floor(Math.random() * prompts.length)]?.id || promptId;
    }
    setPromptId(next);
  };
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">本日のお題</div>
            {!singleMode && (
              <button
                type="button"
                onClick={changePrompt}
                className="text-xs px-2 py-1 rounded border bg-white/5 hover:bg-white/10"
              >
                お題を変更
              </button>
            )}
          </div>
          <div className="rounded-xl border p-4 bg-white/5 space-y-2">
            <div className="font-bold leading-snug text-base">
              {selected?.kind === 'image' ? '🖼' : '📝'} {selected?.title}
            </div>
            {selected?.kind === 'image' && selected.imageUrl && (
              <div className="mt-2 rounded-lg border bg-white dark:bg-white p-2 flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selected.imageUrl}
                  alt={selected.title}
                  className="max-h-56 object-contain"
                />
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">ボケを書く</h2>
        <div className="relative">
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            maxLength={140}
            rows={4}
            className="w-full border rounded-xl px-4 py-3 bg-white/5 text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ボケを入力 (140文字まで)"
          />
          <div className="absolute bottom-1 right-2 text-[10px] text-gray-400">
            {body.length}/140
          </div>
        </div>
        {error && (
          <div className="text-sm text-red-500" role="alert">
            {error}
          </div>
        )}
        {success && !error && (
          <div className="text-sm text-green-500">
            投稿しました。リダイレクト中...
          </div>
        )}
        <button
          type="button"
          disabled={pending || !body.trim() || !promptId}
          onClick={submit}
          className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] text-white py-4 text-base font-semibold shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {pending ? '投稿中...' : 'この内容で投稿'}
        </button>
      </section>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { Prompt } from '../../../domain/entities';

export default function PromptSelect({ prompts }: { prompts: Prompt[] }) {
  const [promptId, setPromptId] = useState<string>(() => prompts[0]?.id || '');
  const selected = prompts.find(p => p.id === promptId);
  return (
    <form className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium">お題</label>
        <select
          name="promptId"
          value={promptId}
          onChange={e => setPromptId(e.target.value)}
          className="w-full border rounded px-2 py-2 bg-transparent text-sm"
        >
          {prompts.map(p => (
            <option key={p.id} value={p.id}>
              {p.kind === 'image' ? '🖼' : '📝'} {p.title}
            </option>
          ))}
        </select>
      </div>
      {selected?.kind === 'image' && selected.imageUrl && (
        <div className="bg-white dark:bg-white rounded border p-2 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selected.imageUrl}
            alt={selected.title}
            className="max-h-56 object-contain"
          />
        </div>
      )}
      <div className="space-y-1">
        <label className="text-sm font-medium">本文</label>
        <textarea
          name="body"
          rows={4}
          className="w-full border rounded px-3 py-2 bg-transparent text-sm"
          placeholder="ボケを入力"
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-md bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white py-3 text-sm font-semibold shadow focus:outline-none focus:ring-2 focus:ring-green-400"
      >
        投稿
      </button>
    </form>
  );
}

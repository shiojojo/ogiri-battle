export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { LocalPromptRepository } from '../../../infra/local/repositories';
import { Prompt } from '../../../domain/entities';
import PromptSelect from './prompt-select-client';

export default async function NewJokePage() {
  const promptRepo = new LocalPromptRepository();
  const all = await promptRepo.listAll();
  const active = all.filter(p => p.status === 'active');
  // フォールバック: active が無い場合は指定IDまたは先頭のみで配列化
  const prompts: Prompt[] = active.length
    ? (active as Prompt[])
    : ([
        (all.find(p => p.id === '0653d8c2-e88d-4da6-a5ec-49a330aa6546') ||
          all[0]) as Prompt,
      ] as Prompt[]);
  return (
    <main className="p-4 max-w-sm mx-auto space-y-4">
      <h1 className="text-xl font-bold">ボケ投稿</h1>
      <p className="text-xs text-gray-500">
        「お題を変更」でランダムに入れ替え。
      </p>
      <PromptSelect prompts={prompts} />
    </main>
  );
}

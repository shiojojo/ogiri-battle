import { LocalPromptRepository } from '../../../infra/local/repositories';
import { Prompt } from '../../../domain/entities';
import PromptSelect from './prompt-select-client';

export default async function NewJokePage() {
  const promptRepo = new LocalPromptRepository();
  const prompts = (await promptRepo.listAll()).filter(
    p => p.status === 'active' || p.status === 'closed'
  );
  return (
    <main className="p-4 max-w-sm mx-auto space-y-4">
      <h1 className="text-xl font-bold">ボケ投稿</h1>
      <p className="text-xs text-gray-500">写真お題はプレビューされます。</p>
      <PromptSelect prompts={prompts as Prompt[]} />
    </main>
  );
}

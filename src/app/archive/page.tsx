import { LocalPromptRepository } from '../../infra/local/repositories';

export default async function ArchivePage() {
  const repo = new LocalPromptRepository();
  const prompts = await repo.listAll();
  return (
    <main className="p-4 max-w-lg mx-auto space-y-4">
      <h1 className="text-xl font-bold">過去お題一覧 (仮)</h1>
      <ul className="space-y-2">
        {prompts
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .map(p => (
            <li
              key={p.id}
              className="border rounded p-2 flex items-center justify-between"
            >
              <span className="truncate max-w-[70%]">{p.title}</span>
              <a href={`/prompt/${p.id}`} className="text-blue-500 text-xs">
                見る
              </a>
            </li>
          ))}
      </ul>
    </main>
  );
}

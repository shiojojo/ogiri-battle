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
              className="border rounded p-2 flex items-center justify-between gap-2"
            >
              <span className="truncate max-w-[70%] flex items-center gap-1">
                {p.kind === 'image' && (
                  <div className="w-10 h-10 rounded border bg-white dark:bg-white flex items-center justify-center overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.imageUrl || ''}
                      alt={p.title}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}
                <span>
                  {p.kind === 'image' ? '🖼' : '📝'} {p.title}
                </span>
              </span>
              <a href={`/prompt/${p.id}`} className="text-blue-500 text-xs">
                見る
              </a>
            </li>
          ))}
      </ul>
    </main>
  );
}

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
            <li key={p.id}>
              <a
                href={`/prompt/${p.id}`}
                className="border rounded p-2 flex items-center gap-3 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              >
                {p.kind === 'image' && (
                  <div className="w-12 h-12 rounded border bg-white dark:bg-white flex items-center justify-center overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.imageUrl || ''}
                      alt={p.title}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}
                <span className="truncate font-medium">
                  {p.kind === 'image' ? '🖼' : '📝'} {p.title}
                </span>
              </a>
            </li>
          ))}
      </ul>
    </main>
  );
}

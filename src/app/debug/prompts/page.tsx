import { LocalPromptRepository } from '../../../infra/local/repositories';

export default async function DebugPromptsPage() {
  const repo = new LocalPromptRepository();
  const prompts = await repo.listAll();
  return (
    <main className="p-4 max-w-xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">Debug: Prompts</h1>
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="py-1 pr-2">Title</th>
            <th className="py-1 pr-2">Status</th>
            <th className="py-1">ID</th>
          </tr>
        </thead>
        <tbody>
          {prompts.map(p => (
            <tr key={p.id} className="border-b hover:bg-white/5">
              <td className="py-1 pr-2">
                <a className="text-blue-500" href={`/prompt/${p.id}`}>
                  {p.title}
                </a>
              </td>
              <td className="py-1 pr-2">{p.status}</td>
              <td className="py-1 font-mono break-all text-[10px]">{p.id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

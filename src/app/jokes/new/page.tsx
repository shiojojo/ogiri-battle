import { LocalPromptRepository } from '../../../infra/local/repositories';

export default async function NewJokePage() {
  const promptRepo = new LocalPromptRepository();
  const prompts = (await promptRepo.listAll()).filter(
    // Allow posting to past (closed) prompts too; exclude upcoming.
    p => p.status === 'active' || p.status === 'closed'
  );
  return (
    <main className="p-4 max-w-sm mx-auto space-y-4">
      <h1 className="text-xl font-bold">ボケ投稿</h1>
      <p className="text-xs text-gray-500">
        LINE連携で取り込んだものは別処理 (後で実装)。
      </p>
      <form className="space-y-3">
        <div className="space-y-1">
          <label className="text-sm font-medium">お題</label>
          <select
            name="promptId"
            className="w-full border rounded px-2 py-1 bg-transparent"
          >
            {prompts.map(p => (
              <option key={p.id} value={p.id}>
                {p.kind === 'image' ? '🖼' : '📝'} {p.title}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">本文</label>
          <textarea
            name="body"
            rows={4}
            className="w-full border rounded px-2 py-1 bg-transparent"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded bg-green-600 text-white py-2 text-sm font-semibold"
        >
          投稿
        </button>
      </form>
    </main>
  );
}

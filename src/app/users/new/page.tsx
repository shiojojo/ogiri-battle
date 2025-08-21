export default function NewUserPage() {
  return (
    <main className="p-4 max-w-sm mx-auto space-y-4">
      <h1 className="text-xl font-bold">ユーザー作成</h1>
      <form className="space-y-3">
        <div className="space-y-1">
          <label className="text-sm font-medium">表示名</label>
          <input
            type="text"
            name="displayName"
            className="w-full border rounded px-2 py-1 bg-transparent"
            placeholder="例: 太郎"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">ハンドル (任意)</label>
          <input
            type="text"
            name="handle"
            className="w-full border rounded px-2 py-1 bg-transparent"
            placeholder="@taro"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded bg-blue-600 text-white py-2 text-sm font-semibold"
        >
          作成
        </button>
      </form>
    </main>
  );
}

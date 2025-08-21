export default function AuthPage() {
  return (
    <main className="p-4 max-w-sm mx-auto space-y-4">
      <h1 className="text-xl font-bold">ユーザー切替 / 認証 (仮)</h1>
      <p className="text-sm text-gray-500">後で Supabase Auth を統合予定。</p>
      <ul className="text-sm list-disc pl-4 space-y-1">
        <li>既存ユーザー一覧表示</li>
        <li>選択で現在ユーザー変更</li>
        <li>ゲスト投票時はモーダルで名前入力</li>
      </ul>
    </main>
  );
}

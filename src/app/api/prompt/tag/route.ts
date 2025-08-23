import { NextResponse } from 'next/server';

// このエンドポイントは廃止されました（お題タグ機能削除）

export async function POST() {
  return NextResponse.json({ error: 'Deprecated endpoint' }, { status: 410 });
}

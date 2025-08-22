import { NextRequest, NextResponse } from 'next/server';
import { LocalPromptRepository } from '../../../../infra/local/repositories';

export async function POST(req: NextRequest) {
  try {
    const { promptId, tag } = await req.json();
    if (!promptId || !tag) return NextResponse.json({ error: 'Missing' }, { status: 400 });
    const repo = new LocalPromptRepository();
    const updated = await repo.addTag(promptId, tag.slice(0,20));
    return NextResponse.json({ prompt: updated });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 });
  }
}

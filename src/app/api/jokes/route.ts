import { NextRequest, NextResponse } from 'next/server';
import { LocalJokeRepository, LocalPromptRepository } from '../../../infra/local/repositories';
import { Joke } from '../../../domain/entities';

export async function POST(req: NextRequest) {
  try {
  const { promptId, body, userId, tags } = await req.json();
    if (!promptId || !body) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    const promptRepo = new LocalPromptRepository();
    const prompt = await promptRepo.get(promptId);
    if (!prompt) return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    const repo = new LocalJokeRepository();
    const joke: Joke = await repo.create({ promptId, body: body.slice(0, 140), userId: userId || null, tags: Array.isArray(tags) ? tags.slice(0,5) : [], source: 'app' });
    return NextResponse.json({ joke });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { LocalUserRepository } from '../../../infra/local/repositories';

export async function GET() {
  const repo = new LocalUserRepository();
  const users = await repo.list();
  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  try {
    const { displayName } = await req.json();
    if (!displayName || typeof displayName !== 'string') {
      return NextResponse.json({ error: 'displayName required' }, { status: 400 });
    }
    const repo = new LocalUserRepository();
    const user = await repo.create({ displayName });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: 'create failed' }, { status: 500 });
  }
}

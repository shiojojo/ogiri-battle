import { NextResponse } from 'next/server';
import { LocalUserRepository } from '../../../infra/local/repositories';

export async function GET() {
  const repo = new LocalUserRepository();
  const users = await repo.list();
  return NextResponse.json({ users });
}

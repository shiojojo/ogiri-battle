import { NextRequest, NextResponse } from 'next/server';
import { LocalVoteRepository } from '../../../infra/local/repositories';
import { VoteType } from '../../../domain/entities';

// POST /api/vote  { jokeId, type, userId? , guestName? }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
  const { jokeId, type, userId, guestName } = body as { jokeId?: string; type?: VoteType; userId?: string; guestName?: string };
    if (!jokeId || !type) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  if (!['ippon','waza_ari','yuko'].includes(type)) return NextResponse.json({ error: 'Bad type' }, { status: 400 });
    const voteRepo = new LocalVoteRepository();
    // self vote prevention already handled in upsert; surface nicely
    const vote = await voteRepo.upsert({ jokeId, type: type as VoteType, voterUserId: userId, guestName });
    return NextResponse.json({ vote });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

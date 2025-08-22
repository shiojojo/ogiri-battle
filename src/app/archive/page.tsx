import { LocalPromptRepository, LocalJokeRepository, LocalVoteRepository } from '../../infra/local/repositories';
import ArchiveClient from './Client';

interface Props { searchParams?: { sort?: string } }

export default async function ArchivePage({ searchParams }: Props) {
  const promptRepo = new LocalPromptRepository();
  const jokeRepo = new LocalJokeRepository();
  const voteRepo = new LocalVoteRepository();
  const prompts = await promptRepo.listAll();
  const jokes = await jokeRepo.listAll();
  const votes = await voteRepo.listByJokeIds(jokes.map(j=>j.id));
  const stats = prompts.reduce<Record<string,{jokeCount:number; voteCount:number; score:number}>>((acc,p)=>{
    const pjokes = jokes.filter(j=>j.promptId===p.id);
    const jIds = new Set(pjokes.map(j=>j.id));
    const pvotes = votes.filter(v=> jIds.has(v.jokeId));
    const score = pvotes.reduce((s,v)=>s+v.weight,0);
    acc[p.id] = { jokeCount: pjokes.length, voteCount: pvotes.length, score };
    return acc;
  },{});
  return <ArchiveClient prompts={prompts} stats={stats} initialSort={searchParams?.sort} />;
}

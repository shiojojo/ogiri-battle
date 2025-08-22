import {
  LocalPromptRepository,
  LocalJokeRepository,
  LocalVoteRepository,
} from '../../infra/local/repositories';
import ArchiveClient from './Client';

interface PageProps {
  searchParams?: { sort?: string };
}

export default async function ArchivePage({ searchParams }: PageProps) {
  const promptRepo = new LocalPromptRepository();
  const jokeRepo = new LocalJokeRepository();
  const voteRepo = new LocalVoteRepository();
  const prompts = await promptRepo.listAll();
  const jokes = await jokeRepo.listAll();
  const votes = await voteRepo.listByJokeIds(jokes.map(j => j.id));
  const jokesByPrompt = jokes.reduce<Record<string, string[]>>((acc, j) => {
    (acc[j.promptId] ||= []).push(j.id);
    return acc;
  }, {});
  const votesByJoke = votes.reduce<Record<string, number>>((acc, v) => {
    acc[v.jokeId] = (acc[v.jokeId] || 0) + v.weight;
    return acc;
  }, {});
  const stats = Object.fromEntries(
    prompts.map(p => {
      const js = jokesByPrompt[p.id] || [];
      const voteCount = votes.filter(v => js.includes(v.jokeId)).length;
      const score = js.reduce((s, jid) => s + (votesByJoke[jid] || 0), 0);
      return [p.id, { jokeCount: js.length, voteCount, score }];
    })
  );
  return (
    <ArchiveClient
      prompts={prompts}
      stats={stats}
      initialSort={searchParams?.sort}
    />
  );
}

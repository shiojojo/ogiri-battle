import { LocalPromptRepository } from '../../infra/local/repositories';
import ArchiveClient from './Client';

export default async function ArchivePage() {
  const repo = new LocalPromptRepository();
  const prompts = await repo.listAll();
  return <ArchiveClient prompts={prompts} />;
}

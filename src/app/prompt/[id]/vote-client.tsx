'use client';
import { VoteButtons } from '../../../components/vote/VoteButtons';
import { useUser } from '../../../components/user/UserContext';

export default function Client({
  jokeId,
  jokeUserId,
}: {
  jokeId: string;
  jokeUserId?: string;
}) {
  const { currentUser } = useUser();
  return (
    <VoteButtons
      jokeId={jokeId}
      jokeUserId={jokeUserId}
      currentUserId={currentUser?.id}
    />
  );
}

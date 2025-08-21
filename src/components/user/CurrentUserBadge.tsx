'use client';
import { useUser } from './UserContext';
import Link from 'next/link';

export function CurrentUserBadge() {
  const { currentUser, loading } = useUser();
  return (
    <Link
      href="/auth"
      className="flex items-center gap-2 px-2 py-1 rounded border bg-white/5 text-xs"
    >
      {loading && <span>...</span>}
      {!loading && currentUser && (
        <>
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full" />
          {currentUser.displayName}
        </>
      )}
      {!loading && !currentUser && (
        <span className="text-red-500">No User</span>
      )}
    </Link>
  );
}

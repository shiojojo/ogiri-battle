'use client';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

export interface AppUser {
  id: string;
  displayName: string;
}

interface UserCtx {
  currentUser: AppUser | null;
  users: AppUser[];
  loading: boolean;
  setCurrentUser: (u: AppUser) => void;
  refresh: () => Promise<void>;
}

const Ctx = createContext<UserCtx | undefined>(undefined);
const STORAGE_KEY = 'ogiri_current_user_id';

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [currentUser, setCurrentUserState] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data.users || []);
      const stored = localStorage.getItem(STORAGE_KEY);
      const match =
        data.users.find((u: AppUser) => u.id === stored) ||
        data.users[0] ||
        null;
      setCurrentUserState(match);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setCurrentUser = (u: AppUser) => {
    setCurrentUserState(u);
    localStorage.setItem(STORAGE_KEY, u.id);
  };

  const value: UserCtx = {
    currentUser,
    users,
    loading,
    setCurrentUser,
    refresh: load,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useUser() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('UserContext not found');
  return ctx;
}

import type { User } from 'firebase/auth';

export type AuthMode = 'login' | 'register';

export interface AuthContextType {
  user: User | null;
  authLoading: boolean;
  logout: () => Promise<void>;
}

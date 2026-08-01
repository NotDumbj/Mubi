import { useState } from 'react';
import { login, register, logout, type User } from './AuthModel';
import type { AuthMode } from '../../types';

export type { AuthMode };

export const useAuthViewModel = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'register' : 'login'));
    setError(null);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    setLoading(true);
    setError(null);

    try {
      let authenticatedUser: User;
      if (mode === 'login') {
        authenticatedUser = await login(email, password);
      } else {
        authenticatedUser = await register(email, password);
      }
      setUser(authenticatedUser);
      setPassword('');
      return authenticatedUser;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during authentication.');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    mode,
    setMode,
    loading,
    error,
    user,
    handleSubmit,
    toggleMode,
    logout,
  };
};

export default useAuthViewModel;

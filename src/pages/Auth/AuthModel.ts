import {
  registerUser,
  loginUser,
  logoutUser,
  type User,
} from '../../services/authService';

export type { User };

function validateCredentials(email: string, password: string): string {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error('Email address cannot be empty.');
  }

  if (!password || password.trim() === '') {
    throw new Error('Password cannot be empty.');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  return normalizedEmail;
}

export async function register(email: string, password: string): Promise<User> {
  const normalizedEmail = validateCredentials(email, password);
  return await registerUser(normalizedEmail, password);
}

export async function login(email: string, password: string): Promise<User> {
  const normalizedEmail = validateCredentials(email, password);
  return await loginUser(normalizedEmail, password);
}

export async function logout(): Promise<void> {
  await logoutUser();
}

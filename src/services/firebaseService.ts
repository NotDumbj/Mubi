import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, set, remove, get } from 'firebase/database';
import type { Movie } from '../types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getDatabase(app);

/* ==================== Favourites ==================== */

export async function addFavourite(userId: string, movie: Movie): Promise<void> {
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    throw new Error('User ID is required to add a favourite.');
  }
  if (!movie || !movie.imdbID) {
    throw new Error('Invalid movie object or missing imdbID.');
  }
  try {
    const favouriteRef = ref(db, `users/${userId}/favourites/${movie.imdbID}`);
    await set(favouriteRef, movie);
  } catch (error) {
    throw new Error(`Failed to add favourite movie: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function removeFavourite(userId: string, imdbID: string): Promise<void> {
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    throw new Error('User ID is required to remove a favourite.');
  }
  if (!imdbID) {
    throw new Error('Invalid or missing imdbID.');
  }
  try {
    const favouriteRef = ref(db, `users/${userId}/favourites/${imdbID}`);
    await remove(favouriteRef);
  } catch (error) {
    throw new Error(`Failed to remove favourite movie: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function getFavourites(userId: string): Promise<Movie[]> {
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    throw new Error('User ID is required to fetch favourites.');
  }
  try {
    const favouritesRef = ref(db, `users/${userId}/favourites`);
    const snapshot = await get(favouritesRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.values(data) as Movie[];
    }
    return [];
  } catch (error) {
    throw new Error(`Failed to fetch favourite movies: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/* ==================== Watch Later ==================== */

export async function addWatchLater(userId: string, movie: Movie): Promise<void> {
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    throw new Error('User ID is required to add to Watch Later.');
  }
  if (!movie || !movie.imdbID) {
    throw new Error('Invalid movie object or missing imdbID.');
  }
  try {
    const watchLaterRef = ref(db, `users/${userId}/watchLater/${movie.imdbID}`);
    await set(watchLaterRef, movie);
  } catch (error) {
    throw new Error(`Failed to add movie to Watch Later: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function removeWatchLater(userId: string, imdbID: string): Promise<void> {
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    throw new Error('User ID is required to remove from Watch Later.');
  }
  if (!imdbID) {
    throw new Error('Invalid or missing imdbID.');
  }
  try {
    const watchLaterRef = ref(db, `users/${userId}/watchLater/${imdbID}`);
    await remove(watchLaterRef);
  } catch (error) {
    throw new Error(`Failed to remove movie from Watch Later: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function getWatchLater(userId: string): Promise<Movie[]> {
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    throw new Error('User ID is required to fetch Watch Later.');
  }
  try {
    const watchLaterRef = ref(db, `users/${userId}/watchLater`);
    const snapshot = await get(watchLaterRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.values(data) as Movie[];
    }
    return [];
  } catch (error) {
    throw new Error(`Failed to fetch Watch Later movies: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/* ==================== Watched ==================== */

export async function addWatched(userId: string, movie: Movie): Promise<void> {
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    throw new Error('User ID is required to mark movie as Watched.');
  }
  if (!movie || !movie.imdbID) {
    throw new Error('Invalid movie object or missing imdbID.');
  }
  try {
    const watchedRef = ref(db, `users/${userId}/watched/${movie.imdbID}`);
    await set(watchedRef, movie);
  } catch (error) {
    throw new Error(`Failed to mark movie as watched: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function removeWatched(userId: string, imdbID: string): Promise<void> {
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    throw new Error('User ID is required to unmark Watched.');
  }
  if (!imdbID) {
    throw new Error('Invalid or missing imdbID.');
  }
  try {
    const watchedRef = ref(db, `users/${userId}/watched/${imdbID}`);
    await remove(watchedRef);
  } catch (error) {
    throw new Error(`Failed to unmark movie as watched: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function getWatched(userId: string): Promise<Movie[]> {
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    throw new Error('User ID is required to fetch Watched list.');
  }
  try {
    const watchedRef = ref(db, `users/${userId}/watched`);
    const snapshot = await get(watchedRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.values(data) as Movie[];
    }
    return [];
  } catch (error) {
    throw new Error(`Failed to fetch Watched movies: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export default db;

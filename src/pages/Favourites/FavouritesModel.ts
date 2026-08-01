import {
  getFavourites,
  addFavourite,
  removeFavourite,
  getWatchLater,
  addWatchLater,
  removeWatchLater,
  getWatched,
  addWatched,
  removeWatched,
} from '../../services/firebaseService';
import type { Movie } from '../../types';

export type { Movie };

/* Favourites */
export async function loadFavourites(userId: string): Promise<Movie[]> {
  return await getFavourites(userId);
}

export async function saveFavourite(userId: string, movie: Movie): Promise<void> {
  await addFavourite(userId, movie);
}

export async function deleteFavourite(userId: string, imdbID: string): Promise<void> {
  await removeFavourite(userId, imdbID);
}

/* Watch Later */
export async function loadWatchLater(userId: string): Promise<Movie[]> {
  return await getWatchLater(userId);
}

export async function saveWatchLater(userId: string, movie: Movie): Promise<void> {
  await addWatchLater(userId, movie);
}

export async function deleteWatchLater(userId: string, imdbID: string): Promise<void> {
  await removeWatchLater(userId, imdbID);
}

/* Watched */
export async function loadWatched(userId: string): Promise<Movie[]> {
  return await getWatched(userId);
}

export async function saveWatched(userId: string, movie: Movie): Promise<void> {
  await addWatched(userId, movie);
}

export async function deleteWatched(userId: string, imdbID: string): Promise<void> {
  await removeWatched(userId, imdbID);
}

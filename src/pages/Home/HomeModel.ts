import { searchMovies } from '../../services/omdbMovieService';
import {
  addFavourite,
  removeFavourite,
  getFavourites,
  addWatchLater,
  removeWatchLater,
  getWatchLater,
  addWatched,
  removeWatched,
  getWatched,
} from '../../services/firebaseService';
import type { Movie } from '../../types';

export type { Movie };

const SEED_KEYWORDS = [
  'Batman',
  'Avengers',
  'Harry Potter',
  'Star Wars',
  'Spider-Man',
  'Marvel',
  'Disney',
  'Matrix',
  'Lord of the Rings',
  'Fast',
  'Mission Impossible',
  'Pixar',
  'Horror',
  'Comedy',
  'Action'
];

export async function getMovies(query: string): Promise<Movie[]> {
  const cleanedQuery = query.trim();

  if (cleanedQuery.length < 2) {
    throw new Error('Search query must be at least 2 characters long.');
  }

  return await searchMovies(cleanedQuery);
}

export async function initialMovies(): Promise<Movie[]> {
  const shuffledKeywords = [...SEED_KEYWORDS].sort(() => Math.random() - 0.5);
  const selectedKeywords = shuffledKeywords.slice(0, 3);

  const results = await Promise.all(
    selectedKeywords.map(async (keyword) => {
      try {
        return await searchMovies(keyword);
      } catch {
        return [];
      }
    })
  );

  const mergedMovies = results.flat();

  const uniqueMoviesMap = new Map<string, Movie>();
  for (const movie of mergedMovies) {
    if (movie.imdbID && !uniqueMoviesMap.has(movie.imdbID)) {
      uniqueMoviesMap.set(movie.imdbID, movie);
    }
  }

  const uniqueMoviesArray = Array.from(uniqueMoviesMap.values());
  const finalShuffled = uniqueMoviesArray.sort(() => Math.random() - 0.5);

  return finalShuffled.slice(0, 20);
}

/* Favourites */
export async function addMovieToFavourites(userId: string, movie: Movie): Promise<void> {
  await addFavourite(userId, movie);
}

export async function removeMovieFromFavourites(userId: string, imdbID: string): Promise<void> {
  await removeFavourite(userId, imdbID);
}

export async function fetchFavouriteIds(userId: string): Promise<string[]> {
  if (!userId) return [];
  const favourites = await getFavourites(userId);
  return favourites.map((m) => m.imdbID);
}

/* Watch Later */
export async function addMovieToWatchLater(userId: string, movie: Movie): Promise<void> {
  await addWatchLater(userId, movie);
}

export async function removeMovieFromWatchLater(userId: string, imdbID: string): Promise<void> {
  await removeWatchLater(userId, imdbID);
}

export async function fetchWatchLaterIds(userId: string): Promise<string[]> {
  if (!userId) return [];
  const items = await getWatchLater(userId);
  return items.map((m) => m.imdbID);
}

export async function fetchWatchLaterMovies(userId: string): Promise<Movie[]> {
  if (!userId) return [];
  return await getWatchLater(userId);
}

/* Watched */
export async function addMovieToWatched(userId: string, movie: Movie): Promise<void> {
  await addWatched(userId, movie);
}

export async function removeMovieFromWatched(userId: string, imdbID: string): Promise<void> {
  await removeWatched(userId, imdbID);
}

export async function fetchWatchedIds(userId: string): Promise<string[]> {
  if (!userId) return [];
  const items = await getWatched(userId);
  return items.map((m) => m.imdbID);
}

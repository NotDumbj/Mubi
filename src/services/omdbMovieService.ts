import type { Movie, MovieDetails } from '../types';

export type { Movie, MovieDetails };

export interface OmdbSearchResponse {
  Search?: Movie[];
  totalResults?: string;
  Response: 'True' | 'False';
  Error?: string;
}

const API_URL = import.meta.env.VITE_API_URL || import.meta.env.API_URL || 'https://www.omdbapi.com/';

function getApiKey(): string {
  const apiKey = import.meta.env.VITE_OMDB_API_KEY || import.meta.env.VITE_OMBD_API_KEY;
  if (!apiKey) {
    console.error('[OMDb Service] API Key missing');
    throw new Error('OMDb API key is missing. Please set VITE_OMDB_API_KEY in your .env file.');
  }
  return apiKey;
}

export async function searchMovies(query: string): Promise<Movie[]> {
  console.log(`[OMDb Service] Initiating search for query: "${query}"`);
  const apiKey = getApiKey();

  const encodedQuery = encodeURIComponent(query);
  const requestUrl = `${API_URL}?apikey=${apiKey}&s=${encodedQuery}`;
  console.log(`[OMDb Service] Fetching request for: "${query}"`);

  const response = await fetch(requestUrl);

  if (!response.ok) {
    console.error(`[OMDb Service] HTTP Error: ${response.status} ${response.statusText}`);
    throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
  }

  const data: OmdbSearchResponse = await response.json();

  if (data.Response === 'False') {
    console.warn(`[OMDb Service] OMDb API returned Error: ${data.Error}`);
    throw new Error(data.Error || 'Failed to fetch movies from OMDb API.');
  }

  return data.Search || [];
}

export async function getMovieDetails(imdbID: string): Promise<MovieDetails> {
  console.log(`[OMDb Service] Fetching details for imdbID: "${imdbID}"`);
  const apiKey = getApiKey();

  const requestUrl = `${API_URL}?apikey=${apiKey}&i=${encodeURIComponent(imdbID)}&plot=full`;
  const response = await fetch(requestUrl);

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
  }

  const data: MovieDetails & { Response: string; Error?: string } = await response.json();

  if (data.Response === 'False') {
    throw new Error(data.Error || 'Failed to fetch movie details.');
  }

  return data;
}

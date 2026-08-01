import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  loadFavourites,
  deleteFavourite,
  saveFavourite,
  loadWatchLater,
  deleteWatchLater,
  saveWatchLater,
  loadWatched,
  deleteWatched,
  saveWatched,
  type Movie,
} from './FavouritesModel';

export type LibraryTab = 'favourites' | 'watchLater' | 'watched';

export const useFavouritesViewModel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<LibraryTab>('favourites');

  const [favourites, setFavourites] = useState<Movie[]>([]);
  const [watchLater, setWatchLater] = useState<Movie[]>([]);
  const [watched, setWatched] = useState<Movie[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadAllLists = useCallback(async () => {
    if (!user) {
      setFavourites([]);
      setWatchLater([]);
      setWatched([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [favData, watchLaterData, watchedData] = await Promise.all([
        loadFavourites(user.uid),
        loadWatchLater(user.uid),
        loadWatched(user.uid),
      ]);
      setFavourites(favData);
      setWatchLater(watchLaterData);
      setWatched(watchedData);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load library content.');
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  /* Toggle Favourites */
  const toggleFavourite = async (movie: Movie) => {
    if (!user) return;
    const isFav = favourites.some((m) => m.imdbID === movie.imdbID);

    setFavourites((prev) =>
      isFav ? prev.filter((m) => m.imdbID !== movie.imdbID) : [...prev, movie]
    );

    try {
      if (isFav) {
        await deleteFavourite(user.uid, movie.imdbID);
      } else {
        await saveFavourite(user.uid, movie);
      }
    } catch (err) {
      loadAllLists();
    }
  };

  /* Toggle Watch Later */
  const toggleWatchLater = async (movie: Movie) => {
    if (!user) return;
    const isSaved = watchLater.some((m) => m.imdbID === movie.imdbID);

    setWatchLater((prev) =>
      isSaved ? prev.filter((m) => m.imdbID !== movie.imdbID) : [...prev, movie]
    );

    try {
      if (isSaved) {
        await deleteWatchLater(user.uid, movie.imdbID);
      } else {
        await saveWatchLater(user.uid, movie);
      }
    } catch (err) {
      loadAllLists();
    }
  };

  /* Toggle Watched */
  const toggleWatched = async (movie: Movie) => {
    if (!user) return;
    const isSaved = watched.some((m) => m.imdbID === movie.imdbID);

    setWatched((prev) =>
      isSaved ? prev.filter((m) => m.imdbID !== movie.imdbID) : [...prev, movie]
    );

    try {
      if (isSaved) {
        await deleteWatched(user.uid, movie.imdbID);
      } else {
        await saveWatched(user.uid, movie);
      }
    } catch (err) {
      loadAllLists();
    }
  };

  useEffect(() => {
    loadAllLists();
  }, [loadAllLists]);

  const favouriteIds = new Set(favourites.map((m) => m.imdbID));
  const watchLaterIds = new Set(watchLater.map((m) => m.imdbID));
  const watchedIds = new Set(watched.map((m) => m.imdbID));

  const activeMovies =
    activeTab === 'favourites'
      ? favourites
      : activeTab === 'watchLater'
      ? watchLater
      : watched;

  return {
    activeTab,
    setActiveTab,
    favourites,
    watchLater,
    watched,
    activeMovies,
    favouriteIds,
    watchLaterIds,
    watchedIds,
    loading,
    error,
    loadAllLists,
    toggleFavourite,
    toggleWatchLater,
    toggleWatched,
  };
};

export default useFavouritesViewModel;

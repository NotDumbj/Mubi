import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getMovies,
  initialMovies,
  addMovieToFavourites,
  removeMovieFromFavourites,
  fetchFavouriteIds,
  addMovieToWatchLater,
  removeMovieFromWatchLater,
  fetchWatchLaterIds,
  fetchWatchLaterMovies,
  addMovieToWatched,
  removeMovieFromWatched,
  fetchWatchedIds,
  type Movie,
} from './HomeModel';
import type { CategoryOption } from '../../components/CategoryFilter/CategoryFilterBar';

export const useHomeViewModel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [movies, setMovies] = useState<Movie[]>([]);

  const [favouriteIds, setFavouriteIds] = useState<Set<string>>(new Set());
  const [watchLaterIds, setWatchLaterIds] = useState<Set<string>>(new Set());
  const [watchedIds, setWatchedIds] = useState<Set<string>>(new Set());
  const [watchLaterList, setWatchLaterList] = useState<Movie[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUserCollections = useCallback(async () => {
    if (!user) {
      setFavouriteIds(new Set());
      setWatchLaterIds(new Set());
      setWatchedIds(new Set());
      setWatchLaterList([]);
      return;
    }
    try {
      const [favs, watchLaters, watcheds, watchLaterMovies] = await Promise.all([
        fetchFavouriteIds(user.uid),
        fetchWatchLaterIds(user.uid),
        fetchWatchedIds(user.uid),
        fetchWatchLaterMovies(user.uid),
      ]);
      setFavouriteIds(new Set(favs));
      setWatchLaterIds(new Set(watchLaters));
      setWatchedIds(new Set(watcheds));
      setWatchLaterList(watchLaterMovies);
    } catch {
      // Ignore background fetch errors quietly
    }
  }, [user]);

  const resetHome = useCallback(async () => {
    setQuery('');
    setActiveCategory('all');
    setLoading(true);
    setError(null);

    initialMovies()
      .then((initial) => {
        setMovies(initial);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load movies.');
        setLoading(false);
      });

    refreshUserCollections();
  }, [refreshUserCollections]);

  useEffect(() => {
    let isMounted = true;

    setLoading(true);
    setError(null);

    initialMovies()
      .then((initial) => {
        if (isMounted) {
          setMovies(initial);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load initial movies.');
          setLoading(false);
        }
      });

    refreshUserCollections();

    return () => {
      isMounted = false;
    };
  }, [refreshUserCollections]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setActiveCategory('all');
    setLoading(true);
    setError(null);

    try {
      const result = await getMovies(query);
      setMovies(result);
      refreshUserCollections();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCategory = async (category: CategoryOption) => {
    setActiveCategory(category.id);
    setQuery('');
    setLoading(true);
    setError(null);

    try {
      if (category.id === 'all' || !category.searchKeyword) {
        const initial = await initialMovies();
        setMovies(initial);
      } else {
        const result = await getMovies(category.searchKeyword);
        setMovies(result);
      }
      refreshUserCollections();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch movies for selected category.');
      }
    } finally {
      setLoading(false);
    }
  };

  /* Toggle Favourites */
  const toggleFavourite = async (movie: Movie) => {
    if (!user) {
      navigate('/favourites');
      return;
    }

    const isFav = favouriteIds.has(movie.imdbID);

    setFavouriteIds((prev) => {
      const next = new Set(prev);
      if (isFav) {
        next.delete(movie.imdbID);
      } else {
        next.add(movie.imdbID);
      }
      return next;
    });

    try {
      if (isFav) {
        await removeMovieFromFavourites(user.uid, movie.imdbID);
      } else {
        await addMovieToFavourites(user.uid, movie);
      }
    } catch (err) {
      setFavouriteIds((prev) => {
        const next = new Set(prev);
        if (isFav) {
          next.add(movie.imdbID);
        } else {
          next.delete(movie.imdbID);
        }
        return next;
      });
    }
  };

  /* Toggle Watch Later */
  const toggleWatchLater = async (movie: Movie) => {
    if (!user) {
      navigate('/favourites');
      return;
    }

    const isSaved = watchLaterIds.has(movie.imdbID);

    setWatchLaterIds((prev) => {
      const next = new Set(prev);
      if (isSaved) {
        next.delete(movie.imdbID);
      } else {
        next.add(movie.imdbID);
      }
      return next;
    });

    setWatchLaterList((prev) =>
      isSaved ? prev.filter((m) => m.imdbID !== movie.imdbID) : [...prev, movie]
    );

    try {
      if (isSaved) {
        await removeMovieFromWatchLater(user.uid, movie.imdbID);
      } else {
        await addMovieToWatchLater(user.uid, movie);
      }
    } catch (err) {
      refreshUserCollections();
    }
  };

  /* Toggle Watched */
  const toggleWatched = async (movie: Movie) => {
    if (!user) {
      navigate('/favourites');
      return;
    }

    const isSaved = watchedIds.has(movie.imdbID);

    setWatchedIds((prev) => {
      const next = new Set(prev);
      if (isSaved) {
        next.delete(movie.imdbID);
      } else {
        next.add(movie.imdbID);
      }
      return next;
    });

    try {
      if (isSaved) {
        await removeMovieFromWatched(user.uid, movie.imdbID);
      } else {
        await addMovieToWatched(user.uid, movie);
      }
    } catch (err) {
      refreshUserCollections();
    }
  };

  return {
    query,
    setQuery,
    activeCategory,
    movies,
    favouriteIds,
    watchLaterIds,
    watchedIds,
    watchLaterList,
    loading,
    error,
    handleSearch,
    handleSelectCategory,
    resetHome,
    toggleFavourite,
    toggleWatchLater,
    toggleWatched,
    refreshUserCollections,
  };
};

export default useHomeViewModel;

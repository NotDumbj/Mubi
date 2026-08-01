import React, { useState } from 'react';
import { Sparkles, Film, AlertTriangle, RefreshCw } from 'lucide-react';
import { useHomeViewModel } from './useHomeViewModel';
import { useLanguage } from '../../context/LanguageContext';
import MovieCard from '../../components/MovieCard/MovieCard';
import MovieDetailsModal from '../../components/MovieDetailsModal/MovieDetailsModal';
import CategoryFilterBar from '../../components/CategoryFilter/CategoryFilterBar';
import type { Movie } from '../../types';
import './HomeView.css';

interface HomeViewProps {
  viewModel?: ReturnType<typeof useHomeViewModel>;
}

export const HomeView: React.FC<HomeViewProps> = ({ viewModel: externalViewModel }) => {
  const internalViewModel = useHomeViewModel();
  const {
    movies,
    favouriteIds,
    watchLaterIds,
    watchedIds,
    loading,
    error,
    toggleFavourite,
    toggleWatchLater,
    toggleWatched,
    resetHome,
    query,
    activeCategory,
    handleSelectCategory,
  } = externalViewModel || internalViewModel;
  const { t } = useLanguage();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  return (
    <main className="home-container">
      {/* Kokonut UI Inspired Hero Section with Korean Brand Mark */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles className="hero-badge-icon" />
            <span>{t('brandBadge')}</span>
          </div>

          <h1 className="hero-title">
            {t('heroTitlePart1')}<span className="gradient-text">{t('heroTitlePart2')}</span>{t('heroTitlePart3')}
          </h1>
          <p className="hero-subtitle">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Kokonut UI Liquid Glass Category & Genre Filter Bar */}
      <CategoryFilterBar
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
      />

      {/* Grid Header & Results Counter */}
      <div className="section-header">
        <h2 className="section-title">
          <Film className="section-title-icon" />
          {query ? `${t('searchResults')} "${query}"` : t('recommendedMovies')}
        </h2>
        {!loading && movies.length > 0 && (
          <span className="results-count">{movies.length} {t('titlesFound')}</span>
        )}
      </div>

      {/* Skeleton Loading State */}
      {loading && (
        <div className="movie-list">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="movie-card-skeleton">
              <div className="skeleton poster-skeleton" />
              <div className="skeleton-info">
                <div className="skeleton title-skeleton" />
                <div className="skeleton meta-skeleton" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="error-state-card">
          <AlertTriangle className="error-icon" />
          <div className="error-content">
            <h3>{t('errorLoadingMovies')}</h3>
            <p>{error}</p>
          </div>
          <button type="button" className="retry-button" onClick={resetHome}>
            <RefreshCw className="btn-icon" />
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && movies.length === 0 && (
        <div className="empty-state-card">
          <div className="empty-icon-wrapper">
            <Film className="empty-icon" />
          </div>
          <h3>{t('noMoviesFound')}</h3>
          <p>{t('noMoviesFound')}</p>
          <button type="button" className="reset-button" onClick={resetHome}>
            <RefreshCw className="btn-icon" />
            Reset Recommendations
          </button>
        </div>
      )}

      {/* Movie Grid */}
      {!loading && !error && movies.length > 0 && (
        <div className="movie-list">
          {movies.map((movie) => (
            <MovieCard
              key={movie.imdbID}
              movie={movie}
              isFavourite={favouriteIds.has(movie.imdbID)}
              onFavouriteClick={toggleFavourite}
              isWatchLater={watchLaterIds.has(movie.imdbID)}
              onWatchLaterClick={toggleWatchLater}
              isWatched={watchedIds.has(movie.imdbID)}
              onWatchedClick={toggleWatched}
              onSelectMovie={(m) => setSelectedMovie(m)}
            />
          ))}
        </div>
      )}

      {/* Movie Details Modal */}
      <MovieDetailsModal
        movie={selectedMovie}
        isOpen={!!selectedMovie}
        onClose={() => setSelectedMovie(null)}
        isFavourite={selectedMovie ? favouriteIds.has(selectedMovie.imdbID) : false}
        onFavouriteClick={toggleFavourite}
        isWatchLater={selectedMovie ? watchLaterIds.has(selectedMovie.imdbID) : false}
        onWatchLaterClick={toggleWatchLater}
        isWatched={selectedMovie ? watchedIds.has(selectedMovie.imdbID) : false}
        onWatchedClick={toggleWatched}
      />
    </main>
  );
};

export default HomeView;

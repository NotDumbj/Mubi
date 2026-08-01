import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, AlertTriangle, ArrowRight, Bookmark, CheckCircle, Library } from 'lucide-react';
import { useFavouritesViewModel } from './useFavouritesViewModel';
import { useLanguage } from '../../context/LanguageContext';
import MovieCard from '../../components/MovieCard/MovieCard';
import MovieDetailsModal from '../../components/MovieDetailsModal/MovieDetailsModal';
import LiquidGlassButton from '../../components/LiquidGlass/LiquidGlassButton';
import type { Movie } from '../../types';
import './FavouritesView.css';

interface FavouritesViewProps {
  viewModel?: ReturnType<typeof useFavouritesViewModel>;
}

export const FavouritesView: React.FC<FavouritesViewProps> = ({ viewModel: externalViewModel }) => {
  const internalViewModel = useFavouritesViewModel();
  const {
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
    toggleFavourite,
    toggleWatchLater,
    toggleWatched,
  } = externalViewModel || internalViewModel;
  const { t } = useLanguage();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const getEmptyStateContent = () => {
    switch (activeTab) {
      case 'favourites':
        return {
          title: t('emptyFavTitle'),
          subtitle: t('emptyFavSubtitle'),
        };
      case 'watchLater':
        return {
          title: t('emptyWatchLaterTitle'),
          subtitle: t('emptyWatchLaterSubtitle'),
        };
      case 'watched':
        return {
          title: t('emptyWatchedTitle'),
          subtitle: t('emptyWatchedSubtitle'),
        };
    }
  };

  const emptyContent = getEmptyStateContent();

  return (
    <main className="favourites-container">
      {/* Header Banner */}
      <section className="fav-hero-section">
        <div className="fav-hero-content">
          <div className="fav-icon-badge">
            <Library className="fav-badge-icon" />
          </div>
          <div>
            <h1 className="favourites-title">{t('favHeroTitle')}</h1>
            <p className="favourites-subtitle">
              {t('favHeroSubtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Library Tabs Bar */}
      <div className="library-tabs-bar">
        <LiquidGlassButton
          isActive={activeTab === 'favourites'}
          onClick={() => setActiveTab('favourites')}
        >
          <Heart className={`tab-icon ${activeTab === 'favourites' ? 'active-fav' : ''}`} />
          <span>{t('tabFavourites')}</span>
          <span className="tab-badge">{favourites.length}</span>
        </LiquidGlassButton>

        <LiquidGlassButton
          isActive={activeTab === 'watchLater'}
          onClick={() => setActiveTab('watchLater')}
        >
          <Bookmark className={`tab-icon ${activeTab === 'watchLater' ? 'active-bookmark' : ''}`} />
          <span>{t('tabWatchLater')}</span>
          <span className="tab-badge">{watchLater.length}</span>
        </LiquidGlassButton>

        <LiquidGlassButton
          isActive={activeTab === 'watched'}
          onClick={() => setActiveTab('watched')}
        >
          <CheckCircle className={`tab-icon ${activeTab === 'watched' ? 'active-check' : ''}`} />
          <span>{t('tabWatched')}</span>
          <span className="tab-badge">{watched.length}</span>
        </LiquidGlassButton>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="favourites-grid">
          {Array.from({ length: 6 }).map((_, index) => (
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
        <div className="fav-error-card">
          <AlertTriangle className="error-icon" />
          <p>{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && activeMovies.length === 0 && (
        <div className="fav-empty-card">
          <div className="sparkle-icon-wrapper">
            <Sparkles className="sparkle-empty-icon" />
          </div>
          <h2>{emptyContent.title}</h2>
          <p>{emptyContent.subtitle}</p>
          <Link to="/" className="explore-btn">
            <span>{t('exploreMoviesBtn')}</span>
            <ArrowRight className="btn-arrow" />
          </Link>
        </div>
      )}

      {/* Movies Grid */}
      {!loading && !error && activeMovies.length > 0 && (
        <div className="favourites-grid">
          {activeMovies.map((movie) => (
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

export default FavouritesView;

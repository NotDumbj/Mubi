import React, { useEffect, useState } from 'react';
import { X, Star, Heart, Clock, Award, Users, Film, Loader2, Sparkles, DollarSign, Bookmark, CheckCircle } from 'lucide-react';
import type { Movie, MovieDetails } from '../../types';
import { getMovieDetails } from '../../services/omdbMovieService';
import { useLanguage } from '../../context/LanguageContext';
import './MovieDetailsModal.css';

interface MovieDetailsModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
  isFavourite?: boolean;
  onFavouriteClick?: (movie: Movie) => void;
  isWatchLater?: boolean;
  onWatchLaterClick?: (movie: Movie) => void;
  isWatched?: boolean;
  onWatchedClick?: (movie: Movie) => void;
}

export const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({
  movie,
  isOpen,
  onClose,
  isFavourite = false,
  onFavouriteClick,
  isWatchLater = false,
  onWatchLaterClick,
  isWatched = false,
  onWatchedClick,
}) => {
  const { t } = useLanguage();
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!movie || !isOpen) {
      setDetails(null);
      setError(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    getMovieDetails(movie.imdbID)
      .then((data) => {
        if (isMounted) {
          setDetails(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to load details:', err);
          setError(err.message || 'Failed to load movie details');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [movie, isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !movie) return null;

  const genres = details?.Genre ? details.Genre.split(', ') : [];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button type="button" className="modal-close-btn" onClick={onClose} title={t('modalClose')}>
          <X className="close-icon" />
        </button>

        {/* Loading Spinner */}
        {loading && (
          <div className="modal-loading-state">
            <Loader2 className="modal-spinner" />
            <p>{t('loadingDetails')}</p>
          </div>
        )}

        {/* Error Fallback */}
        {!loading && error && (
          <div className="modal-error-state">
            <p>{error}</p>
          </div>
        )}

        {/* Modal Main Content */}
        {!loading && (
          <div className="modal-body">
            {/* Poster & Action Column */}
            <div className="modal-poster-col">
              <div className="modal-poster-wrapper">
                <img
                  src={
                    movie.Poster && movie.Poster !== 'N/A'
                      ? movie.Poster
                      : 'https://via.placeholder.com/300x450?text=No+Poster'
                  }
                  alt={movie.Title}
                  className="modal-poster"
                />
                <div className="poster-overlay-glow" />
              </div>

              {/* Action Buttons Stack */}
              <div className="modal-actions-stack">
                {onFavouriteClick && (
                  <button
                    type="button"
                    className={`modal-action-btn fav ${isFavourite ? 'is-fav' : ''}`}
                    onClick={() => onFavouriteClick(movie)}
                  >
                    <Heart className={`modal-action-icon ${isFavourite ? 'filled' : ''}`} />
                    <span>{isFavourite ? t('removeFromFavourites') : t('addToFavourites')}</span>
                  </button>
                )}

                {onWatchLaterClick && (
                  <button
                    type="button"
                    className={`modal-action-btn watch-later ${isWatchLater ? 'is-active' : ''}`}
                    onClick={() => onWatchLaterClick(movie)}
                  >
                    <Bookmark className={`modal-action-icon ${isWatchLater ? 'filled' : ''}`} />
                    <span>{isWatchLater ? t('removeFromWatchLater') : t('addToWatchLater')}</span>
                  </button>
                )}

                {onWatchedClick && (
                  <button
                    type="button"
                    className={`modal-action-btn watched ${isWatched ? 'is-active' : ''}`}
                    onClick={() => onWatchedClick(movie)}
                  >
                    <CheckCircle className={`modal-action-icon ${isWatched ? 'filled' : ''}`} />
                    <span>{isWatched ? t('unmarkWatched') : t('markAsWatched')}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Info Column */}
            <div className="modal-info-col">
              {/* Badge row */}
              <div className="modal-badges-row">
                <span className="modal-type-badge">
                  <Film className="badge-icon" />
                  {movie.Type === 'series' ? t('seriesType') : t('movieType')}
                </span>
                {details?.Rated && details.Rated !== 'N/A' && (
                  <span className="modal-rated-badge">{details.Rated}</span>
                )}
                {details?.Runtime && details.Runtime !== 'N/A' && (
                  <span className="modal-runtime-badge">
                    <Clock className="badge-icon" />
                    {details.Runtime}
                  </span>
                )}
              </div>

              {/* Title & Year */}
              <h2 className="modal-title">
                {movie.Title} <span className="modal-year">({movie.Year})</span>
              </h2>

              {/* Genres */}
              {genres.length > 0 && (
                <div className="modal-genres">
                  {genres.map((genre, i) => (
                    <span key={i} className="genre-pill">
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {/* Scores Row */}
              <div className="modal-scores-row">
                {details?.imdbRating && details.imdbRating !== 'N/A' && (
                  <div className="score-card imdb">
                    <Star className="score-star-icon" />
                    <div className="score-text">
                      <span className="score-val">{details.imdbRating}</span>
                      <span className="score-max">/10 IMDb</span>
                    </div>
                  </div>
                )}

                {details?.Metascore && details.Metascore !== 'N/A' && (
                  <div className="score-card metascore">
                    <Sparkles className="score-meta-icon" />
                    <div className="score-text">
                      <span className="score-val">{details.Metascore}</span>
                      <span className="score-max">Metascore</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Synopsis */}
              <div className="modal-section">
                <h4 className="section-label">{t('modalPlot')}</h4>
                <p className="modal-plot">
                  {details?.Plot && details.Plot !== 'N/A'
                    ? details.Plot
                    : 'No synopsis available for this title.'}
                </p>
              </div>

              {/* Cast & Crew Grid */}
              <div className="modal-crew-grid">
                {details?.Director && details.Director !== 'N/A' && (
                  <div className="crew-item">
                    <span className="crew-label">{t('modalDirector')}</span>
                    <span className="crew-val">{details.Director}</span>
                  </div>
                )}

                {details?.Writer && details.Writer !== 'N/A' && (
                  <div className="crew-item">
                    <span className="crew-label">{t('modalWriter')}</span>
                    <span className="crew-val">{details.Writer}</span>
                  </div>
                )}

                {details?.Actors && details.Actors !== 'N/A' && (
                  <div className="crew-item full-width">
                    <span className="crew-label">
                      <Users className="inline-icon" />
                      {t('modalCast')}
                    </span>
                    <span className="crew-val">{details.Actors}</span>
                  </div>
                )}

                {details?.Awards && details.Awards !== 'N/A' && (
                  <div className="crew-item full-width">
                    <span className="crew-label">
                      <Award className="inline-icon" />
                      {t('modalAwards')}
                    </span>
                    <span className="crew-val awards-val">{details.Awards}</span>
                  </div>
                )}

                {details?.BoxOffice && details.BoxOffice !== 'N/A' && (
                  <div className="crew-item">
                    <span className="crew-label">
                      <DollarSign className="inline-icon" />
                      {t('modalBoxOffice')}
                    </span>
                    <span className="crew-val">{details.BoxOffice}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetailsModal;

import React, { useState } from 'react';
import { Heart, Trash2, Calendar, Film, Tv, Info, Bookmark, CheckCircle } from 'lucide-react';
import type { Movie } from '../../types';
import './MovieCard.css';

interface MovieCardProps {
  movie: Movie;
  isFavourite?: boolean;
  onFavouriteClick?: (movie: Movie) => void;
  isWatchLater?: boolean;
  onWatchLaterClick?: (movie: Movie) => void;
  isWatched?: boolean;
  onWatchedClick?: (movie: Movie) => void;
  onRemove?: (imdbID: string) => void;
  onSelectMovie?: (movie: Movie) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  isFavourite = false,
  onFavouriteClick,
  isWatchLater = false,
  onWatchLaterClick,
  isWatched = false,
  onWatchedClick,
  onRemove,
  onSelectMovie,
}) => {
  const [imgError, setImgError] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const posterUrl =
    !imgError && movie.Poster && movie.Poster !== 'N/A'
      ? movie.Poster
      : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=400&auto=format&fit=crop';

  const handleFavClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(movie.imdbID);
    } else if (onFavouriteClick) {
      onFavouriteClick(movie);
    }
  };

  const handleWatchLaterClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onWatchLaterClick) {
      onWatchLaterClick(movie);
    }
  };

  const handleWatchedClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onWatchedClick) {
      onWatchedClick(movie);
    }
  };

  const handleCardClick = () => {
    if (onSelectMovie) {
      onSelectMovie(movie);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const isSeries = movie.Type?.toLowerCase() === 'series';

  return (
    <div
      className={`movie-card ${onSelectMovie ? 'clickable' : ''}`}
      onClick={handleCardClick}
      onMouseMove={handleMouseMove}
      style={
        {
          '--mouse-x': `${mousePos.x}px`,
          '--mouse-y': `${mousePos.y}px`,
        } as React.CSSProperties
      }
    >
      <div className="spotlight-overlay" />

      <div className="movie-poster-container">
        <img
          src={posterUrl}
          alt={movie.Title}
          className="movie-card-poster"
          onError={() => setImgError(true)}
          loading="lazy"
        />

        <div className="poster-overlay" />

        {onSelectMovie && (
          <div className="poster-info-hint">
            <Info className="hint-icon" />
            <span>Details</span>
          </div>
        )}

        {/* Action Buttons Top Bar */}
        <div className="card-actions-row">
          {onWatchLaterClick && (
            <button
              type="button"
              className={`action-btn watch-later ${isWatchLater ? 'active' : ''}`}
              aria-label="Watch Later"
              onClick={handleWatchLaterClick}
              title={isWatchLater ? 'In Watch Later' : 'Add to Watch Later'}
            >
              <Bookmark className={`action-icon ${isWatchLater ? 'filled' : ''}`} />
            </button>
          )}

          {onWatchedClick && (
            <button
              type="button"
              className={`action-btn watched ${isWatched ? 'active' : ''}`}
              aria-label="Watched"
              onClick={handleWatchedClick}
              title={isWatched ? 'Watched' : 'Mark as Watched'}
            >
              <CheckCircle className={`action-icon ${isWatched ? 'filled' : ''}`} />
            </button>
          )}

          {(onFavouriteClick || onRemove) && (
            <button
              type="button"
              className={`favourite-button ${isFavourite || onRemove ? 'is-favourite' : ''}`}
              aria-label={isFavourite || onRemove ? 'Remove from Favourites' : 'Add to Favourites'}
              onClick={handleFavClick}
              title={isFavourite || onRemove ? 'Remove from favourites' : 'Add to favourites'}
            >
              {onRemove ? (
                <Trash2 className="fav-icon trash" />
              ) : (
                <Heart className={`fav-icon ${isFavourite ? 'filled' : ''}`} />
              )}
            </button>
          )}
        </div>

        <div className="poster-badges">
          <span className="type-badge">
            {isSeries ? <Tv className="badge-icon" /> : <Film className="badge-icon" />}
            {movie.Type || 'Movie'}
          </span>
        </div>
      </div>

      <div className="movie-card-info">
        <h3 className="movie-card-title" title={movie.Title}>
          {movie.Title}
        </h3>
        <div className="movie-card-meta">
          <div className="meta-item">
            <Calendar className="meta-icon" />
            <span>{movie.Year}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;

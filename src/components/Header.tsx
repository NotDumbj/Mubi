import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Heart, Search, LogOut, LogIn, User, Sparkles, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './Header.css';

interface HeaderProps {
  query?: string;
  setQuery?: (query: string) => void;
  onSearch?: () => void;
  onHomeClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ query = '', setQuery, onSearch, onHomeClick }) => {
  const { user, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const isHomeActive = location.pathname === '/';
  const isFavActive = location.pathname === '/favourites';

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-left">
          {/* Prominent Korean Brand Logo */}
          <Link to="/" className="brand-logo" onClick={onHomeClick}>
            <div className="brand-icon-wrapper">
              <span className="brand-hangul-mark">무비</span>
              <Sparkles className="sparkle-badge" />
            </div>
            <div className="brand-text-wrapper">
              <span className="brand-title">{t('brandName')}</span>
              <span className="brand-subtitle">{t('brandSub')}</span>
            </div>
          </Link>

          <nav className="header-nav">
            <Link
              to="/"
              className={`nav-link ${isHomeActive ? 'active' : ''}`}
              onClick={onHomeClick}
            >
              <Home className="nav-icon" />
              <span>{t('navHome')}</span>
            </Link>
            <Link
              to="/favourites"
              className={`nav-link ${isFavActive ? 'active' : ''}`}
            >
              <Heart className="nav-icon" />
              <span>{t('navFavourites')}</span>
            </Link>
          </nav>
        </div>

        {setQuery && (
          <form className="search-form" onSubmit={handleSubmit}>
            <div className="search-input-wrapper">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                className="search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="search-button">
              {t('searchBtn')}
            </button>
          </form>
        )}

        <div className="header-right-actions">
          {/* Language Toggle Button */}
          <button
            type="button"
            className="lang-toggle-btn"
            onClick={toggleLanguage}
            title={language === 'en' ? '한국어로 변경 (Switch to Korean)' : 'Switch to English'}
          >
            <Globe className="lang-globe-icon" />
            <span className="lang-text">{language === 'en' ? 'EN' : '한'}</span>
          </button>

          <div className="header-auth">
            {user ? (
              <div className="user-profile">
                <div className="user-avatar-pill">
                  <span className="user-status-dot online"></span>
                  <User className="avatar-icon" />
                  <span className="user-email" title={user.email || ''}>
                    {user.email?.split('@')[0]}
                  </span>
                </div>
                <button
                  type="button"
                  className="auth-btn logout-btn"
                  onClick={handleLogout}
                  title={t('signOut')}
                >
                  <LogOut className="btn-icon" />
                  <span className="btn-text">{t('signOut')}</span>
                </button>
              </div>
            ) : (
              <div className="guest-profile">
                <div className="user-avatar-pill guest">
                  <span className="user-status-dot offline"></span>
                  <span className="guest-label">Guest</span>
                </div>
                <Link to="/auth" className="auth-btn login-btn">
                  <LogIn className="btn-icon" />
                  <span>{t('signIn')}</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

import React from 'react';
import { Mail, Lock, LogIn, UserPlus, Loader2, Sparkles } from 'lucide-react';
import { useAuthViewModel } from './useAuthViewModel';
import { useLanguage } from '../../context/LanguageContext';
import './AuthView.css';

interface AuthViewProps {
  viewModel?: ReturnType<typeof useAuthViewModel>;
}

export const AuthView: React.FC<AuthViewProps> = ({ viewModel: externalViewModel }) => {
  const internalViewModel = useAuthViewModel();
  const {
    email,
    setEmail,
    password,
    setPassword,
    mode,
    loading,
    error,
    handleSubmit,
    toggleMode,
  } = externalViewModel || internalViewModel;
  const { t } = useLanguage();

  const isLogin = mode === 'login';

  return (
    <main className="auth-container">
      <div className="auth-card">
        {/* Card Top Brand Header */}
        <div className="auth-card-header">
          <div className="auth-brand-badge">
            <span className="auth-hangul-badge">무비</span>
            <Sparkles className="auth-sparkle" />
          </div>
          <h1 className="auth-title">{t('welcomeTitle')}</h1>
          <p className="auth-subtitle">
            {isLogin ? t('loginSubtitle') : t('registerSubtitle')}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="auth-mode-tabs">
          <button
            type="button"
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={!isLogin ? toggleMode : undefined}
            disabled={loading}
          >
            <LogIn className="tab-icon" />
            <span>{t('loginBtn')}</span>
          </button>
          <button
            type="button"
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={isLogin ? toggleMode : undefined}
            disabled={loading}
          >
            <UserPlus className="tab-icon" />
            <span>{t('registerBtn')}</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && <div className="auth-error-alert">{error}</div>}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="auth-email">{t('emailLabel')}</label>
            <div className="auth-input-wrapper">
              <Mail className="input-icon" />
              <input
                id="auth-email"
                type="email"
                placeholder={t('emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">{t('passwordLabel')}</label>
            <div className="auth-input-wrapper">
              <Lock className="input-icon" />
              <input
                id="auth-password"
                type="password"
                placeholder={t('passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="btn-spinner" />
                <span>{isLogin ? t('loggingIn') : t('registering')}</span>
              </>
            ) : (
              <>
                {isLogin ? <LogIn className="btn-icon" /> : <UserPlus className="btn-icon" />}
                <span>{isLogin ? t('loginBtn') : t('registerBtn')}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
};

export default AuthView;

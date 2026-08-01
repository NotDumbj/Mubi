import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import HomeView from './pages/Home/HomeView';
import FavouritesView from './pages/Favourites/FavouritesView';
import AuthView from './pages/Auth/AuthView';
import AiAssistantWidget from './components/AiAssistant/AiAssistantWidget';
import MovieDetailsModal from './components/MovieDetailsModal/MovieDetailsModal';
import { useHomeViewModel } from './pages/Home/useHomeViewModel';
import type { Movie } from './types';
import './App.css';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return null;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function MainLayout() {
  const homeViewModel = useHomeViewModel();
  const [aiSelectedMovie, setAiSelectedMovie] = useState<Movie | null>(null);

  return (
    <div>
      <Header
        query={homeViewModel.query}
        setQuery={homeViewModel.setQuery}
        onSearch={homeViewModel.handleSearch}
        onHomeClick={homeViewModel.resetHome}
      />
      <Routes>
        <Route path="/" element={<HomeView viewModel={homeViewModel} />} />
        <Route
          path="/favourites"
          element={
            <ProtectedRoute>
              <FavouritesView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/auth"
          element={
            <PublicOnlyRoute>
              <AuthView />
            </PublicOnlyRoute>
          }
        />
      </Routes>

      {/* Floating AI Assistant & Movie Randomizer */}
      <AiAssistantWidget
        userWatchlist={homeViewModel.watchLaterList}
        onSelectMovie={(movie) => setAiSelectedMovie(movie)}
      />

      {/* AI Recommendation Movie Details Modal */}
      <MovieDetailsModal
        movie={aiSelectedMovie}
        isOpen={!!aiSelectedMovie}
        onClose={() => setAiSelectedMovie(null)}
        isFavourite={aiSelectedMovie ? homeViewModel.favouriteIds.has(aiSelectedMovie.imdbID) : false}
        onFavouriteClick={homeViewModel.toggleFavourite}
        isWatchLater={aiSelectedMovie ? homeViewModel.watchLaterIds.has(aiSelectedMovie.imdbID) : false}
        onWatchLaterClick={homeViewModel.toggleWatchLater}
        isWatched={aiSelectedMovie ? homeViewModel.watchedIds.has(aiSelectedMovie.imdbID) : false}
        onWatchedClick={homeViewModel.toggleWatched}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

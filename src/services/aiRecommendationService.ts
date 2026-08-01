import { searchMovies } from './omdbMovieService';
import type { Movie } from '../types';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  recommendations?: Movie[];
  timestamp: Date;
}

const TRENDING_KEYWORDS = [
  'Inception',
  'Interstellar',
  'Parasite',
  'The Dark Knight',
  'Dune',
  'Avengers',
  'Squid Game',
  'Spider-Man',
  'Matrix',
  'Gladiator',
];

const GENRE_KEYWORDS: Record<string, string[]> = {
  scifi: ['Inception', 'Interstellar', 'Blade Runner', 'Matrix', 'Dune', 'Tenet'],
  kdrama: ['Parasite', 'Squid Game', 'Crash Landing on You', 'Kingdom', 'Train to Busan'],
  action: ['The Dark Knight', 'John Wick', 'Mad Max', 'Top Gun', 'Mission Impossible'],
  classics: ['The Godfather', 'Pulp Fiction', 'Forrest Gump', 'Fight Club', 'Goodfellas'],
};

/**
 * Generates an AI recommendation based on a prompt or quick chip.
 */
export async function generateAiRecommendation(
  prompt: string,
  userWatchlist: Movie[] = [],
  lang: 'en' | 'ko' = 'en'
): Promise<{ text: string; recommendations: Movie[] }> {
  const lowerPrompt = prompt.toLowerCase();

  // Scenario 1: User asks for recommendations from Watch Later list
  if (lowerPrompt.includes('watch later') || lowerPrompt.includes('watchlist') || lowerPrompt.includes('나중에') || lowerPrompt.includes('보관함')) {
    if (userWatchlist.length > 0) {
      const shuffled = [...userWatchlist].sort(() => Math.random() - 0.5);
      const picked = shuffled.slice(0, Math.min(2, shuffled.length));

      const text =
        lang === 'ko'
          ? `보관해 두신 '나중에 볼 영화' 목록에서 엄선한 추천입니다! 🎬`
          : `Here are top picks directly from your Watch Later collection! 🎬`;

      return { text, recommendations: picked };
    } else {
      // Fallback to trending if watchlist empty
      const trendingResults = await searchMovies('Interstellar');
      const text =
        lang === 'ko'
          ? `아직 '나중에 볼 영화'에 보관된 명작이 없어, 대신 시네마 트렌딩 명작을 추천합니다!`
          : `Your Watch Later list is currently empty, so I picked some acclaimed trending hits for you!`;

      return { text, recommendations: trendingResults.slice(0, 2) };
    }
  }

  // Scenario 2: Sci-Fi / Mind-bending
  if (lowerPrompt.includes('sci-fi') || lowerPrompt.includes('sf') || lowerPrompt.includes('mind') || lowerPrompt.includes('반전')) {
    const keyword = GENRE_KEYWORDS.scifi[Math.floor(Math.random() * GENRE_KEYWORDS.scifi.length)];
    const movies = await searchMovies(keyword);
    const text =
      lang === 'ko'
        ? `경이로운 몰입감을 자랑하는 추천 SF & 마인드 벤딩 작품입니다! 🚀`
        : `Here are mind-bending Sci-Fi masterpieces that will expand your imagination! 🚀`;

    return { text, recommendations: movies.slice(0, 2) };
  }

  // Scenario 3: K-Drama / Korean Cinema
  if (lowerPrompt.includes('korea') || lowerPrompt.includes('k-drama') || lowerPrompt.includes('한국') || lowerPrompt.includes('드라마')) {
    const keyword = GENRE_KEYWORDS.kdrama[Math.floor(Math.random() * GENRE_KEYWORDS.kdrama.length)];
    const movies = await searchMovies(keyword);
    const text =
      lang === 'ko'
        ? `세계적으로 사랑받는 웰메이드 한국 영화 & 드라마 추천입니다! 💖`
        : `Here are critically acclaimed Korean films & series you'll love! 💖`;

    return { text, recommendations: movies.slice(0, 2) };
  }

  // Scenario 4: General keyword search via OMDB
  try {
    const results = await searchMovies(prompt.trim());
    if (results.length > 0) {
      const text =
        lang === 'ko'
          ? `'${prompt}' 관련 무비 AI 분석 결과 추천작입니다! ✨`
          : `Based on your request "${prompt}", here are curated movie recommendations! ✨`;

      return { text, recommendations: results.slice(0, 2) };
    }
  } catch {
    // Continue to fallback if search fails
  }

  // Scenario 5: Random Fallback Trending
  const randomKeyword = TRENDING_KEYWORDS[Math.floor(Math.random() * TRENDING_KEYWORDS.length)];
  const fallbackMovies = await searchMovies(randomKeyword);

  const text =
    lang === 'ko'
      ? `오늘 감상하기 완벽한 무비 어시스턴트 강력 추천 작품입니다! 🌟`
      : `Here is a high-rated cinema pick curated specially for your movie night! 🌟`;

  return { text, recommendations: fallbackMovies.slice(0, 2) };
}

/**
 * Spins the movie randomizer wheel.
 */
export async function spinRandomizer(
  source: 'watchlist' | 'trending' | 'genre',
  userWatchlist: Movie[] = []
): Promise<Movie | null> {
  if (source === 'watchlist') {
    if (userWatchlist.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * userWatchlist.length);
    return userWatchlist[randomIndex];
  }

  if (source === 'trending') {
    const randomKeyword = TRENDING_KEYWORDS[Math.floor(Math.random() * TRENDING_KEYWORDS.length)];
    const movies = await searchMovies(randomKeyword);
    if (movies.length === 0) return null;
    return movies[Math.floor(Math.random() * movies.length)];
  }

  // 'genre' source
  const allGenreKeys = Object.keys(GENRE_KEYWORDS);
  const selectedCat = allGenreKeys[Math.floor(Math.random() * allGenreKeys.length)];
  const keywords = GENRE_KEYWORDS[selectedCat];
  const chosenKeyword = keywords[Math.floor(Math.random() * keywords.length)];

  const movies = await searchMovies(chosenKeyword);
  if (movies.length === 0) return null;
  return movies[Math.floor(Math.random() * movies.length)];
}

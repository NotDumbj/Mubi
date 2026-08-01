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
  scifi: ['Inception', 'Interstellar', 'Blade Runner', 'Matrix', 'Dune', 'Tenet', 'Arrival'],
  kdrama: ['Squid Game', 'Vincenzo', 'Hometown Cha-Cha-Cha', 'Parasite', 'Crash Landing on You', 'Kingdom', 'Train to Busan', 'All of Us Are Dead'],
  kdrama2021: ['Squid Game', 'Vincenzo', 'Hometown Cha-Cha-Cha', 'Hellbound', 'My Name', 'Taxi Driver', 'Happiness'],
  action: ['The Dark Knight', 'John Wick', 'Mad Max', 'Top Gun', 'Mission Impossible'],
  classics: ['The Godfather', 'Pulp Fiction', 'Forrest Gump', 'Fight Club', 'Goodfellas'],
};

/**
 * Removes conversational filler words to isolate the core search intent.
 */
function cleanUserPrompt(prompt: string): string {
  return prompt
    .toLowerCase()
    .replace(/\b(can|you|u|please|share|me|some|show|give|recommend|find|best|good|top|movie|movies|film|films|series|tv|show|shows|watch|watching)\b/gi, '')
    .replace(/[^\w\s]/gi, '')
    .trim();
}

/**
 * Generates an AI recommendation based on a prompt or quick chip.
 */
export async function generateAiRecommendation(
  prompt: string,
  userWatchlist: Movie[] = [],
  lang: 'en' | 'ko' = 'en'
): Promise<{ text: string; recommendations: Movie[] }> {
  const normalized = prompt.toLowerCase().replace(/[-_]/g, ' ');

  // 1. Watch Later / Library Intent
  if (
    normalized.includes('watch later') ||
    normalized.includes('watchlist') ||
    normalized.includes('나중에') ||
    normalized.includes('보관함')
  ) {
    if (userWatchlist.length > 0) {
      const shuffled = [...userWatchlist].sort(() => Math.random() - 0.5);
      const picked = shuffled.slice(0, Math.min(2, shuffled.length));

      const text =
        lang === 'ko'
          ? `보관해 두신 '나중에 볼 영화' 목록에서 엄선한 추천입니다! 🎬`
          : `Here are top picks directly from your Watch Later collection! 🎬`;

      return { text, recommendations: picked };
    } else {
      const trendingResults = await searchMovies('Interstellar');
      const text =
        lang === 'ko'
          ? `아직 '나중에 볼 영화'에 보관된 명작이 없어, 대신 시네마 트렌딩 명작을 추천합니다!`
          : `Your Watch Later list is currently empty, so I picked some acclaimed trending hits for you!`;

      return { text, recommendations: trendingResults.slice(0, 2) };
    }
  }

  // 2. K-Drama / Korean Cinema Intent (including space variations like "k drama", "k-drama", "korean")
  const isKdramaIntent =
    normalized.includes('k drama') ||
    normalized.includes('kdrama') ||
    normalized.includes('korean') ||
    normalized.includes('k drama') ||
    normalized.includes('한국') ||
    normalized.includes('드라마');

  if (isKdramaIntent) {
    const is2021 = normalized.includes('2021');
    const keywordList = is2021 ? GENRE_KEYWORDS.kdrama2021 : GENRE_KEYWORDS.kdrama;
    const pickedKeyword = keywordList[Math.floor(Math.random() * keywordList.length)];
    const secondKeyword = keywordList[(keywordList.indexOf(pickedKeyword) + 1) % keywordList.length];

    const [firstBatch, secondBatch] = await Promise.all([
      searchMovies(pickedKeyword),
      searchMovies(secondKeyword),
    ]);

    const combined = [...firstBatch, ...secondBatch];
    const uniqueMap = new Map<string, Movie>();
    combined.forEach((m) => uniqueMap.set(m.imdbID, m));

    const recs = Array.from(uniqueMap.values()).slice(0, 2);

    const text = is2021
      ? lang === 'ko'
        ? `2021년을 뜨겁게 달군 히트 K-드라마 & 한국 영화 추천입니다! 💖`
        : `Here are acclaimed 2021 K-Dramas & Korean hits you should check out! 💖`
      : lang === 'ko'
        ? `세계적으로 사랑받는 웰메이드 한국 영화 & K-드라마 추천입니다! 💖`
        : `Here are critically acclaimed Korean films & K-Dramas you'll love! 💖`;

    return { text, recommendations: recs };
  }

  // 3. Sci-Fi / Mind-bending Intent
  if (
    normalized.includes('sci fi') ||
    normalized.includes('scifi') ||
    normalized.includes('sf') ||
    normalized.includes('mind') ||
    normalized.includes('반전')
  ) {
    const keyword = GENRE_KEYWORDS.scifi[Math.floor(Math.random() * GENRE_KEYWORDS.scifi.length)];
    const movies = await searchMovies(keyword);
    const text =
      lang === 'ko'
        ? `경이로운 몰입감을 자랑하는 추천 SF & 마인드 벤딩 작품입니다! 🚀`
        : `Here are mind-bending Sci-Fi masterpieces that will expand your imagination! 🚀`;

    return { text, recommendations: movies.slice(0, 2) };
  }

  // 4. Action Intent
  if (
    normalized.includes('action') ||
    normalized.includes('액션') ||
    normalized.includes('thriller') ||
    normalized.includes('스릴러')
  ) {
    const keyword = GENRE_KEYWORDS.action[Math.floor(Math.random() * GENRE_KEYWORDS.action.length)];
    const movies = await searchMovies(keyword);
    const text =
      lang === 'ko'
        ? `손에 땀을 쥐게 하는 강렬한 액션 무비 추천입니다! ⚡`
        : `Here are pulse-pounding Action & Thriller blockbusters! ⚡`;

    return { text, recommendations: movies.slice(0, 2) };
  }

  // 5. General / Specific Title Search after cleaning conversational noise
  const cleanedSearch = cleanUserPrompt(prompt);
  if (cleanedSearch.length >= 2) {
    try {
      const results = await searchMovies(cleanedSearch);
      if (results.length > 0) {
        const text =
          lang === 'ko'
            ? `'${cleanedSearch}' 관련 무비 AI 분석 결과 추천작입니다! ✨`
            : `Based on your request "${cleanedSearch}", here are curated movie recommendations! ✨`;

        return { text, recommendations: results.slice(0, 2) };
      }
    } catch {
      // Continue to fallback
    }
  }

  // 6. Fallback Trending
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

import { searchMovies } from './omdbMovieService';
import type { Movie } from '../types';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  recommendations?: Movie[];
  timestamp: Date;
}

const DEFAULT_TRENDING = ['Inception', 'Interstellar', 'Parasite', 'Squid Game', 'The Dark Knight', 'Dune'];

/**
 * Curated high-precision title maps for common queries (K-Dramas by year, etc.)
 */
const ACCURATE_QUERY_MAPS: Record<string, string[]> = {
  '2022 kdrama': [
    'All of Us Are Dead',
    'Extraordinary Attorney Woo',
    'Twenty-Five Twenty-One',
    'Business Proposal',
    'Reborn Rich',
    'Big Mouth',
    'Our Blues',
    'Under the Queen\'s Umbrella',
  ],
  '2021 kdrama': [
    'Squid Game',
    'Vincenzo',
    'Hometown Cha-Cha-Cha',
    'My Name',
    'D.P.',
    'Happiness',
    'Taxicab Driver',
    'Yumi\'s Cells',
  ],
  '2023 kdrama': [
    'The Glory',
    'Moving',
    'King the Land',
    'The Good Bad Mother',
    'Bloodhounds',
    'My Dearest',
    'Daily Dose of Sunshine',
  ],
  '2024 kdrama': [
    'Queen of Tears',
    'Marry My Husband',
    'A Killer Paradox',
    'Doctor Slump',
    'Pyramid Game',
  ],
};

/**
 * Extract 4-digit year from prompt (e.g. 2022, 2021)
 */
function extractTargetYear(prompt: string): string | null {
  const match = prompt.match(/\b(19\d\d|20\d\d)\b/);
  return match ? match[1] : null;
}

/**
 * Deduplicates a list of movies by root title and IMDb ID to prevent spin-offs & duplicate cards.
 * E.g., "Crash Landing on You" vs "Crash Landing on You: Live in Seoul" -> keeps only the primary series!
 */
function deduplicateMoviesByTitle(movies: Movie[], targetYear?: string | null): Movie[] {
  const seenRoots = new Set<string>();
  const seenIds = new Set<string>();
  const result: Movie[] = [];

  for (const movie of movies) {
    if (!movie || !movie.Title || seenIds.has(movie.imdbID)) continue;

    // Strict year filter if targetYear is specified
    if (targetYear) {
      const yearString = String(movie.Year || '');
      if (!yearString.includes(targetYear)) {
        continue;
      }
    }

    // Extract root title before colon or dash (e.g., "Crash Landing on You: Live in Seoul" -> "crash landing on you")
    const rootTitle = movie.Title.split(/[:\-]/)[0].toLowerCase().replace(/[^a-z0-9]/g, '').trim();

    if (rootTitle && !seenRoots.has(rootTitle)) {
      seenRoots.add(rootTitle);
      seenIds.add(movie.imdbID);
      result.push(movie);
    }
  }

  return result;
}

/**
 * Clean user input to extract core search intent.
 */
function cleanUserPrompt(prompt: string): string {
  return prompt
    .toLowerCase()
    .replace(/\b(can|you|u|please|share|me|some|show|give|recommend|find|best|good|top|hit|hits|movie|movies|film|films|series|tv|show|shows|watch|watching)\b/gi, '')
    .replace(/[^\w\s]/gi, '')
    .trim();
}

/**
 * Open Knowledge Engine: Queries Wikipedia's open API to dynamically discover
 * real titles for ANY arbitrary user request (genres, years, countries, actors, themes).
 */
async function discoverTitlesViaWikipedia(prompt: string): Promise<string[]> {
  try {
    let wikiQuery = cleanUserPrompt(prompt);

    wikiQuery = wikiQuery
      .replace(/\bkdramas?\b/gi, 'South Korean television series')
      .replace(/\bk drama\b/gi, 'South Korean drama series')
      .replace(/\bkorean dramas?\b/gi, 'South Korean television series')
      .replace(/\banime\b/gi, 'anime series')
      .replace(/\bscifi\b/gi, 'science fiction films')
      .replace(/\bhorror\b/gi, 'horror films')
      .replace(/\bcomedy\b/gi, 'comedy films');

    const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      wikiQuery
    )}&format=json&origin=*`;

    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json();
    const searchResults = data?.query?.search || [];

    const titles: string[] = searchResults
      .map((item: { title: string }) => item.title)
      .filter((title: string) => {
        const lower = title.toLowerCase();
        return (
          !lower.startsWith('list of') &&
          !lower.startsWith('index of') &&
          !lower.startsWith('category:') &&
          !lower.startsWith('template:') &&
          !lower.includes('wikipedia:') &&
          !lower.includes('discography') &&
          !lower.includes('filmography') &&
          !lower.includes('season')
        );
      });

    return titles.slice(0, 5);
  } catch (err) {
    console.warn('Wikipedia discovery API failed:', err);
    return [];
  }
}

/**
 * Calls Google Gemini REST API (Free Tier) to get intelligent movie recommendations if configured.
 */
async function getGeminiRecommendation(
  prompt: string,
  userWatchlist: Movie[] = [],
  lang: 'en' | 'ko' = 'en',
  apiKey: string
): Promise<{ text: string; searchTitles: string[] } | null> {
  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const watchlistTitles = userWatchlist.map((m) => m.Title).join(', ');
    const languageInstruction = lang === 'ko' ? 'Korean' : 'English';

    const systemPrompt = `You are Mubi AI, a movie cinema expert.
Analyze the user's request and provide movie or TV series recommendations.
If user mentions a specific year (e.g. 2022), genre, mood, or context, strictly pick accurate titles matching that request.
Respond in valid JSON with two fields:
1. "reply": A friendly 1-2 sentence recommendation text in ${languageInstruction}.
2. "searchTitles": An array of 1 to 3 exact movie/series titles to search on OMDB.

User Watch Later list titles (for context): ${watchlistTitles || 'None'}
User Request: "${prompt}"`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: systemPrompt }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const jsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!jsonText) return null;

    const parsed = JSON.parse(jsonText);
    return {
      text: parsed.reply || (lang === 'ko' ? '추천 무비 결과입니다!' : 'Here are your recommendations!'),
      searchTitles: Array.isArray(parsed.searchTitles) ? parsed.searchTitles : [],
    };
  } catch (err) {
    console.warn('Gemini API call failed, falling back to open discovery engine:', err);
    return null;
  }
}

/**
 * Main AI Recommendation Generator.
 * Uses Gemini LLM API, Curated Query Maps, or Wikipedia Open Knowledge Graph + OMDB Hydration.
 */
export async function generateAiRecommendation(
  prompt: string,
  userWatchlist: Movie[] = [],
  lang: 'en' | 'ko' = 'en'
): Promise<{ text: string; recommendations: Movie[] }> {
  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const targetYear = extractTargetYear(prompt);
  const normalized = prompt.toLowerCase();

  // 🤖 1. Primary: Google Gemini Free-Tier LLM API (if key present in .env)
  if (geminiApiKey && geminiApiKey.trim() !== '') {
    const geminiResult = await getGeminiRecommendation(prompt, userWatchlist, lang, geminiApiKey);

    if (geminiResult && geminiResult.searchTitles.length > 0) {
      const moviePromises = geminiResult.searchTitles.map((title) =>
        searchMovies(title).catch(() => [])
      );
      const searchResults = await Promise.all(moviePromises);

      const allFetched: Movie[] = [];
      for (const res of searchResults) {
        if (res.length > 0) allFetched.push(res[0]);
      }

      const deduplicated = deduplicateMoviesByTitle(allFetched, targetYear);
      if (deduplicated.length > 0) {
        return {
          text: geminiResult.text,
          recommendations: deduplicated.slice(0, 3),
        };
      }
    }
  }

  // 🎯 2. High-Precision Query Key Match (e.g. "2022 kdrama", "2021 kdrama")
  for (const [key, knownTitles] of Object.entries(ACCURATE_QUERY_MAPS)) {
    const keyParts = key.split(' ');
    const matchesAllKeyParts = keyParts.every((part) => normalized.includes(part));

    if (matchesAllKeyParts) {
      const omdbPromises = knownTitles.map((title) => searchMovies(title).catch(() => []));
      const omdbResults = await Promise.all(omdbPromises);

      const matchedMovies: Movie[] = [];
      for (const res of omdbResults) {
        if (res.length > 0) matchedMovies.push(res[0]);
      }

      const deduplicated = deduplicateMoviesByTitle(matchedMovies, targetYear);
      if (deduplicated.length > 0) {
        const replyText =
          lang === 'ko'
            ? `'${prompt}' 의도에 꼭 맞춘 최고의 명작 리스트입니다! 🎬`
            : `Here are critically acclaimed hits matching "${prompt}"! 🎬`;

        return {
          text: replyText,
          recommendations: deduplicated.slice(0, 3),
        };
      }
    }
  }

  // 🧠 3. Watch Later / Library Intent
  if (
    normalized.includes('watch later') ||
    normalized.includes('watchlist') ||
    normalized.includes('나중에') ||
    normalized.includes('보관함')
  ) {
    if (userWatchlist.length > 0) {
      const shuffled = [...userWatchlist].sort(() => Math.random() - 0.5);
      const picked = deduplicateMoviesByTitle(shuffled).slice(0, Math.min(2, userWatchlist.length));

      const text =
        lang === 'ko'
          ? `보관해 두신 '나중에 볼 영화' 목록에서 엄선한 추천입니다! 🎬`
          : `Here are top picks directly from your Watch Later collection! 🎬`;

      return { text, recommendations: picked };
    }
  }

  // 🌐 4. Creative Open Knowledge Engine: Wikipedia Search + OMDB Poster Hydration
  const wikiTitles = await discoverTitlesViaWikipedia(prompt);

  if (wikiTitles.length > 0) {
    const omdbPromises = wikiTitles.map((title) => searchMovies(title).catch(() => []));
    const omdbResults = await Promise.all(omdbPromises);

    const candidates: Movie[] = [];
    for (const res of omdbResults) {
      if (res.length > 0) {
        candidates.push(res[0]);
      }
    }

    const deduplicated = deduplicateMoviesByTitle(candidates, targetYear);

    if (deduplicated.length > 0) {
      const replyText =
        lang === 'ko'
          ? `'${prompt}' 검색 의도를 분석해 엄선한 추천작입니다! ✨`
          : `Here are curated cinema recommendations matching "${prompt}"! ✨`;

      return {
        text: replyText,
        recommendations: deduplicated.slice(0, 3),
      };
    }
  }

  // 5. Direct OMDB Title Search fallback
  const cleanedQuery = cleanUserPrompt(prompt);
  if (cleanedQuery.length >= 2) {
    const directResults = await searchMovies(cleanedQuery);
    const deduplicated = deduplicateMoviesByTitle(directResults, targetYear);

    if (deduplicated.length > 0) {
      const text =
        lang === 'ko'
          ? `'${cleanedQuery}' 무비 AI 수집 결과입니다! ✨`
          : `Based on your request "${cleanedQuery}", here are matching titles! ✨`;

      return { text, recommendations: deduplicated.slice(0, 3) };
    }
  }

  // 6. Ultimate Fallback: Acclaimed Cinema Hits
  const randomKeyword = DEFAULT_TRENDING[Math.floor(Math.random() * DEFAULT_TRENDING.length)];
  const fallbackMovies = await searchMovies(randomKeyword);

  const text =
    lang === 'ko'
      ? `오늘 감상하기 완벽한 무비 어시스턴트 추천 작품입니다! 🌟`
      : `Here is a high-rated cinema pick curated specially for your movie night! 🌟`;

  return { text, recommendations: deduplicateMoviesByTitle(fallbackMovies).slice(0, 2) };
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
    const randomKeyword = DEFAULT_TRENDING[Math.floor(Math.random() * DEFAULT_TRENDING.length)];
    const movies = await searchMovies(randomKeyword);
    if (movies.length === 0) return null;
    return movies[Math.floor(Math.random() * movies.length)];
  }

  const discoveryKeywords = ['Sci-Fi', 'Korean Drama', 'Action', 'Thriller', 'Animation'];
  const chosen = discoveryKeywords[Math.floor(Math.random() * discoveryKeywords.length)];

  const movies = await searchMovies(chosen);
  if (movies.length === 0) return null;
  return movies[Math.floor(Math.random() * movies.length)];
}

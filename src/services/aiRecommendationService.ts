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
 * Deduplicates a list of movies by cleaned title string so duplicate titles are never returned.
 */
function deduplicateMoviesByTitle(movies: Movie[]): Movie[] {
  const seenTitles = new Set<string>();
  const result: Movie[] = [];

  for (const movie of movies) {
    const cleanTitle = movie.Title.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
    if (cleanTitle && !seenTitles.has(cleanTitle)) {
      seenTitles.add(cleanTitle);
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

    // Smart synonym expansion for open discovery
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
          !lower.includes('filmography')
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
If user mentions a specific year, genre, mood, or context, strictly pick accurate titles matching that request.
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
 * Uses Gemini LLM API (if VITE_GEMINI_API_KEY set) or Wikipedia Open Knowledge Graph + OMDB Hydration.
 */
export async function generateAiRecommendation(
  prompt: string,
  userWatchlist: Movie[] = [],
  lang: 'en' | 'ko' = 'en'
): Promise<{ text: string; recommendations: Movie[] }> {
  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

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

      const deduplicated = deduplicateMoviesByTitle(allFetched);
      if (deduplicated.length > 0) {
        return {
          text: geminiResult.text,
          recommendations: deduplicated.slice(0, 3),
        };
      }
    }
  }

  // 🧠 2. Watch Later / Library Intent
  const normalized = prompt.toLowerCase();
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

  // 🌐 3. Creative Open Knowledge Engine: Wikipedia Search + OMDB Poster Hydration
  // Works dynamically for ANY prompt, year, mood, genre, actor, or country without hardcoded keywords!
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

    const deduplicated = deduplicateMoviesByTitle(candidates);

    if (deduplicated.length > 0) {
      const replyText =
        lang === 'ko'
          ? `'${prompt}' 검색 의도를 분석해 엄선한 추천작입니다! ✨`
          : `Here are curated cinema recommendations matching "${prompt}"! ✨`;

      return {
        text: replyText,
        recommendations: deduplicated.slice(0, 2),
      };
    }
  }

  // 4. Direct OMDB Title Search fallback
  const cleanedQuery = cleanUserPrompt(prompt);
  if (cleanedQuery.length >= 2) {
    const directResults = await searchMovies(cleanedQuery);
    const deduplicated = deduplicateMoviesByTitle(directResults);

    if (deduplicated.length > 0) {
      const text =
        lang === 'ko'
          ? `'${cleanedQuery}' 무비 AI 수집 결과입니다! ✨`
          : `Based on your request "${cleanedQuery}", here are matching titles! ✨`;

      return { text, recommendations: deduplicated.slice(0, 2) };
    }
  }

  // 5. Ultimate Fallback: Acclaimed Cinema Hits
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

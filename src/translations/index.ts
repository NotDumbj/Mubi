export type Language = 'en' | 'ko';

export const translations = {
  en: {
    // Brand
    brandName: 'MUBI',
    brandSub: '무비',
    brandBadge: '무비 • CINEMA HQ',

    // Navigation
    navHome: 'Home',
    navFavourites: 'My Library',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    account: 'Account',

    // Hero / Home Page
    heroTitlePart1: 'Explore ',
    heroTitlePart2: 'Masterpieces',
    heroTitlePart3: ' & Trending Hits',
    heroSubtitle: 'Search millions of movies, TV shows, and anime series. Save your personal favorites in real time.',
    searchPlaceholder: 'Search movies, TV shows, directors...',
    searchBtn: 'Search',
    recommendedMovies: 'Recommended Movies',
    searchResults: 'Search Results',
    titlesFound: 'titles found',
    noMoviesFound: 'No movies found matching your query.',
    errorLoadingMovies: 'Failed to load movies. Please check your connection.',

    // Category Filter Bar
    catAll: '🔥 Trending',
    catAction: '⚡ Action',
    catSciFi: '🚀 Sci-Fi',
    catKdrama: '💖 K-Drama',
    catFantasy: '🧙 Fantasy',
    catHorror: '👻 Horror',
    catAnimation: '🎨 Animation',
    catClassics: '🏆 Classics',

    // Library View & Tabs
    favHeroTitle: 'My Cinema Library',
    favHeroSubtitle: 'Your curated list of must-watch films and series, synced with your account in real time.',
    tabFavourites: 'Favourites',
    tabWatchLater: 'Watch Later',
    tabWatched: 'Watched',
    savedCount: 'Saved',
    emptyFavTitle: 'Your favourites list is empty',
    emptyFavSubtitle: 'Explore movies on the home page and click the heart icon to start curating.',
    emptyWatchLaterTitle: 'Your Watch Later list is empty',
    emptyWatchLaterSubtitle: 'Bookmark movies to save them for your next movie night.',
    emptyWatchedTitle: 'No watched movies recorded yet',
    emptyWatchedSubtitle: 'Mark movies as watched to track your cinema journey.',
    exploreMoviesBtn: 'Explore Movies',

    // Watchlist Actions
    addToWatchLater: 'Add to Watch Later',
    removeFromWatchLater: 'Remove from Watch Later',
    markAsWatched: 'Mark as Watched',
    unmarkWatched: 'Remove from Watched',

    // Auth View
    welcomeTitle: 'Welcome to MUBI 무비',
    loginSubtitle: 'Sign in to access your saved favourites',
    registerSubtitle: 'Create an account to start curating movies',
    loginBtn: 'Sign In',
    registerBtn: 'Create Account',
    emailLabel: 'Email Address',
    emailPlaceholder: 'name@example.com',
    passwordLabel: 'Password',
    passwordPlaceholder: '••••••••',
    loggingIn: 'Signing in...',
    registering: 'Creating account...',

    // Movie Cards & Modal
    addToFavourites: 'Add to favourites',
    removeFromFavourites: 'Remove from favourites',
    movieType: 'Movie',
    seriesType: 'Series',

    // Details Modal
    modalDirector: 'Director',
    modalWriter: 'Writer',
    modalCast: 'Cast',
    modalPlot: 'Synopsis',
    modalAwards: 'Awards',
    modalBoxOffice: 'Box Office',
    modalRating: 'IMDb Rating',
    modalMetascore: 'Metascore',
    modalRuntime: 'Runtime',
    modalGenre: 'Genre',
    modalClose: 'Close',
    loadingDetails: 'Loading full movie details...',

    // AI Assistant & Randomizer
    aiTriggerTitle: 'Mubi AI & Roulette',
    aiWidgetHeader: 'Mubi AI Cinema Assistant',
    tabAiChat: 'AI Assistant',
    tabRandomizer: 'Movie Roulette',
    aiGreeting: 'Hello! I am your Mubi AI cinema assistant. What kind of movie are you in the mood for today?',
    aiPromptPlaceholder: 'Ask for recommendations (e.g. mind-bending sci-fi, Korean thriller)...',
    chipSciFi: '🚀 Mind-bending Sci-Fi',
    chipKdrama: '💖 Top K-Drama / Film',
    chipQuick: '⏱️ Under 90 Mins',
    chipWatchlist: '🔖 Pick from my Watch Later',
    randomizerTitle: 'What Should I Watch Tonight?',
    randomizerSubtitle: 'Let the Mubi Roulette pick the perfect movie for you!',
    randomizerSourceLabel: 'Select Roulette Source:',
    sourceWatchLater: 'My Watch Later List',
    sourceTrending: 'Popular Trending Hits',
    sourceGenre: 'Random Classics & Blockbusters',
    spinBtn: '🎲 Spin Movie Roulette',
    spinning: 'Spinning Cinema Wheel...',
    viewMovieDetails: 'View Full Movie Details',
    spinAgain: 'Spin Again',
    emptyRandomizerWatchlist: 'Your Watch Later list is empty. Add movies to your Watch Later list or switch to Popular Hits!',
    botThinking: 'Mubi AI is analyzing recommendations...',
  },
  ko: {
    // Brand
    brandName: '무비',
    brandSub: 'MUBI',
    brandBadge: '무비 • 프리미엄 시네마',

    // Navigation
    navHome: '홈',
    navFavourites: '무비 보관함',
    signIn: '로그인',
    signOut: '로그아웃',
    account: '내 계정',

    // Hero / Home Page
    heroTitlePart1: '무비에서 탐색하는 ',
    heroTitlePart2: '명작 영화',
    heroTitlePart3: ' & 트렌딩 신작',
    heroSubtitle: '수백만 편의 영화, TV 시리즈, 애니메이션을 검색하고 실시간으로 나만의 즐겨찾기를 저장하세요.',
    searchPlaceholder: '영화 제목, TV 시리즈, 감독 검색...',
    searchBtn: '검색',
    recommendedMovies: '추천 무비 컬렉션',
    searchResults: '검색 결과',
    titlesFound: '개의 작품',
    noMoviesFound: '검색어와 일치하는 영화를 찾을 수 없습니다.',
    errorLoadingMovies: '영화 정보를 불러오지 못했습니다. 네트워크를 확인해 주세요.',

    // Category Filter Bar
    catAll: '🔥 트렌딩',
    catAction: '⚡ 액션',
    catSciFi: '🚀 SF 영화',
    catKdrama: '💖 K-드라마',
    catFantasy: '🧙 판타지',
    catHorror: '👻 공포/스릴러',
    catAnimation: '🎨 애니메이션',
    catClassics: '🏆 클래식 명작',

    // Library View & Tabs
    favHeroTitle: '나만의 무비 라이브러리',
    favHeroSubtitle: '계정과 실시간으로 동기화된 내가 엄선한 영화 및 시리즈 목록입니다.',
    tabFavourites: '즐겨찾기',
    tabWatchLater: '나중에 볼 영화',
    tabWatched: '시청 완료',
    savedCount: '보관됨',
    emptyFavTitle: '즐겨찾기 목록이 비어 있습니다',
    emptyFavSubtitle: '홈 화면에서 영화를 탐색하고 하트 아이콘을 눌러 나만의 보관함을 만들어 보세요.',
    emptyWatchLaterTitle: '나중에 볼 영화 목록이 비어 있습니다',
    emptyWatchLaterSubtitle: '다음 무비 나이트를 위해 관심 영화를 북마크해 보세요.',
    emptyWatchedTitle: '시청한 영화 기록이 없습니다',
    emptyWatchedSubtitle: '감상한 영화를 시청 완료로 표시하고 기록을 남겨보세요.',
    exploreMoviesBtn: '영화 둘러보기',

    // Watchlist Actions
    addToWatchLater: '나중에 볼 영화에 추가',
    removeFromWatchLater: '나중에 볼 목록에서 삭제',
    markAsWatched: '시청 완료로 표시',
    unmarkWatched: '시청 완료 해제',

    // Auth View
    welcomeTitle: '무비 MUBI에 오신 것을 환영합니다',
    loginSubtitle: '로그인하여 보관된 즐겨찾기 목록에 액세스하세요',
    registerSubtitle: '새 계정을 만들고 영화 컬렉션을 시작하세요',
    loginBtn: '로그인',
    registerBtn: '계정 생성',
    emailLabel: '이메일 주소',
    emailPlaceholder: 'name@example.com',
    passwordLabel: '비밀번호',
    passwordPlaceholder: '••••••••',
    loggingIn: '로그인 중...',
    registering: '계정 생성 중...',

    // Movie Cards & Modal
    addToFavourites: '즐겨찾기에 추가',
    removeFromFavourites: '즐겨찾기에서 삭제',
    movieType: '영화',
    seriesType: '시리즈',

    // Details Modal
    modalDirector: '감독',
    modalWriter: '각본',
    modalCast: '출연진',
    modalPlot: '줄거리',
    modalAwards: '수상 내역',
    modalBoxOffice: '박스오피스',
    modalRating: 'IMDb 평점',
    modalMetascore: '메타스코어',
    modalRuntime: '상영시간',
    modalGenre: '장르',
    modalClose: '닫기',
    loadingDetails: '영화 상세 정보를 불러오는 중입니다...',

    // AI Assistant & Randomizer
    aiTriggerTitle: '무비 AI & 룰렛',
    aiWidgetHeader: '무비 AI 시네마 어시스턴트',
    tabAiChat: 'AI 추천 채팅',
    tabRandomizer: '무비 룰렛',
    aiGreeting: '안녕하세요! 무비 AI 시네마 어시스턴트입니다. 오늘 어떤 분위기의 영화를 찾으시나요?',
    aiPromptPlaceholder: '추천받고 싶은 영화 스타일을 입력하세요 (예: 반전 SF, 한국 스릴러)...',
    chipSciFi: '🚀 반전 SF 영화',
    chipKdrama: '💖 인기 한국 영화',
    chipQuick: '⏱️ 90분 이내 깔끔한 영화',
    chipWatchlist: '🔖 내 나중에 볼 목록에서 추천',
    randomizerTitle: '오늘 밤 뭐 볼까?',
    randomizerSubtitle: '무비 룰렛이 최고의 영화를 골라드립니다!',
    randomizerSourceLabel: '룰렛 출처 선택:',
    sourceWatchLater: '내 나중에 볼 영화 목록',
    sourceTrending: '인기 트렌딩 영화',
    sourceGenre: '랜덤 명작 & 블록버스터',
    spinBtn: '🎲 룰렛 돌리기',
    spinning: '룰렛 돌리는 중...',
    viewMovieDetails: '영화 상세 정보 보기',
    spinAgain: '다시 돌리기',
    emptyRandomizerWatchlist: '나중에 볼 목록이 비어 있습니다. 관심 영화를 보관함에 추가하거나 인기 트렌딩 영화를 선택해 보세요!',
    botThinking: '무비 AI가 최적의 영화를 분석하는 중입니다...',
  },
};

export type TranslationKey = keyof typeof translations.en;

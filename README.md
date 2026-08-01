# MUBI - 무비 🎬

> **Mubi - 무비** is a cyber-minimalist, AI-powered cinema platform designed to help users discover, organize, and get personalized recommendations for movies, TV series, and anime. Built with React, TypeScript, Firebase Realtime Database, and Kokonut UI-inspired Liquid Glass aesthetics.

---

## ✨ Features

### 🔍 1. Realtime Cinema Search & Category Discovery
- **Multi-Genre Filter Bar**: Filter films instantly by *🔥 Trending*, *⚡ Action*, *🚀 Sci-Fi*, *💖 K-Drama*, *🧙 Fantasy*, *👻 Horror*, *🎨 Animation*, and *🏆 Classics*.
- **Live Search**: Query millions of titles powered by the OMDB API.
- **Detailed Movie Modals**: View full synopsis, IMDb ratings, director, cast, box office earnings, metascore, and awards.

### 🤖 2. Mubi AI Cinema Assistant (`무비 AI 어시스턴트`)
- **Interactive Conversational AI**: Asks users for their mood or criteria and responds with tailored movie recommendations.
- **Quick Prompt Chips**: 1-click recommendations for *🚀 Mind-bending Sci-Fi*, *💖 Top K-Drama*, *⏱️ Under 90 Mins*, or *🔖 Pick from Watch Later*.
- **Embedded Recommendation Cards**: Instant preview cards inside AI chat bubbles with direct access to full movie details.

### 🎲 3. Movie Roulette (`무비 룰렛`)
- **Randomizer Wheel**: Helps indecisive viewers pick a movie for tonight.
- **Custom Sources**:
  - **My Watch Later List**: Selects from the user's saved watchlist.
  - **Popular Trending Hits**: Pulls acclaimed trending films.
  - **Random Classics & Blockbusters**: Picks surprise hit titles.

### 📚 4. 3-Tiered Personal Library
- **Synced Realtime Collections**:
  - ❤️ **Favourites**: Saved favorite films.
  - 🔖 **Watch Later**: Bookmarked movies saved for upcoming movie nights.
  - ✅ **Watched**: Completed films tracking your cinema journey.
- **Kokonut UI Liquid Glass Tabs**: Multi-list library view with tab switching and empty state actions.

### 🌐 5. Bilingual Support (EN / KO)
- Seamless internationalization engine supporting **English** and **Korean (한국어)** across all views, empty states, modals, and AI assistant dialogues.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Core** | React 18, TypeScript, Vite |
| **Architecture** | MVVM (Model-View-ViewModel) Pattern |
| **Authentication** | Firebase Auth (Email/Password) |
| **Database** | Firebase Realtime Database |
| **External API** | OMDB Movie API |
| **Icons & UI** | Lucide React, Kokonut UI Liquid Refraction Glass Tokens |
| **Routing** | React Router DOM v6 |

---

## 🗄️ Database Architecture

Data is scoped per user under `users/{userId}/` to ensure isolation and realtime reactivity:

```json
users/
  {userId}/
    favourites/
      {imdbID}: { "imdbID": "tt1375666", "title": "Inception", "year": "2010", "poster": "...", "type": "movie" }
    watchLater/
      {imdbID}: { "imdbID": "tt0816692", "title": "Interstellar", "year": "2014", "poster": "...", "type": "movie" }
    watched/
      {imdbID}: { "imdbID": "tt6751668", "title": "Parasite", "year": "2019", "poster": "...", "type": "movie" }
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 2. Clone Repository
```bash
git clone https://github.com/NotDumbj/Mubi.git
cd Mubi
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env` file in the root directory and populate it with your OMDB & Firebase keys (refer to `.env.example`):

```env
VITE_OMDB_API_KEY=your_omdb_api_key

VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_DATABASE_URL=your_firebase_database_url
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 6. Production Build
```bash
npm run build
```

---

## 📝 License

Distributed under the MIT License.

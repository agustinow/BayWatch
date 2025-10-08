# 🌊 BayWatch

<div align="center">
  <img src="./assets/icons/icon.png" alt="BayWatch Logo" width="200"/>

  <p><strong>Stream movies and TV shows through torrents - Free, Open Source, No Subscriptions</strong></p>

  [![React Native](https://img.shields.io/badge/React%20Native-0.76+-61DAFB?style=flat&logo=react)](https://reactnative.dev/)
  [![Expo](https://img.shields.io/badge/Expo-SDK%2052-000020?style=flat&logo=expo)](https://expo.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
</div>

---

## 🎬 What is BayWatch?

BayWatch is a free, open-source React Native streaming app that lets you watch movies and TV shows via torrents. Inspired by Stremio and powered by Torrentio, BayWatch provides a beautiful interface for discovering and streaming content through your own torrent sources.

**Key Features:**
- 🧑‍💻 [My own updated and improved fork](https://github.com/agustinow/react-native-torrent-streamer) of React Native Torrent Streamer. A magnet-to-http streamer built using torrentlib
- 🎥 Browse popular movies with rich metadata from TMDB
- 🔍 Advanced search with instant results
- 🧲 Magnet fetch integration via Torrentio API
- 📱 Native Android app (iOS coming soon)
- 📄 Webapp (coming soon)
- 🎨 Beautiful dark mode UI with smooth animations
- 🚀 Sequential torrent downloading for instant streaming
- 🔒 Privacy-first: No accounts, no tracking, no data collection

---

## ✨ Features

### Implemented ✅
- **Movie Discovery**: Browse popular and top-rated movies from TMDB
- **Infinite Scroll**: Seamless pagination with loading skeletons
- **Search**: Real-time search with debouncing and instant results
- **Movie Details**: Rich detail pages with backdrop, poster, overview, and ratings
- **Torrent Integration**: Fetch torrent streams from Torrentio with metadata parsing
- **Stream Selection**: View available streams with:
  - 👤 Seeders count
  - 💾 File size
  - ⚙️ Source (1337x, RARBG, YTS, etc.)
  - 🇬🇧 Languages (with flag emojis)
  - 🎬 Quality (4K, 1080p, 720p, CAM, etc.)
- **Magnet URI Generation**: Build magnet links with 20+ trackers
- **Dark Mode**: Native dark theme with NativeWind
- **Smooth Animations**: Reanimated entrance and interaction animations

### In Progress 🚧
- **Video Player**: Integrated player with playback controls
- **TV Shows Support**: Series and episodes
- **Favorites & Watchlist**: Save content for later

---

## 🏗️ Architecture

BayWatch follows **Clean Architecture** principles with clear separation of concerns:

```
stremix/
├── api/                    # External API clients
│   ├── tmdb/              # TMDB API (movie metadata)
│   │   ├── client.ts      # Axios-based API calls
│   │   └── types/         # TMDB response types
│   └── torrentio/         # Torrentio API (torrent streams)
│       ├── client.ts      # Stream fetching + magnet generation
│       └── types/         # Stream types
├── domain/                # Business logic & domain models
│   ├── types/             # Domain entities (Movie, Stream)
│   └── repositories/      # Data transformation layer
│       ├── movieRepository.ts
│       └── streamRepository.ts
├── components/            # Reusable UI components
│   ├── MovieCard.tsx      # Animated movie card
│   ├── MovieSection.tsx   # Horizontal scrollable section
│   ├── StreamCard.tsx     # Torrent stream display
│   └── VideoPlayer.tsx    # Video playback component
├── app/                   # Expo Router file-based routing
│   ├── (drawer)/          # Main navigation
│   ├── movie/[id].tsx     # Movie detail screen
│   ├── search.tsx         # Search screen
│   └── player.tsx         # Video player screen
├── contexts/              # React contexts
│   └── ThemeContext.tsx   # Theme management
└── constants/             # App constants & config
    └── colors.ts          # Tailwind color definitions
```

### Data Flow

```
User Action
    ↓
UI Component
    ↓
Repository (domain/repositories/)
    ↓
API Client (api/tmdb/ or api/torrentio/)
    ↓
External API
    ↓
Response → API Types → Domain Types → UI
```

---

## 🛠️ Technology Stack

- **Framework**: [React Native](https://reactnative.dev/) 0.76+ with [Expo](https://expo.dev/) SDK 52
- **Language**: [TypeScript](https://www.typescriptlang.org/) 5.0+
- **Styling**: [NativeWind](https://www.nativewind.dev/) v4 (Tailwind CSS for React Native)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) (file-based routing)
- **Animations**: [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) 3.x
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Video Playback**: [Expo AV](https://docs.expo.dev/versions/latest/sdk/av/)
- **Icons**: [Expo Vector Icons](https://icons.expo.fyi/) (MaterialCommunityIcons)

### APIs & Services
- **TMDB API**: Movie metadata, posters, ratings, descriptions
- **Torrentio API**: Torrent stream discovery with metadata
- **Torrent Streaming**: https://github.com/agustinow/react-native-torrent-streamer

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18 or higher
- **npm** or **yarn**
- **Expo CLI**: `npm install -g expo-cli`
- **Android Studio**: For Android development
- **TMDB API Key**: Get free key at [themoviedb.org](https://www.themoviedb.org/settings/api)

### Installation

```bash
# Clone the repository
git clone https://github.com/agustinow/stremix.git
cd stremix

# Install dependencies
npm install

# Create environment file
echo "EXPO_PUBLIC_TMDB_API_KEY=your_api_key_here" > .env

# Prebuild native code (required for expo-dev-client)
npx expo prebuild

# Start development server
npx expo start --dev-client
```

### Running the App

```bash
# Android (requires expo-dev-client)
npx expo run:android

# Build development client
eas build --profile development --platform android

# Production build
eas build --profile production --platform android
```

**Note**: This app uses **expo-dev-client**, NOT Expo Go, due to native modules.

---

## 📖 How It Works

### 1. Movie Discovery
- Browse movies from TMDB API (popular, top-rated)
- Infinite scroll pagination loads more as you scroll
- Beautiful cards with posters, ratings, and titles

### 2. Search
- Real-time search with 500ms debouncing
- Search across TMDB's extensive movie database
- Instant clear button to reset search

### 3. Movie Details
- Tap any movie to see full details
- Large backdrop image with poster overlay
- Overview, rating, release year, and IMDB ID
- Automatically fetches available torrent streams

### 4. Stream Selection
- View all available torrent sources
- Metadata includes:
  - **Seeders** (👤): Higher = faster download
  - **File size** (💾): Know what you're downloading
  - **Source** (⚙️): 1337x, RARBG, YTS, ThePirateBay, etc.
  - **Languages** (🇬🇧🇪🇸🇫🇷): Audio/subtitle languages
  - **Quality**: 4K, 2160p, 1080p, 720p, 480p, CAM, etc.

### 5. Streaming
- Tap a stream to generate magnet URI
- Currently opens in external torrent app (Flud, LibreTorrent)
- **Coming Soon**: Native sequential downloading + local HTTP streaming

### Torrent Flow

```
User selects movie
    ↓
Fetch IMDB ID from TMDB
    ↓
Query Torrentio API: /stream/movie/{imdb_id}.json
    ↓
Parse emoji-encoded metadata (👤💾⚙️🇬🇧)
    ↓
Generate magnet URI with 20+ trackers
    ↓
Start native torrent streamer
    ↓
Return local URL: http://127.0.0.1:PORT/stream
    ↓
Play in Video component
```

---

## 🧪 Development

### Project Structure

```bash
# Main entry point
app/_layout.tsx         # Root layout with theme provider

# Navigation
app/(drawer)/           # Drawer navigation (currently unused)
app/index.tsx          # Home screen (popular movies)
app/search.tsx         # Search screen
app/movie/[id].tsx     # Dynamic movie detail screen
app/player.tsx         # Video player modal

# API Layer
api/tmdb/client.ts     # TMDB API client
api/torrentio/client.ts # Torrentio API client

# Domain Layer
domain/repositories/movieRepository.ts   # TMDB → Domain mapping
domain/repositories/streamRepository.ts  # Torrentio parsing

# UI Components
components/MovieCard.tsx      # Movie card with animations
components/MovieSection.tsx   # Horizontal FlatList section
components/StreamCard.tsx     # Stream info display
```

### Key Files

**API Client (TMDB)**
```typescript
// api/tmdb/client.ts
export const tmdbClient = {
    async getPopular(page: number) {
        return axiosInstance.get('/movie/popular', {
            params: { page } // Must be object!
        });
    },
    async getMovieDetails(movieId: number) {
        return axiosInstance.get(`/movie/${movieId}`, {
            params: { append_to_response: 'external_ids' }
        });
    }
};
```

**Stream Repository (Torrentio Parser)**
```typescript
// domain/repositories/streamRepository.ts
function parseStreamTitle(title: string) {
    const seedersMatch = title.match(/👤\s*(\d+)/);
    const sizeMatch = title.match(/💾\s*([\d.]+\s*[A-Z]+)/);
    const sourceMatch = title.match(/⚙️\s*([^\n]+)/);
    const languageFlags = title.match(/🇬🇧|🇮🇹|🇫🇷|🇪🇸/g);
    // ...
}
```

**Magnet Generation**
```typescript
// api/torrentio/client.ts
generateMagnetUri(infoHash: string, title: string): string {
    const trackers = [
        'udp://tracker.opentrackr.org:1337/announce',
        'udp://open.demonii.com:1337/announce',
        // ... 20+ trackers for maximum peer discovery
    ];
    return `magnet:?xt=urn:btih:${infoHash}&dn=${encodeURIComponent(title)}&${trackerParams}`;
}
```

---

## ⚖️ Legal Disclaimer

**IMPORTANT**: BayWatch is a media player and torrent client interface. It does not:
- ❌ Host any content
- ❌ Provide content sources
- ❌ Distribute copyrighted material
- ❌ Index torrents

**Users are solely responsible for:**
- ✅ The torrent sources they access
- ✅ The content they download and stream
- ✅ Compliance with their local laws
- ✅ Respecting copyright and intellectual property rights

The developers of BayWatch do not condone piracy. This tool is designed for streaming legally obtained content, public domain works, and Creative Commons media.

---

## 🗺️ Roadmap

### Phase 1: Foundation ✅
- [x] TMDB integration
- [x] Movie browsing with pagination
- [x] Search functionality
- [x] Movie detail screens
- [x] Dark mode theme

### Phase 2: Torrent Integration ✅
- [x] Torrentio API integration
- [x] Stream metadata parsing
- [x] Magnet URI generation
- [x] Stream selection UI

### Phase 3: Streaming (In Progress) 🚧
- [x] Fix/modernize react-native-torrent-streamer
- [x] Sequential torrent downloading
- [x] Local HTTP server
- [x] Integrated video player
- [x] Playback controls
- [ ] Polishing

### Phase 4: Enhancement 📋
- [ ] TV Shows & Episodes
- [ ] Subtitles support (OpenSubtitles API)
- [ ] Favorites & Watchlist
- [ ] Continue watching
- [ ] Download management

### Phase 5: Polish 🎨
- [ ] Web support
- [ ] iOS support
- [ ] Animated splash screen
- [ ] App icon refinement
- [ ] Settings screen (OpenSubtitles API KEY, WiFi, theming, etc.)
- [ ] Language preferences (default subtitles)

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **[TMDB](https://www.themoviedb.org/)**: Movie metadata and images
- **[Torrentio](https://torrentio.strem.fun/)**: Torrent stream aggregation
- **[Stremio](https://www.stremio.com/)**: Inspiration and architecture reference
- **[libtorrent4j / libtorrent](libtorrent4j.org)**: Torrent client library
- **React Native Community**: Amazing open-source ecosystem
- **Expo Team**: Making React Native development a joy

---

<div align="center">
  <p>Built with ❤️ using React Native and Expo</p>
  <p><strong>Stream Responsibly. Respect Copyright.</strong></p>
</div>

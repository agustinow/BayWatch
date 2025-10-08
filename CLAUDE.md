# BayWatch Development Guide

## Project Overview
BayWatch is a React Native streaming app that allows users to watch movies and TV shows through torrents. Inspired by Stremio and powered by Torrentio API.

## Architecture

### Tech Stack
- **Framework**: React Native 0.76+ with Expo SDK 52
- **Language**: TypeScript 5.0+
- **Styling**: NativeWind v4 (Tailwind for React Native)
- **Navigation**: Expo Router (file-based)
- **Video**: react-native-video
- **Torrent Streaming**: [react-native-torrent-streamer](https://github.com/agustinow/react-native-torrent-streamer) (custom fork using libtorrent)

### Data Flow

```
User selects movie
    ↓
Fetch IMDB ID from TMDB API
    ↓
Query Torrentio API: /stream/movie/{imdb_id}.json
    ↓
Parse emoji-encoded metadata (👤💾⚙️🇬🇧)
    ↓
Filter & order streams by quality/seeders/size
    ↓
Generate magnet URI with 20+ trackers
    ↓
Pass to react-native-torrent-streamer
    ↓
Torrent streamer creates local HTTP server
    ↓
Returns local URL: http://127.0.0.1:PORT/stream
    ↓
Play in react-native-video component
```

### Project Structure

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
│   ├── StreamCard.tsx     # Torrent stream display
│   └── VideoPlayer.tsx    # Video playback component
├── app/                   # Expo Router file-based routing
│   ├── (drawer)/          # Main navigation
│   ├── movie/[id].tsx     # Movie detail screen
│   ├── search.tsx         # Search screen
│   └── player.tsx         # Video player screen
└── contexts/              # React contexts
    └── ThemeContext.tsx   # Theme management
```

## Key Implementation Details

### Stream Metadata Parsing
Torrentio API returns streams with emoji-encoded metadata in titles:
- 👤 = Seeders count
- 💾 = File size
- ⚙️ = Source (1337x, RARBG, YTS, etc.)
- 🇬🇧🇪🇸🇫🇷 = Language flags

Parser in `domain/repositories/streamRepository.ts` extracts this metadata.

### Magnet URI Generation
Located in `api/torrentio/client.ts`:
```typescript
generateMagnetUri(infoHash: string, title: string): string {
    const trackers = [
        'udp://tracker.opentrackr.org:1337/announce',
        'udp://open.demonii.com:1337/announce',
        // ... 20+ trackers
    ];
    return `magnet:?xt=urn:btih:${infoHash}&dn=${encodeURIComponent(title)}&${trackerParams}`;
}
```

### Torrent Streaming
Using custom fork of react-native-torrent-streamer:
- Built on libtorrent
- Sequential downloading for instant playback
- Creates local HTTP server on device
- Returns streamable URL to react-native-video

## Legal Framework

BayWatch does NOT:
- ❌ Host any content
- ❌ Provide content sources
- ❌ Distribute copyrighted material
- ❌ Index torrents

Users are solely responsible for:
- ✅ Torrent sources they access
- ✅ Content they download/stream
- ✅ Compliance with local laws
- ✅ Copyright/IP rights respect

**Disclaimer**: This tool is designed for legally obtained content, public domain works, and Creative Commons media.

## Development Guidelines

- All code must be TypeScript
- Use React Native compatible packages only
- Follow Clean Architecture principles
- Keep separation between API, Domain, and UI layers
- Maintain legal disclaimers prominently

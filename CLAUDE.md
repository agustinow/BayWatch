# Stremix Development Guide

## Project Overview
Stremix is a React Native streaming app that allows users to watch content through their own torrent sources, inspired by Stremio and Torrentio.

## Architecture Decision: Porting Torrentio to React Native

### Source Repository
- **Original:** [torrentio-scraper](https://github.com/TheBeastLT/torrentio-scraper)
- **License:** Apache 2.0
- **Approach:** Port core functionality to React Native/TypeScript

### What to Port

#### ✅ **Can Be Ported (Client-Side Logic)**

1. **Magnet URI Generation** (`addon/lib/magnetHelper.js`)
   - Create magnet links from infohash + trackers
   - Tracker management (anime, Russian, general)
   - Can work entirely client-side

2. **Stream Formatting** (`addon/lib/streamInfo.js`)
   - Parse torrent titles with `parse-torrent-title`
   - Format stream metadata (quality, size, languages)
   - Binge group logic
   - Subtitle mapping

3. **Filtering Logic** (`addon/lib/filter.js`)
   - Quality filters (4K, 1080p, CAM/SCR blocking)
   - Size filters
   - Provider filtering
   - Language filtering

4. **Sorting Logic** (`addon/lib/sort.js`)
   - Sort by seeders, quality, size
   - Custom sorting preferences

5. **Configuration** (`addon/lib/configuration.js`)
   - Parse user preferences
   - Pre-configured profiles (Lite, Brazuca)

6. **Utility Functions**
   - Title parsing (`addon/lib/titleHelper.js`)
   - Language mapping (`addon/lib/languages.js`)
   - Extension detection (`addon/lib/extension.js`)

#### ❌ **Cannot Port Directly (Need Alternatives)**

1. **Database Layer** (`addon/lib/repository.js`)
   - Original: PostgreSQL + Sequelize
   - **Solution:**
     - Use Torrentio's public API for data
     - OR use local storage (SQLite/AsyncStorage) for caching
     - OR implement own scraping with different storage

2. **Server Components**
   - Express routes (`addon/serverless.js`)
   - Rate limiting
   - **Solution:** Not needed - Stremix is client-only

3. **Debrid Service Integration** (`addon/moch/`)
   - RealDebrid, Premiumize, etc.
   - **Solution:** CAN be ported - these use REST APIs (axios works in RN)

### Implementation Plan

#### Phase 1: Core Utilities
```typescript
// services/torrentio/
├── magnetHelper.ts      // Port from magnetHelper.js
├── streamFormatter.ts   // Port from streamInfo.js
├── filters.ts          // Port from filter.js
├── sorting.ts          // Port from sort.js
├── titleParser.ts      // Port from titleHelper.js
└── types.ts           // TypeScript definitions
```

#### Phase 2: Data Layer
```typescript
// services/torrentio/
├── api.ts             // Fetch from public Torrentio API
├── cache.ts           // Local caching with AsyncStorage
└── config.ts          // User configuration management
```

#### Phase 3: Debrid Integration (Optional)
```typescript
// services/debrid/
├── realdebrid.ts
├── premiumize.ts
├── alldebrid.ts
└── types.ts
```

### Dependencies Needed

```json
{
  "dependencies": {
    "parse-torrent-title": "^2.x", // Parse torrent titles
    "axios": "^1.x",                // HTTP requests
    "@react-native-async-storage/async-storage": "^1.x" // Local storage
  }
}
```

### Magnet URI Generation (Example)

```typescript
// From torrentio stream object to magnet URI
interface TorrentioStream {
  infoHash: string;
  title: string;
  sources?: string[];
}

function generateMagnet(stream: TorrentioStream): string {
  const infoHash = stream.infoHash;
  const name = encodeURIComponent(stream.title);

  // Extract trackers from sources
  const trackers = stream.sources
    ?.filter(s => s.startsWith('tracker:'))
    .map(s => s.replace('tracker:', ''))
    .map(t => `&tr=${encodeURIComponent(t)}`)
    .join('') || '';

  return `magnet:?xt=urn:btih:${infoHash}&dn=${name}${trackers}`;
}
```

### Legal Considerations

**Important:** Stremix follows the same legal framework as Torrentio:
- ✅ Tool is neutral technology
- ✅ No content hosting
- ✅ User provides sources
- ✅ Metadata aggregation only
- ⚠️ User responsible for legal compliance

**Disclaimer in app:**
> "Stremix does not host, provide, or distribute any content. Users are solely responsible for the sources they configure and content they access."

### Data Flow

```
User searches "Avengers"
    ↓
Query Torrentio API: /stream/movie/tt0848228.json
    ↓
Receive stream metadata (infohash, title, seeders, etc.)
    ↓
Client-side: Filter by quality/language/size
    ↓
Client-side: Sort by seeders/quality
    ↓
Generate magnet URI from infohash + trackers
    ↓
Option 1: Send to debrid service → Get HTTP stream URL
Option 2: Send magnet to device's torrent player
    ↓
Stream content
```

### Next Steps

1. **Create service layer structure**
   ```bash
   mkdir -p services/torrentio services/debrid
   ```

2. **Port magnetHelper first** (simplest, self-contained)

3. **Test with mock data** from Torrentio API responses

4. **Add filtering/sorting UI** in app

5. **Integrate debrid services** (optional premium feature)

6. **Add local scraping** (advanced - requires own indexing)

## Development Notes

- All ported code should be TypeScript
- Use React Native compatible packages only
- Document any deviations from original implementation
- Keep legal disclaimers prominent

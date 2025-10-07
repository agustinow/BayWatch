# React Native Torrent Streamer - Fix Context

## Original Library
- **Repo**: https://github.com/ghondar/react-native-torrent-streamer
- **Last Updated**: 2020 (5 years old, unmaintained)
- **Version**: 0.2.3
- **License**: MIT
- **Platform**: Android only

## Current Stremix Project Details

### App Info
- **Name**: BayWatch (slug) / Stremix (internal)
- **Package**: com.agustinow.baywatch
- **Tech Stack**: React Native + Expo (expo-dev-client, NOT Expo Go)
- **Minimum SDK**: Android 26
- **React Native**: Latest with new architecture enabled

### How Stremix Works
1. User searches for movies via TMDB API
2. App gets IMDB ID from TMDB
3. Fetches torrent streams from Torrentio API using IMDB ID
4. Parses stream metadata (seeders, size, quality, languages)
5. Generates magnet URI with extensive tracker list
6. **NEEDS**: Stream torrent locally with sequential download + local HTTP server
7. Play video in expo-av Video component from local URL (http://127.0.0.1:PORT/stream)

### Magnet URI Generation
```typescript
// From api/torrentio/client.ts
generateMagnetUri(infoHash: string, title: string): string {
    const defaultTrackers = [
        'udp://tracker.opentrackr.org:1337/announce',
        'udp://public.demonoid.ch:6969/announce',
        // ... 20+ more trackers
    ];
    const trackerParams = defaultTrackers.map(t => `tr=${encodeURIComponent(t)}`).join('&');
    return `magnet:?xt=urn:btih:${infoHash}&dn=${encodeURIComponent(title)}&${trackerParams}`;
}
```

### Current VideoPlayer Component
```typescript
// components/VideoPlayer.tsx - Currently opens external torrent app
export default function VideoPlayer({ uri, onClose }: VideoPlayerProps) {
    const openMagnet = async () => {
        const canOpen = await Linking.canOpenURL(uri);
        if (canOpen) {
            await Linking.openURL(uri); // Opens in Flud/LibreTorrent
        }
    };
    // ... rest of component
}
```

## What We Need From react-native-torrent-streamer

### Required Functionality
1. **Sequential Downloading**: Download torrent pieces from beginning to end (for streaming)
2. **Local HTTP Server**: Serve video file on localhost while downloading
3. **Progress Events**: Emit download progress, seeders, peers, speed
4. **File Selection**: Auto-select largest file (video) from torrent
5. **Stream URL**: Return local URL like `http://127.0.0.1:8080/stream`

### Expected API
```javascript
import TorrentStreamer from 'react-native-torrent-streamer';

// Start streaming
TorrentStreamer.start(magnetUri)
    .then(({ url, fileName, fileSize }) => {
        // url: http://127.0.0.1:PORT/stream
        // Play this URL in expo-av Video component
    });

// Listen to progress
TorrentStreamer.addEventListener('progress', (data) => {
    // { progress: 0.0-1.0, downloadRate, numSeeds, numPeers }
});

// Stop streaming
TorrentStreamer.stop();
```

## Known Issues With Old Library (Likely)

1. **Build Configuration**: Old Gradle syntax, outdated Android build tools
2. **React Native Compatibility**: Built for RN 0.60, now we're on 0.76+
3. **New Architecture**: Needs TurboModules/Fabric support for RN new arch
4. **Kotlin Migration**: Might be Java, should modernize to Kotlin
5. **Libtorrent Version**: Likely using old libtorrent4j
6. **Dependencies**: NanoHTTPD or similar might be outdated
7. **Permissions**: Android 11+ scoped storage requirements

## Integration Plan After Fix

### 1. Install Fixed Package
```bash
npm install your-fixed-torrent-streamer
npx expo prebuild --clean
```

### 2. Update VideoPlayer Component
```typescript
import TorrentStreamer from 'react-native-torrent-streamer';
import { Video } from 'expo-av';

export default function VideoPlayer({ uri, onClose }: VideoPlayerProps) {
    const [streamUrl, setStreamUrl] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        TorrentStreamer.start(uri).then(({ url }) => {
            setStreamUrl(url);
        });

        TorrentStreamer.addEventListener('progress', (data) => {
            setProgress(data.progress);
        });

        return () => TorrentStreamer.stop();
    }, [uri]);

    if (!streamUrl || progress < 0.05) {
        return <ActivityIndicator />;
    }

    return <Video source={{ uri: streamUrl }} />;
}
```

### 3. Add Permissions to AndroidManifest.xml
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

## Testing Plan

1. **Test with small magnet**: Find a legal/open-source torrent (like Ubuntu ISO)
2. **Test sequential download**: Verify pieces downloaded in order
3. **Test streaming**: Video should start playing before 100% downloaded
4. **Test seeking**: HTTP range requests should work for video seeking
5. **Test cleanup**: Stop should remove temp files
6. **Test multiple streams**: Start new stream while one is active

## Reference: How Stremio Does It
- Uses **libtorrent** C++ library
- **Sequential mode**: Sets piece priorities (first pieces = high priority)
- **Local server**: NanoHTTPD or similar on random port
- **HTTP Range Support**: For video seeking (byte-range requests)
- **File selection**: Finds largest file in torrent automatically

## Important Notes
- Users are responsible for legal compliance (app has disclaimer)
- No content hosting - only torrents user provides
- Sequential downloading is key for streaming experience
- Must support HTTP range requests for video seeking
- Clean up temp files on stop/error to save storage

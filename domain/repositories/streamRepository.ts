import {TorrentioStream} from "@/api/torrentio/types/stream";
import {Stream} from "@/domain/types/stream";
import {torrentioClient} from "@/api/torrentio/client";

/**
 * Parse stream title to extract metadata
 * Title format: "War Of The Worlds 2025...\n👤 38 💾 11.27 GB ⚙️ 1337x\nMulti Audio / 🇬🇧 / 🇮🇹"
 */
function parseStreamTitle(title: string): {
    seeders?: number;
    size?: string;
    source?: string;
    languages?: string[];
} {
    const result: ReturnType<typeof parseStreamTitle> = {};

    // Extract seeders (👤 38)
    const seedersMatch = title.match(/👤\s*(\d+)/);
    if (seedersMatch) {
        result.seeders = parseInt(seedersMatch[1]);
    }

    // Extract size (💾 11.27 GB)
    const sizeMatch = title.match(/💾\s*([\d.]+\s*[A-Z]+)/);
    if (sizeMatch) {
        result.size = sizeMatch[1];
    }

    // Extract source (⚙️ 1337x)
    const sourceMatch = title.match(/⚙️\s*([^\n]+)/);
    if (sourceMatch) {
        result.source = sourceMatch[1].trim();
    }

    // Extract languages (🇬🇧 / 🇮🇹)
    const languageFlags = title.match(/🇬🇧|🇮🇹|🇫🇷|🇪🇸|🇵🇱|🇵🇹|🇲🇽/g);
    if (languageFlags) {
        result.languages = [...new Set(languageFlags)]; // Remove duplicates
    }

    return result;
}

/**
 * Extract quality from stream name
 * Name format: "Torrentio\n4k HDR" or "Torrentio\n1080p"
 */
function parseQuality(name: string): string {
    const parts = name.split('\n');
    return parts[1] || 'Unknown';
}

/**
 * Transform Torrentio stream to domain Stream model
 */
function mapTorrentioStream(torrentioStream: TorrentioStream): Stream {
    const parsed = parseStreamTitle(torrentioStream.title);
    const quality = parseQuality(torrentioStream.name);

    // Get clean title (first line before metadata)
    const cleanTitle = torrentioStream.title.split('\n')[0];

    const stream = {
        infoHash: torrentioStream.infoHash,
        quality,
        title: cleanTitle,
        size: parsed.size,
        seeders: parsed.seeders,
        source: parsed.source,
        languages: parsed.languages,
        filename: torrentioStream.behaviorHints?.filename,
        magnetUri: torrentioClient.generateMagnetUri(
            torrentioStream.infoHash,
            torrentioStream.behaviorHints?.filename || cleanTitle
        ),
        ratio: 0, // Will be calculated below
    };

    // Calculate peer/size ratio
    stream.ratio = calculateRatio(stream);

    return stream;
}

/**
 * Parse size string to bytes for comparison
 */
function parseSize(sizeStr?: string): number {
    if (!sizeStr) return 0;
    const match = sizeStr.match(/(\d+\.?\d*)\s*(GB|MB|KB)/i);
    if (!match) return 0;
    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();
    const multipliers: Record<string, number> = {
        'KB': 1024,
        'MB': 1024 * 1024,
        'GB': 1024 * 1024 * 1024
    };
    return value * (multipliers[unit] || 0);
}

/**
 * Calculate peer/size ratio (higher is better)
 */
function calculateRatio(stream: Stream): number {
    const sizeBytes = parseSize(stream.size);
    const seeders = stream.seeders || 0;
    // Convert to GB for ratio calculation
    return sizeBytes > 0 ? (seeders / (sizeBytes / (1024 * 1024 * 1024))) : seeders;
}

/**
 * Remove duplicate streams by infoHash, keeping the one with best peer/size ratio
 */
function deduplicateStreams(streams: Stream[]): Stream[] {
    const streamsByHash = new Map<string, Stream>();

    for (const stream of streams) {
        const existing = streamsByHash.get(stream.infoHash);

        if (!existing) {
            streamsByHash.set(stream.infoHash, stream);
        } else {
            // Keep the stream with better peer/size ratio
            const existingRatio = calculateRatio(existing);
            const currentRatio = calculateRatio(stream);

            if (currentRatio > existingRatio) {
                streamsByHash.set(stream.infoHash, stream);
            }
        }
    }

    return Array.from(streamsByHash.values());
}

export const streamRepository = {
    /**
     * Get available streams for a movie
     * @param imdbId - IMDB ID (e.g., "tt0816692")
     */
    async getMovieStreams(imdbId: string): Promise<Stream[]> {
        const response = await torrentioClient.getMovieStreams(imdbId);
        const streams = response.streams.map(mapTorrentioStream);
        return deduplicateStreams(streams);
    },

    /**
     * Get available streams for a TV show episode
     */
    async getSeriesStreams(imdbId: string, season: number, episode: number): Promise<Stream[]> {
        const response = await torrentioClient.getSeriesStreams(imdbId, season, episode);
        const streams = response.streams.map(mapTorrentioStream);
        return deduplicateStreams(streams);
    },
};
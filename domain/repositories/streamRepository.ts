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

    return {
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
    };
}

export const streamRepository = {
    /**
     * Get available streams for a movie
     * @param imdbId - IMDB ID (e.g., "tt0816692")
     */
    async getMovieStreams(imdbId: string): Promise<Stream[]> {
        const response = await torrentioClient.getMovieStreams(imdbId);
        return response.streams.map(mapTorrentioStream);
    },

    /**
     * Get available streams for a TV show episode
     */
    async getSeriesStreams(imdbId: string, season: number, episode: number): Promise<Stream[]> {
        const response = await torrentioClient.getSeriesStreams(imdbId, season, episode);
        return response.streams.map(mapTorrentioStream);
    },
};
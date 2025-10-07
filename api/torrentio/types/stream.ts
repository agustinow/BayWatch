export interface TorrentioStream {
    name: string;           // e.g., "Torrentio\n4k HDR"
    title: string;          // Full release info with seeders/size/source
    infoHash: string;       // Torrent hash
    fileIdx?: number;       // File index in multi-file torrents
    behaviorHints?: {
        bingeGroup?: string;    // e.g., "torrentio|4k|WEB-DL|hevc|10bit|HDR"
        filename?: string;      // Actual filename
    };
}

export interface TorrentioResponse {
    streams: TorrentioStream[];
    cacheMaxAge?: number;
    staleRevalidate?: number;
    staleError?: number;
}
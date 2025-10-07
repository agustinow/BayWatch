import axios from 'axios';
import { TorrentioResponse } from './types/stream';

const TORRENTIO_BASE_URL = 'https://torrentio.strem.fun';

// Configuration options
const DEFAULT_CONFIG = 'sort=qualitysize|qualityfilter=480p,scr,cam';

const axiosInstance = axios.create({
    baseURL: TORRENTIO_BASE_URL,
});

export const torrentioClient = {
    /**
     * Get streams for a movie by IMDB ID
     * @param imdbId - IMDB ID (e.g., "tt0816692")
     * @param config - Optional configuration string
     */
    async getMovieStreams(imdbId: string, config: string = DEFAULT_CONFIG): Promise<TorrentioResponse> {
        const path = config
            ? `/${config}/stream/movie/${imdbId}.json`
            : `/stream/movie/${imdbId}.json`;

        const response = await axiosInstance.get<TorrentioResponse>(path);
        return response.data;
    },

    /**
     * Get streams for a TV show episode
     * @param imdbId - IMDB ID
     * @param season - Season number
     * @param episode - Episode number
     * @param config - Optional configuration string
     */
    async getSeriesStreams(
        imdbId: string,
        season: number,
        episode: number,
        config: string = DEFAULT_CONFIG
    ): Promise<TorrentioResponse> {
        const path = config
            ? `/${config}/stream/series/${imdbId}:${season}:${episode}.json`
            : `/stream/series/${imdbId}:${season}:${episode}.json`;

        const response = await axiosInstance.get<TorrentioResponse>(path);
        return response.data;
    },

    /**
     * Generate magnet URI from infohash
     * @param infoHash - Torrent infohash
     * @param title - Torrent title/name
     */
    generateMagnetUri(infoHash: string, title: string): string {
        const defaultTrackers = [
            'udp://tracker.opentrackr.org:1337/announce',
            'udp://public.demonoid.ch:6969/announce',
            'udp://open.demonoid.ch:6969/announce',
            'udp://open.demonii.com:1337/announce',
            'udp://open-tracker.demonoid.ch:6969/announce',
            'udp://open.stealth.si:80/announce',
            'udp://explodie.org:6969/announce',
            'udp://wepzone.net:6969/announce',
            'udp://tracker2.dler.org:80/announce',
            'udp://tracker.therarbg.to:6969/announce',
            'udp://tracker.theoks.net:6969/announce',
            'udp://tracker.srv00.com:6969/announce',
            'udp://tracker.qu.ax:6969/announce',
            'udp://tracker.filemail.com:6969/announce',
            'udp://tracker.dler.org:6969/announce',
            'udp://tracker-udp.gbitt.info:80/announce',
            'udp://run.publictracker.xyz:6969/announce',
            'udp://retracker01-msk-virt.corbina.net:80/announce',
            'udp://public.tracker.vraphim.com:6969/announce',
            'udp://p4p.arenabg.com:1337/announce'
        ];

        const trackerParams = defaultTrackers
            .map(t => `tr=${encodeURIComponent(t)}`)
            .join('&');

        return `magnet:?xt=urn:btih:${infoHash}&dn=${encodeURIComponent(title)}&${trackerParams}`;
    },
};
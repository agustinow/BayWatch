export interface Stream {
    infoHash: string;
    quality: string;
    title: string;
    size?: string;
    seeders?: number;
    source?: string;
    languages?: string[];
    filename?: string;
    magnetUri?: string;
}
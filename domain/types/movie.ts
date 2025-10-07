export interface Movie {
    id: number;
    title: string;
    rating: number;
    year?: number;
    posterUrl?: string;
    backdropUrl?: string;
    overview?: string;
    imdb_id?: string;
}
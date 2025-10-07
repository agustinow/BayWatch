import { tmdbClient } from "@/api/tmdb/client";
import {TMDBMovie} from "@/api/tmdb/types/movie";
import {Movie} from "@/domain/types/movie";

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

function mapTMDBToMovie(tmdbMovie: TMDBMovie): Movie {
    return {
        id: tmdbMovie.id,
        title: tmdbMovie.title,
        rating: tmdbMovie.vote_average,
        year: tmdbMovie.release_date ? parseInt(tmdbMovie.release_date.split('-')[0]) : undefined,
        posterUrl: tmdbMovie.poster_path ? `${IMAGE_BASE_URL}${tmdbMovie.poster_path}` : undefined,
        backdropUrl: tmdbMovie.backdrop_path ? `${IMAGE_BASE_URL}${tmdbMovie.backdrop_path}` : undefined,
        overview: tmdbMovie.overview,
        imdb_id: tmdbMovie.imdb_id
    }
}

export const movieRepository = {
    async getPopular(page: number = 1): Promise<Movie[]> {
        const response = await tmdbClient.getPopular(page);
        return response.results.map(mapTMDBToMovie);
    },

    async getTopRated(): Promise<Movie[]> {
        const response = await tmdbClient.getTopRated();
        return response.results.map(mapTMDBToMovie);
    },

    async search(query: string): Promise<Movie[]> {
        const response = await tmdbClient.search(query);
        return response.results.map(mapTMDBToMovie);
    },

    async getMovie(movieId: number): Promise<Movie> {
        const response = await tmdbClient.getMovieDetails(movieId);
        return mapTMDBToMovie(response)
    }
};

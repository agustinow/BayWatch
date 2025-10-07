import { TMDBResponse, TMDBMovie } from './types/movie';
import axios, { isAxiosError } from "axios";
import { APIError, NetworkError } from '@/domain/types/errors';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = '60b5159bf050067cd25db0759cb68cda'

const axiosInstance = axios.create({
    baseURL: TMDB_BASE_URL,
    params: {
        api_key: API_KEY
    }
})

export const tmdbClient = {
    async getPopular(page: number = 1): Promise<TMDBResponse> {
        try {
            const response = await axiosInstance.get<TMDBResponse>('/movie/popular' , {
                params: { page }
            });
            return response.data;
        } catch (error) {
            if(isAxiosError(error)) {
                throw new APIError(
                    error.response?.data?.status_message || 'Failed to fetch popular movies',
                    error.response?.status,
                    error
                );
            }
            throw new NetworkError();
        }
    },

    async getTopRated(): Promise<TMDBResponse> {
        try {
            const response = await axiosInstance.get<TMDBResponse>('/movie/top_rated');
            return response.data;
        } catch (error) {
            if(isAxiosError(error)) {
                throw new APIError(
                    error.response?.data?.status_message || 'Failed to fetch top rated movies',
                    error.response?.status,
                    error
                );
            }
            throw new NetworkError();
        }
    },


    async search(query: string, page: number = 1): Promise<TMDBResponse> {
        try {
            const response = await axiosInstance.get<TMDBResponse>('/search/movie', {
                params: { query, page },
            });
            return response.data;
        } catch (error) {
            if(isAxiosError(error)) {
                throw new APIError(
                    error.response?.data?.status_message || 'Failed to fetch search result',
                    error.response?.status,
                    error
                );
            }
            throw new NetworkError();
        }
    },

    async getMovieDetails(movieId: number): Promise<TMDBMovie> {
        try {
            const response = await axiosInstance.get<TMDBMovie>(`/movie/${movieId}`);
            return response.data;
        } catch (error) {
            if(isAxiosError(error)) {
                throw new APIError(
                    error.response?.data?.status_message || 'Failed to fetch movie details',
                    error.response?.status,
                    error
                );
            }
            throw new NetworkError();
        }
    }
}
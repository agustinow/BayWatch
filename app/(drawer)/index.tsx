import { View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import {useRouter} from 'expo-router';
import "@/app/global.css"
import { useTheme } from '@/contexts/ThemeContext';
import MovieSection from "@/components/MovieSection";
import {useEffect, useState} from "react";
import {Movie} from "@/domain/types/movie";
import {movieRepository} from "@/domain/repositories/movieRepository";


const Index = () => {
    const router = useRouter();
    const scrollY = useSharedValue(0);
    const { colors } = useTheme();

    // Popular
    const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
    const [hasMoreTrending, setHasMoreTrending] = useState(true);
    const [pageTrending, setPageTrending] = useState(1);
    const [loadingTrending, setLoadingTrending] = useState(true);


    //Trending month
    const [topMovies, setTopMovies] = useState<Movie[]>([]);
    const [loadingTop, setLoadingTop] = useState(true);

    useEffect(() => {
        loadTrendingMovies();
    }, [pageTrending]);

    useEffect(() => {
        loadTopMovies();
    }, []);


    const loadTrendingMovies = async () => {
        try {
            setLoadingTrending(true);
            const popular = await movieRepository.getPopular(pageTrending);
            setPopularMovies(prev => [...prev, ...popular]);
            setHasMoreTrending(popular.length > 0);
        } catch (err) {
            //setError(err instanceof Error ? err.message : 'Failed to load movies');
            console.error('Error loading movies:', err);
        } finally {
            setLoadingTrending(false);
        }
    }

    const loadTopMovies = async () => {
        try {
            setLoadingTop(true)
            const top = await movieRepository.getTopRated();
            setTopMovies(top);
        } catch (err) {
            //setError(err instanceof Error ? err.message : 'Failed to load movies');
            console.error('Error loading movies:', err);
        } finally {
            setLoadingTop(false);
        }
    }

    const loadMoreTrending = () => {
        if (hasMoreTrending && !loadingTrending) {
            setPageTrending(prev => prev + 1);
        }
    };

    const scrollHandler = useAnimatedScrollHandler((event) => {
        scrollY.value = event.contentOffset.y;
    });

    return(
        <View className="flex-1" style={{ backgroundColor: colors.primary }}>
            <Animated.ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                contentContainerStyle={{
                    paddingBottom: 40,
                    alignItems: 'center'
                }}>
                <MovieSection
                    title="Trending"
                    movies={popularMovies}
                    onMovieSelected={(id) => router.push(`/movie/${id}` as any)}
                    loading={loadingTrending}
                    onLoadMore={() => loadMoreTrending()}
                />

                <MovieSection
                    title="Top Rated Ever"
                    movies={topMovies}
                    onMovieSelected={(id) => router.push(`/movie/${id}` as any)}
                    loading={loadingTop}
                />

            </Animated.ScrollView>
        </View>
    )
}
export default Index;
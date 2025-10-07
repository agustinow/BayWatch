import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import SearchInput from '@/components/SearchInput';
import MovieGrid from '@/components/MovieGrid';
import { movieRepository } from '@/domain/repositories/movieRepository';
import { Movie } from '@/domain/types/movie';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Search() {
    const { colors } = useTheme();
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults([]);
            setSearched(false);
            return;
        }

        try {
            setLoading(true);
            setQuery(searchQuery);
            const movies = await movieRepository.search(searchQuery);
            setResults(movies);
            setSearched(true);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1" style={{ backgroundColor: colors.primary }}>
            <View className="px-5 pt-12 pb-3">
                <View className="flex-row items-center mb-3">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="mr-3"
                    >
                        <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <SearchInput onSearch={handleSearch} />
                    </View>
                </View>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={colors.accent} />
                </View>
            ) : searched && results.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <Text style={{ color: colors.text }}>No results for "{query}"</Text>
                </View>
            ) : (
                <MovieGrid
                    movies={results}
                    onMovieSelected={(id) => router.push(`/movie/${id}` as any)}
                />
            )}
        </View>
    );
}
import {useRouter, Stack, useLocalSearchParams} from "expo-router";
import {useEffect, useRef, useState, useCallback} from "react";
import {Movie} from "@/domain/types/movie";
import {movieRepository} from "@/domain/repositories/movieRepository";
import {ActivityIndicator, View, Text, Image, TouchableOpacity, FlatList} from "react-native";
import {useTheme} from "@/contexts/ThemeContext";
import {ScrollView} from "react-native-reanimated/src/Animated";
import {LinearGradient} from "expo-linear-gradient";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {streamRepository} from "@/domain/repositories/streamRepository";
import {Stream} from "@/domain/types/stream";
import StreamCard from "@/components/StreamCard";

export default function MovieDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { colors } = useTheme();
    const [movie, setMovie] = useState<Movie | null>(null);
    const [streams, setStreams] = useState<Stream[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingStreams, setLoadingStreams] = useState(false);

    const loadMovie = useCallback(async () => {
        try {
            setLoading(true);
            const data = await movieRepository.getMovie(Number(id));
            setMovie(data);

            // Load streams if IMDB ID is available
            if (data.imdb_id) {
                setLoadingStreams(true);
                try {
                    const streamData = await streamRepository.getMovieStreams(data.imdb_id);
                    setStreams(streamData);
                } catch (error) {
                    console.error('Error loading streams:', error);
                } finally {
                    setLoadingStreams(false);
                }
            }
        } catch (error) {
            console.error('Error loading movie:', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadMovie();
    }, [loadMovie]);

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.primary }}>
                <ActivityIndicator size="large" color={colors.accent} />
            </View>
        );
    }

    if (!movie) {
        return (
            <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.primary }}>
                <Text style={{ color: colors.text }}>Movie not found</Text>
            </View>
        );
    }

    return (
        <View className="flex-1" style={{ backgroundColor: colors.primary }}>
            <Stack.Screen options={{ headerShown: false }} />
            <ScrollView className="flex-1">
                {/* Backdrop */}
                <View className="relative h-64">
                    {movie.backdropUrl && (
                        <Image
                            source={{ uri: movie.backdropUrl }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                    )}

                    {/* Back button */}
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="absolute top-12 left-4 bg-black/50 rounded-full p-2"
                    >
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>

                    <LinearGradient
                        colors={['transparent', colors.primary]}
                        className="absolute bottom-0 left-0 right-0 h-32"
                    />
                </View>

                <View className="px-5 -mt-20">
                    {/* Poster and Title */}
                    <View className="flex-row">
                        {movie.posterUrl && (
                            <Image
                                source={{ uri: movie.posterUrl }}
                                className="w-32 h-48 rounded-lg"
                                resizeMode="cover"
                            />
                        )}
                        <View className="flex-1 ml-4 justify-end pb-2">
                            <Text className="text-3xl font-bold mb-2" style={{ color: colors.text }}>
                                {movie.title}
                            </Text>
                            <View className="flex-row items-center gap-2">
                                <Text className="text-xl">⭐</Text>
                                <Text className="text-xl font-semibold" style={{ color: colors.accent }}>
                                    {movie.rating.toFixed(1)}
                                </Text>
                            </View>
                            {movie.year && (
                                <Text className="text-base mt-1" style={{ color: colors.text, opacity: 0.7 }}>
                                    {movie.year}
                                </Text>
                            )}
                        </View>
                    </View>

                    <View className="px-5 -mt-20">
                        {/* Poster and Title - keep as is */}
                        <View className="flex-row">
                            {/* ... */}
                        </View>

                        {/* Overview */}
                        <View className="mt-6">
                            <Text className="text-xl font-bold mb-3" style={{ color: colors.text }}>
                                Overview
                            </Text>
                            <Text className="text-base leading-6" style={{ color: colors.text, opacity: 0.8 }}>
                                {movie.overview || 'No overview available.'}
                            </Text>
                        </View>

                        {/* Streams - Use FlatList */}
                        <View className="mt-6 mb-10">
                            <Text className="text-xl font-bold mb-3" style={{ color: colors.text }}>
                                Available Streams {loadingStreams && '(Loading...)'}
                            </Text>

                            {loadingStreams ? (
                                <ActivityIndicator size="small" color={colors.accent} />
                            ) : streams.length > 0 ? (
                                <FlatList
                                    data={streams}
                                    keyExtractor={(item) => item.infoHash}
                                    renderItem={({ item }) => (
                                        <StreamCard
                                            stream={item}
                                            onPress={(stream) => {
                                                router.push({
                                                    pathname: '/player',
                                                    params: {
                                                        magnetUri: stream.magnetUri,
                                                        title: stream.title,
                                                    }
                                                });
                                            }}
                                        />
                                    )}
                                    scrollEnabled={false}
                                    nestedScrollEnabled={true}
                                />
                            ) : (
                                <Text style={{ color: colors.text, opacity: 0.6 }}>
                                    No streams available
                                </Text>
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
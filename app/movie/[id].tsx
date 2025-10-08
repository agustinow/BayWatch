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
    const [selectedQuality, setSelectedQuality] = useState<string>('All');

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

    // Get unique qualities from streams
    const availableQualities = ['All', ...Array.from(new Set(streams.map(s => s.quality)))];

    // Filter and sort streams by peer/size ratio
    const filteredStreams = streams
        .filter(stream => selectedQuality === 'All' || stream.quality === selectedQuality)
        .sort((a, b) => b.ratio - a.ratio); // Descending order (higher ratio is better)

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

                <View className="-mt-20">
                    {/* Poster and Title */}
                    <View className="flex-row mx-5">
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

                    <View className="">
                        {/* Overview */}
                        <View className="mt-6 mx-5">
                            <Text className="text-xl font-bold mb-3" style={{ color: colors.text }}>
                                Overview
                            </Text>
                            <Text className="text-base leading-6" style={{ color: colors.text, opacity: 0.8 }}>
                                {movie.overview || 'No overview available.'}
                            </Text>
                        </View>

                        {/* Streams - Use FlatList */}
                        <View className="mt-6 mb-10">
                            <Text className="text-xl font-bold mb-3 mx-5" style={{ color: colors.text }}>
                                Available Streams {loadingStreams && '(Loading...)'}
                            </Text>

                            {/* Quality Filter */}
                            {streams.length > 0 && (
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    className="mb-4"
                                    contentContainerClassName="px-5"
                                >
                                    {availableQualities.map((quality) => (
                                        <TouchableOpacity
                                            key={quality}
                                            onPress={() => setSelectedQuality(quality)}
                                            className="mr-2 px-4 py-2 rounded-full"
                                            style={{
                                                backgroundColor: selectedQuality === quality
                                                    ? colors.accent
                                                    : colors.secondary,
                                            }}
                                        >
                                            <Text
                                                className="font-semibold"
                                                style={{
                                                    color: selectedQuality === quality
                                                        ? '#000'
                                                        : colors.text,
                                                }}
                                            >
                                                {quality}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            )}

                            {loadingStreams ? (
                                <ActivityIndicator size="small" color={colors.accent} />
                            ) : filteredStreams.length > 0 ? (
                                <FlatList
                                    className="mx-5"
                                    data={filteredStreams}
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
                                <Text className="mx-5" style={{ color: colors.text, opacity: 0.6 }}>
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
import {View, Text} from "react-native";
import Animated from "react-native-reanimated";
import MovieCard from "@/components/MovieCard";
import MovieCardSkeleton from "@/components/MovieCardSkeleton";

interface Movie {
    id: number;
    title: string;
    rating: number;
    posterUrl?: string;
}

interface MovieSectionProps {
    title: string;
    movies: Movie[];
    onMovieSelected: (id: number) => void;
    loading?: boolean;
    onLoadMore?: () => void;
}

export default function MovieSection(props: MovieSectionProps) {
    const renderFooter = () => {
        if(!props.loading) return null;

        return (
            <View className="ml-4">
                <MovieCardSkeleton/>
            </View>
        )
    }

    return (
        <View className="w-full mt-8">
            <Text className="px-8 text-2xl font-bold mb-4 text-text dark:text-text-dark">
                {props.title}
            </Text>
            <Animated.FlatList
                horizontal={true}
                data={props.movies}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item, index }) => (
                    <MovieCard
                        title={item.title}
                        rating={item.rating}
                        posterUrl={item.posterUrl}
                        onPress={() => props.onMovieSelected(item.id)}
                        index={index}
                    />
                )}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
                ItemSeparatorComponent={() =>
                    <View className="w-4" />
                }
                ListFooterComponent={renderFooter}
                onEndReached={props.onLoadMore}
                onEndReachedThreshold={0.5}
            />
        </View>
    )
}
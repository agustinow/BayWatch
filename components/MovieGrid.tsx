import { View, FlatList } from "react-native";
import MovieCard from "@/components/MovieCard";

interface Movie {
    id: number;
    title: string;
    rating: number;
    posterUrl?: string;
}

interface MovieGridProps {
    movies: Movie[];
    onMovieSelected: (id: number) => void;
    numColumns?: number;
}

export default function MovieGrid({ movies, onMovieSelected, numColumns = 2 }: MovieGridProps) {
    return (
        <FlatList
            data={movies}
            numColumns={numColumns}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item, index }) => (
                <View className="flex-1 p-2">
                    <MovieCard
                        title={item.title}
                        rating={item.rating}
                        posterUrl={item.posterUrl}
                        onPress={() => onMovieSelected(item.id)}
                        style='grid'
                        index={index}
                    />
                </View>
            )}
            columnWrapperStyle={{ paddingHorizontal: 10 }}
            contentContainerStyle={{ paddingTop: 20 }}
        />
    );
}
import {Text, View, Image} from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import {useRouter} from 'expo-router';
import "@/app/global.css"
import SearchBar from "@/components/SearchBar";
import { useTheme } from '@/contexts/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';

// Mock data for content
const MOCK_MOVIES = [
    { id: 1, title: 'Inception', year: 2010, rating: 8.8, genre: 'Sci-Fi' },
    { id: 2, title: 'The Dark Knight', year: 2008, rating: 9.0, genre: 'Action' },
    { id: 3, title: 'Interstellar', year: 2014, rating: 8.6, genre: 'Sci-Fi' },
    { id: 4, title: 'Pulp Fiction', year: 1994, rating: 8.9, genre: 'Crime' },
    { id: 5, title: 'Fight Club', year: 1999, rating: 8.8, genre: 'Drama' },
    { id: 6, title: 'Forrest Gump', year: 1994, rating: 8.8, genre: 'Drama' },
    { id: 7, title: 'The Matrix', year: 1999, rating: 8.7, genre: 'Sci-Fi' },
    { id: 8, title: 'Goodfellas', year: 1990, rating: 8.7, genre: 'Crime' },
    { id: 9, title: 'The Shawshank Redemption', year: 1994, rating: 9.3, genre: 'Drama' },
    { id: 10, title: 'The Godfather', year: 1972, rating: 9.2, genre: 'Crime' },
];

const Index = () => {
    const router = useRouter();
    const scrollY = useSharedValue(0);
    const { colors } = useTheme();

    const scrollHandler = useAnimatedScrollHandler((event) => {
        scrollY.value = event.contentOffset.y;
    });

    return(
        <View className="flex-1" style={{ backgroundColor: colors.primary }}>
            <Animated.ScrollView
                className="flex-1 px-5"
                showsVerticalScrollIndicator={false}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                contentContainerStyle={{
                    paddingBottom: 40,
                    alignItems: 'center'
                }}>
                <View className="flex-row justify-between items-center w-full">
                    <Image
                        className="size-5"
                        source={require('@/assets/icons/icon.png')}
                    />
                    <ThemeToggle />
                </View>

                <View className="w-full mt-5">
                    <SearchBar/>
                </View>

                <View className="w-full mt-8">
                    <Text className="text-2xl font-bold mb-4" style={{ color: colors.text }}>Trending Now</Text>
                    {MOCK_MOVIES.map((movie) => (
                        <View key={movie.id} className="rounded-2xl p-4 mb-3" style={{ backgroundColor: colors.secondary }}>
                            <Text className="text-lg font-semibold" style={{ color: colors.text }}>{movie.title}</Text>
                            <View className="flex-row justify-between mt-2">
                                <Text className="text-sm" style={{ color: colors.text, opacity: 0.7 }}>{movie.genre} • {movie.year}</Text>
                                <Text className="text-sm font-semibold" style={{ color: colors.accent }}>⭐ {movie.rating}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </Animated.ScrollView>
        </View>
    )
}
export default Index;
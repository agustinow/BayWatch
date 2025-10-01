import {Text, View} from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import {useRouter} from 'expo-router';
import "@/app/global.css"
import Icon from "@/assets/icons/icon.svg";
import SearchBar from "@/components/SearchBar";
import ParallaxBackground from "@/components/ParallaxBackground";
import {ImageBackground} from "expo-image";

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

    const scrollHandler = useAnimatedScrollHandler((event) => {
        scrollY.value = event.contentOffset.y;
    });

    return(
        <View className="flex-1">
            {/*<ParallaxBackground
                width="100%"
                height="100%"
                preserveAspectRatio="xMidYMid slice"
                style={{ position: 'absolute' }}
                scrollY={scrollY}
            />*/
            }

            <Animated.ScrollView
                className="flex-1 px-5"
                showsVerticalScrollIndicator={false}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                contentContainerStyle={{
                    paddingBottom: 40,
                    alignItems: 'center'
                }}>
                <Icon
                    width={48}
                    height={40}
                    style={{ marginTop: 80, marginBottom: 20 }}
                />

                <View className="w-full mt-5">
                    <SearchBar/>
                </View>

                <View className="w-full mt-8">
                    <Text className="text-white text-2xl font-bold mb-4">Trending Now</Text>
                    {MOCK_MOVIES.map((movie) => (
                        <View key={movie.id} className="bg-white/10 rounded-2xl p-4 mb-3 backdrop-blur">
                            <Text className="text-white text-lg font-semibold">{movie.title}</Text>
                            <View className="flex-row justify-between mt-2">
                                <Text className="text-white/70 text-sm">{movie.genre} • {movie.year}</Text>
                                <Text className="text-yellow-400 text-sm font-semibold">⭐ {movie.rating}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </Animated.ScrollView>
        </View>
    )
}
export default Index;
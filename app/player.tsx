import {useLocalSearchParams, useRouter} from "expo-router";
import {useTheme} from "@/contexts/ThemeContext";
import {TouchableOpacity, View} from "react-native";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import VideoPlayer from "@/components/VideoPlayer";

export default function Player() {
    const { magnetUri, title } = useLocalSearchParams<{ magnetUri: string; title: string }>();
    const router = useRouter();
    const { colors } = useTheme();

    console.log('Player params:', { magnetUri, title });

    return (
        <View className="flex-1" style={{ backgroundColor: '#000' }}>
            <TouchableOpacity
                onPress={() => router.back()}
                className="absolute top-12 left-4 bg-black/70 rounded-full p-2 z-10"
            >
                <MaterialCommunityIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>

            {magnetUri && <VideoPlayer uri={magnetUri} onClose={() => router.back()} />}
        </View>
    );
}
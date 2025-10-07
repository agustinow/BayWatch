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
            {magnetUri && <VideoPlayer uri={magnetUri} onClose={() => router.back()} />}
        </View>
    );
}
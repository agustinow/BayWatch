import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Stream } from '@/domain/types/stream';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface StreamCardProps {
    stream: Stream;
    onPress: (stream: Stream) => void;
}

export default function StreamCard({ stream, onPress }: StreamCardProps) {
    const { colors } = useTheme();

    return (
        <TouchableOpacity
            onPress={() => onPress(stream)}
            className="mb-3 p-4 rounded-lg"
            style={{ backgroundColor: colors.secondary }}
            activeOpacity={0.7}
        >
            {/* Quality Badge */}
            <View className="flex-row items-center justify-between mb-2">
                <View className="bg-accent px-3 py-1 rounded-full">
                    <Text className="text-white font-bold text-xs">
                        {stream.quality}
                    </Text>
                </View>
                <MaterialCommunityIcons name="play-circle" size={24} color={colors.accent} />
            </View>

            {/* Title */}
            <Text
                className="font-semibold mb-2"
                style={{ color: colors.text }}
                numberOfLines={1}
            >
                {stream.title}
            </Text>

            {/* Metadata */}
            <View className="flex-row flex-wrap gap-3">
                {stream.seeders && (
                    <View className="flex-row items-center gap-1">
                        <Text className="text-xs" style={{ color: colors.text, opacity: 0.6 }}>
                            👤 {stream.seeders}
                        </Text>
                    </View>
                )}
                {stream.size && (
                    <View className="flex-row items-center gap-1">
                        <Text className="text-xs" style={{ color: colors.text, opacity: 0.6 }}>
                            💾 {stream.size}
                        </Text>
                    </View>
                )}
                {stream.source && (
                    <View className="flex-row items-center gap-1">
                        <Text className="text-xs" style={{ color: colors.text, opacity: 0.6 }}>
                            ⚙️ {stream.source}
                        </Text>
                    </View>
                )}
                {stream.languages && stream.languages.length > 0 && (
                    <View className="flex-row items-center gap-1">
                        <Text className="text-xs" style={{ color: colors.text, opacity: 0.6 }}>
                            {stream.languages.join(' ')}
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}
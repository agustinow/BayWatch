import { View, Text } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function Settings() {
    const { colors } = useTheme();

    return (
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.primary }}>
            <Text className="text-xl" style={{ color: colors.text }}>Settings Screen</Text>
        </View>
    );
}
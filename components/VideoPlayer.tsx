import { View, Text, ActivityIndicator, Linking, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface VideoPlayerProps {
    uri: string; // Magnet link
    onClose?: () => void;
}

export default function VideoPlayer({ uri, onClose }: VideoPlayerProps) {
    const { colors } = useTheme();
    const [opening, setOpening] = useState(true);

    useEffect(() => {
        openMagnet();
    }, [uri]);

    const openMagnet = async () => {
        try {
            const canOpen = await Linking.canOpenURL(uri);
            if (canOpen) {
                await Linking.openURL(uri);
                setTimeout(() => onClose?.(), 1000);
            } else {
                Alert.alert(
                    'Torrent App Required',
                    'Please install a torrent client like Flud or LibreTorrent from Google Play Store.',
                    [
                        {
                            text: 'Install Flud',
                            onPress: () => Linking.openURL('market://details?id=com.delphicoder.flud'),
                        },
                        {
                            text: 'Cancel',
                            onPress: () => onClose?.(),
                        }
                    ]
                );
            }
        } catch (error) {
            console.error('Error opening magnet:', error);
            Alert.alert('Error', 'Could not open torrent link');
        } finally {
            setOpening(false);
        }
    };

    return (
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.primary }}>
            {opening ? (
                <>
                    <ActivityIndicator size="large" color={colors.accent} />
                    <Text className="mt-4 text-base" style={{ color: colors.text }}>
                        Opening in torrent app...
                    </Text>
                </>
            ) : null}
        </View>
    );
}
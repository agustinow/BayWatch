import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import TorrentStreamer from 'react-native-torrent-streamer';
import { VLCPlayer } from 'react-native-vlc-media-player';

interface VideoPlayerProps {
    uri: string; // Magnet link
    onClose?: () => void;
}

interface StreamStatus {
    progress: number;
    downloadSpeed: number;
    seeds: number;
    bufferPercent: number;
}

export default function VideoPlayer({ uri, onClose }: VideoPlayerProps) {
    const { colors } = useTheme();
    const [loading, setLoading] = useState(true);
    const [streamUrl, setStreamUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<StreamStatus>({
        progress: 0,
        downloadSpeed: 0,
        seeds: 0,
        bufferPercent: 0
    });
    const [statusMessage, setStatusMessage] = useState('Initializing stream...');
    const statusListenerRef = useRef<any>(null);
    const errorListenerRef = useRef<any>(null);

    useEffect(() => {
        startStreaming();

        return () => {
            cleanup();
        };
    }, [uri]);

    const startStreaming = async () => {
        try {
            setStatusMessage('Starting torrent stream...');

            // Start the torrent stream first
            const startPromise = TorrentStreamer.start(uri, {
                removeAfterStop: true
            });

            // Setup event listeners AFTER start() so currentMagnetUrl is set
            statusListenerRef.current = TorrentStreamer.addEventListener('status', (data) => {
                setStatus({
                    progress: data.progress || 0,
                    downloadSpeed: data.downloadRate || 0,
                    seeds: data.numSeeds || 0,
                    bufferPercent: data.buffer || 0
                });

                if (data.progress < 5) {
                    setStatusMessage(`Preparing stream... ${data.progress.toFixed(1)}%`);
                } else if (data.progress < 100) {
                    setStatusMessage(`Buffering... ${data.progress.toFixed(1)}%`);
                }
            });

            errorListenerRef.current = TorrentStreamer.addEventListener('error', (error) => {
                console.error('Streaming error:', error);
                Alert.alert('Streaming Error', error.msg || 'Failed to stream torrent');
            });

            // Wait for stream to be ready
            const result = await startPromise;

            console.log('Stream started:', result);
            setStreamUrl(result.url);
            setLoading(false);
            setStatusMessage('Playing...');
        } catch (error: any) {
            console.error('Error starting stream:', error);
            Alert.alert(
                'Streaming Error',
                error.message || 'Could not start torrent stream. Please try again.',
                [
                    {
                        text: 'OK',
                        onPress: () => onClose?.()
                    }
                ]
            );
            setLoading(false);
        }
    };

    const cleanup = async () => {
        try {
            if (statusListenerRef.current) {
                statusListenerRef.current.remove();
            }
            if (errorListenerRef.current) {
                errorListenerRef.current.remove();
            }
            await TorrentStreamer.stop();
        } catch (error) {
            console.error('Cleanup error:', error);
        }
    };

    return (
        <View className="flex-1" style={{ backgroundColor: '#000' }}>
            {loading || !streamUrl ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={colors.accent} />
                    <Text className="mt-4 text-base" style={{ color: '#fff' }}>
                        {statusMessage}
                    </Text>
                    {status.progress > 0 && (
                        <>
                            <Text className="mt-2 text-sm" style={{ color: '#aaa' }}>
                                Speed: {(status.downloadSpeed / 1024 / 1024).toFixed(2)} MB/s
                            </Text>
                            <Text className="text-sm" style={{ color: '#aaa' }}>
                                Seeds: {status.seeds}
                            </Text>
                        </>
                    )}
                </View>
            ) : (
                <VLCPlayer
                    style={{ flex: 1 }}
                    source={{ uri: streamUrl }}
                    autoplay={true}
                    onError={(error) => {
                        console.error('VLC Player error:', error);
                        Alert.alert('Playback Error', 'Failed to play video');
                    }}
                />
            )}
        </View>
    );
}
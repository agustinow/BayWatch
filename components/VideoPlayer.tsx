import { View, Text, ActivityIndicator, Alert, TouchableOpacity, TouchableWithoutFeedback, Animated, StatusBar } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import TorrentStreamer from 'react-native-torrent-streamer';
import { VLCPlayer } from 'react-native-vlc-media-player';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

interface VideoPlayerProps {
    uri: string;
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
    const [buffering, setBuffering] = useState(true);
    const [bufferStartTime, setBufferStartTime] = useState<number | null>(null);
    const [, forceUpdate] = useState(0);
    const [status, setStatus] = useState<StreamStatus>({
        progress: 0,
        downloadSpeed: 0,
        seeds: 0,
        bufferPercent: 0
    });
    const [statusMessage, setStatusMessage] = useState('Initializing stream...');
    const [paused, setPaused] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [seeking, setSeeking] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const statusListenerRef = useRef<any>(null);
    const errorListenerRef = useRef<any>(null);
    const progressListenerRef = useRef<any>(null);
    const playerRef = useRef<VLCPlayer>(null);
    const controlsOpacity = useRef(new Animated.Value(1)).current;
    const controlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        startStreaming();

        return () => {
            cleanup();
        };
    }, [uri]);

    useEffect(() => {
        if (!bufferStartTime || !buffering) return;

        const checkBuffer = setInterval(() => {
            const elapsed = (Date.now() - bufferStartTime) / 1000;
            if (elapsed >= 10) {
                setBuffering(false);
                setStatusMessage('Playing...');
            } else {
                forceUpdate(prev => prev + 1);
            }
        }, 100);

        return () => clearInterval(checkBuffer);
    }, [bufferStartTime, buffering]);

    const startStreaming = async () => {
        try {
            setStatusMessage('Starting torrent stream...');

            progressListenerRef.current = TorrentStreamer.addEventListener('progress', (data) => {
                console.log('progress event:', data);
                if (data.files && data.files.length > 0) {
                    TorrentStreamer.setSelectedFileIndex(-1);
                }
            });

            statusListenerRef.current = TorrentStreamer.addEventListener('status', (data) => {
                const progressValue = data.progress || 0;
                setStatus({
                    progress: progressValue,
                    downloadSpeed: data.downloadRate || 0,
                    seeds: data.numSeeds || 0,
                    bufferPercent: data.buffer || 0
                });

                if (progressValue < 5) {
                    setStatusMessage(`Preparing stream... ${progressValue.toFixed(1)}%`);
                } else {
                    setStatusMessage(`Buffering... ${progressValue.toFixed(1)}%`);
                }
            });

            errorListenerRef.current = TorrentStreamer.addEventListener('error', (error) => {
                console.error('Streaming error:', error);
                Alert.alert('Streaming Error', error.msg || 'Failed to stream torrent');
            });

            const result = await TorrentStreamer.start(uri, {
                removeAfterStop: true
            });

            console.log('Stream started:', result);
            setStreamUrl(result.url);
            setBufferStartTime(Date.now());
            setLoading(false);
            setStatusMessage('Buffering video...');
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
            if (progressListenerRef.current) {
                progressListenerRef.current.remove();
            }
            if (controlsTimeout.current) {
                clearTimeout(controlsTimeout.current);
            }
            // Restore status bar
            StatusBar.setHidden(false);
            TorrentStreamer.stop();
        } catch (error) {
            console.error('Cleanup error:', error);
        }
    };

    const toggleControls = () => {
        if (showControls) {
            hideControls();
        } else {
            showControlsWithTimeout();
        }
    };

    const showControlsWithTimeout = () => {
        setShowControls(true);
        Animated.timing(controlsOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();

        if (controlsTimeout.current) {
            clearTimeout(controlsTimeout.current);
        }
        controlsTimeout.current = setTimeout(() => {
            if (!paused) {
                hideControls();
            }
        }, 3000);
    };

    const hideControls = () => {
        Animated.timing(controlsOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => setShowControls(false));
    };

    const togglePlayPause = () => {
        setPaused(!paused);
        if (!paused) {
            if (controlsTimeout.current) {
                clearTimeout(controlsTimeout.current);
            }
        } else {
            showControlsWithTimeout();
        }
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
        StatusBar.setHidden(!isFullscreen);
    };

    const handleSeek = (value: number) => {
        setSeeking(false);
        if (playerRef.current && duration > 0) {
            // VLC seek expects a value between 0 and 1
            const position = value / duration;
            playerRef.current.seek(position);
        }
    };

    const formatTime = (seconds: number): string => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const bufferProgress = bufferStartTime
        ? Math.min(((Date.now() - bufferStartTime) / 10000) * 100, 100)
        : 0;

    return (
        <View className="flex-1" style={{ backgroundColor: '#000' }}>
            {loading || !streamUrl || buffering ? (
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
                    {buffering && bufferStartTime && (
                        <View className="mt-4 w-4/5">
                            <View style={{
                                width: '100%',
                                height: 6,
                                backgroundColor: '#333',
                                borderRadius: 3,
                                overflow: 'hidden'
                            }}>
                                <View style={{
                                    width: `${bufferProgress}%`,
                                    height: '100%',
                                    backgroundColor: colors.accent
                                }} />
                            </View>
                            <Text className="mt-2 text-sm text-center" style={{ color: '#aaa' }}>
                                Buffering: {Math.floor(bufferProgress)}%
                            </Text>
                        </View>
                    )}
                </View>
            ) : (
                <TouchableWithoutFeedback onPress={toggleControls}>
                    <View style={{ flex: 1 }}>
                        <VLCPlayer
                            ref={playerRef}
                            style={{ flex: 1 }}
                            source={{ uri: streamUrl }}
                            autoplay={true}
                            paused={paused}
                            onProgress={(event) => {
                                if (!seeking) {
                                    setCurrentTime(event.currentTime / 1000); // VLC returns milliseconds
                                }
                            }}
                            onLoad={(event) => {
                                setDuration(event.duration / 1000); // VLC returns milliseconds
                            }}
                            onPaused={() => setPaused(true)}
                            onPlaying={() => setPaused(false)}
                            onError={(error) => {
                                console.error('VLC Player error:', error);
                                Alert.alert('Playback Error', 'Failed to play video');
                            }}
                        />

                        {showControls && (
                            <Animated.View
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    opacity: controlsOpacity,
                                }}
                                pointerEvents={showControls ? 'box-none' : 'none'}
                            >
                                <View
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: 80,
                                        paddingTop: 40,
                                        paddingHorizontal: 16,
                                        backgroundColor: 'rgba(0,0,0,0.6)',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}
                                    pointerEvents="box-none"
                                >
                                    <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
                                        <Ionicons name="arrow-back" size={28} color="#fff" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={toggleFullscreen} style={{ padding: 8 }}>
                                        <Ionicons
                                            name={isFullscreen ? "contract" : "expand"}
                                            size={24}
                                            color="#fff"
                                        />
                                    </TouchableOpacity>
                                </View>

                                <View
                                    style={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                    pointerEvents="box-none"
                                >
                                    <TouchableOpacity
                                        onPress={togglePlayPause}
                                        style={{
                                            width: 70,
                                            height: 70,
                                            borderRadius: 35,
                                            backgroundColor: 'rgba(0,0,0,0.6)',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Ionicons
                                            name={paused ? 'play' : 'pause'}
                                            size={36}
                                            color="#fff"
                                        />
                                    </TouchableOpacity>
                                </View>

                                <View
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        paddingHorizontal: 16,
                                        paddingBottom: 20,
                                        backgroundColor: 'rgba(0,0,0,0.6)',
                                    }}
                                >
                                    {/* Progress Bar */}
                                    <View style={{ marginBottom: 8 }}>
                                        <Slider
                                            style={{ width: '100%', height: 40 }}
                                            minimumValue={0}
                                            maximumValue={duration}
                                            value={seeking ? undefined : currentTime}
                                            onValueChange={(value) => {
                                                setSeeking(true);
                                                setCurrentTime(value);
                                            }}
                                            onSlidingComplete={handleSeek}
                                            minimumTrackTintColor={colors.accent}
                                            maximumTrackTintColor="#666"
                                            thumbTintColor={colors.accent}
                                        />
                                    </View>

                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: 8,
                                        }}
                                    >
                                        <Text style={{ color: '#fff', fontSize: 14 }}>
                                            {formatTime(currentTime)}
                                        </Text>
                                        <Text style={{ color: '#fff', fontSize: 14 }}>
                                            {formatTime(duration)}
                                        </Text>
                                    </View>
                                </View>
                            </Animated.View>
                        )}
                    </View>
                </TouchableWithoutFeedback>
            )}
        </View>
    );
}
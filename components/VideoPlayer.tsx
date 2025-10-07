import { View, Text, ActivityIndicator, Alert, TouchableOpacity, TouchableWithoutFeedback, Animated, StatusBar, Platform } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import TorrentStreamer from 'react-native-torrent-streamer';
import { VLCPlayer } from 'react-native-vlc-media-player';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as NavigationBar from 'expo-navigation-bar';

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
    const [isLandscape, setIsLandscape] = useState(false);
    const [showDebug, setShowDebug] = useState(false);
    const [isBufferingDuringPlayback, setIsBufferingDuringPlayback] = useState(false);

    const statusListenerRef = useRef<any>(null);
    const errorListenerRef = useRef<any>(null);
    const progressListenerRef = useRef<any>(null);
    const playerRef = useRef<VLCPlayer>(null);
    const controlsOpacity = useRef(new Animated.Value(1)).current;
    const controlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastStatusUpdate = useRef<number>(0);
    const lastStatusValues = useRef({ progress: 0, buffer: 0 });

    useEffect(() => {
        startStreaming();

        // Listen for orientation changes
        const subscription = ScreenOrientation.addOrientationChangeListener(async (event) => {
            const orientation = event.orientationInfo.orientation;
            const landscape =
                orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
                orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;

            setIsLandscape(landscape);
            StatusBar.setHidden(landscape);

            // Hide navigation bar on Android when in landscape
            if (Platform.OS === 'android') {
                if (landscape) {
                    await NavigationBar.setVisibilityAsync('hidden');
                    await NavigationBar.setBehaviorAsync('overlay-swipe');
                } else {
                    await NavigationBar.setVisibilityAsync('visible');
                }
            }
        });

        return () => {
            cleanup();
            subscription.remove();
        };
    }, [uri]);

    useEffect(() => {
        // Auto-start playback when buffer reaches minimum threshold
        if (buffering && status.bufferPercent >= 100) {
            setBuffering(false);
            setStatusMessage('Ready to play');
        }
    }, [buffering, status.bufferPercent]);

    const startStreaming = async () => {
        try {
            setStatusMessage('Starting torrent stream...');

            console.log('Starting torrent...');

            const result = await TorrentStreamer.start(uri, {
                removeAfterStop: true
            });

            console.log('Torrent started, setting up event listeners...');

            statusListenerRef.current = TorrentStreamer.addEventListener('status', (data) => {
                const now = Date.now();
                const bufferValue = parseFloat(data.buffer) || 0;
                const progressValue = parseFloat(data.progress) || 0;

                // Throttle updates: only update if 500ms passed OR values changed significantly
                const timeSinceLastUpdate = now - lastStatusUpdate.current;
                const significantChange =
                    Math.abs(progressValue - lastStatusValues.current.progress) > 1 ||
                    Math.abs(bufferValue - lastStatusValues.current.buffer) > 5

                if (timeSinceLastUpdate < 500 && !significantChange) {
                    return; // Skip this update
                }

                // Log only on updates (much less frequent now)
                console.log('❗ STATUS UPDATE:', JSON.stringify(data, null, 2));

                // Update refs
                lastStatusUpdate.current = now;
                lastStatusValues.current = { progress: progressValue, buffer: bufferValue };

                setStatus({
                    progress: progressValue,
                    downloadSpeed: data.downloadRate || 0,
                    seeds: data.numSeeds || 0,
                    bufferPercent: bufferValue
                });

                if (bufferValue < 5) {
                    setStatusMessage(`Preparing stream... ${bufferValue.toFixed(1)}%`);
                } else {
                    setStatusMessage(`Buffering... ${bufferValue.toFixed(1)}%`);
                }
            });

            errorListenerRef.current = TorrentStreamer.addEventListener('error', (error) => {
                console.error('❗ ERROR EVENT:', error);
                Alert.alert('Streaming Error', error.msg || 'Failed to stream torrent');
            });

            console.log('Event listeners set up');

            console.log('Stream started:', result);
            console.log('File size:', result.fileSize, 'bytes =', (result.fileSize / 1024 / 1024).toFixed(2), 'MB');
            setStreamUrl(result.url);
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
            // Restore status bar and navigation bar
            StatusBar.setHidden(false);
            if (Platform.OS === 'android') {
                await NavigationBar.setVisibilityAsync('visible');
            }
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

    // Use actual buffer progress from torrent stream instead of time-based fake progress
    const bufferProgress = status.bufferPercent;

    return (
        <View className="flex-1" style={{ backgroundColor: '#000' }}>
            {loading || !streamUrl || buffering ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={colors.accent} />
                    <Text className="mt-4 text-base" style={{ color: '#fff' }}>
                        {statusMessage}
                    </Text>
                    {buffering && streamUrl && (
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
                            <Text className="mt-1 text-xs text-center" style={{ color: '#aaa' }}>
                                Buffer: {bufferProgress.toFixed(1)}%
                            </Text>
                            <Text className="mt-1 text-xs text-center" style={{ color: '#666' }}>
                                Downloaded: {status.progress.toFixed(1)}%
                            </Text>
                        </View>
                    )}
                </View>
            ) : (
                <TouchableWithoutFeedback onPress={toggleControls}>
                    <View style={{ flex: 1 }}>
                        <VLCPlayer
                            ref={playerRef}
                            style={{ flex: 1, width: '100%', height: '100%' }}
                            source={{ uri: streamUrl }}
                            autoplay={true}
                            paused={paused}
                            resizeMode="contain"
                            onProgress={(event) => {
                                if (!seeking) {
                                    setCurrentTime(event.currentTime / 1000); // VLC returns milliseconds
                                }
                            }}
                            onLoad={(event) => {
                                setDuration(event.duration / 1000); // VLC returns milliseconds
                            }}
                            onPaused={() => setPaused(true)}
                            onPlaying={() => {
                                setPaused(false);
                                setIsBufferingDuringPlayback(false);
                            }}
                            onBuffering={(isBuffering) => {
                                console.log('Buffering state:', isBuffering);
                                if (isBuffering && !paused) {
                                    // Auto-pause when buffering occurs during playback
                                    setPaused(true);
                                    setIsBufferingDuringPlayback(true);
                                    setStatusMessage('Buffering... (paused)');
                                }
                            }}
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
                                        justifyContent: 'flex-end',
                                    }}
                                    pointerEvents="box-none"
                                >
                                    <TouchableOpacity onPress={() => setShowDebug(!showDebug)} style={{ padding: 8 }}>
                                        <Ionicons name="bug" size={24} color={showDebug ? colors.accent : '#fff'} />
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

                                {/* Debug Info */}
                                {showDebug && (
                                    <View
                                        style={{
                                            position: 'absolute',
                                            top: 100,
                                            left: 16,
                                            backgroundColor: 'rgba(0,0,0,0.8)',
                                            padding: 12,
                                            borderRadius: 8,
                                        }}
                                    >
                                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>
                                            Debug Info
                                        </Text>
                                        <Text style={{ color: '#fff', fontSize: 11 }}>
                                            Buffer: {(status.bufferPercent).toFixed(1)}%
                                        </Text>
                                        <Text style={{ color: '#666', fontSize: 11 }}>
                                            Downloaded: {(status.progress).toFixed(1)}%
                                        </Text>
                                        <Text style={{ color: '#fff', fontSize: 11 }}>
                                            Speed: {(status.downloadSpeed / 1024 / 1024).toFixed(2)} MB/s
                                        </Text>
                                        <Text style={{ color: '#fff', fontSize: 11 }}>
                                            Seeds: {status.seeds}
                                        </Text>
                                        <Text style={{ color: isBufferingDuringPlayback ? colors.accent : '#fff', fontSize: 11 }}>
                                            Buffering: {isBufferingDuringPlayback ? 'Yes' : 'No'}
                                        </Text>
                                    </View>
                                )}

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
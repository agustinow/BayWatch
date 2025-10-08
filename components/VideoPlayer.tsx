import { View, Text, ActivityIndicator, Alert, TouchableOpacity, TouchableWithoutFeedback, StatusBar, Platform } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import TorrentStreamer from 'react-native-torrent-streamer';
import Video, { VideoRef, OnProgressData, OnLoadData, OnBufferData } from 'react-native-video';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as NavigationBar from 'expo-navigation-bar';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';

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
    const controlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const AUTOHIDE_MS = 3000;

    const [seeking, setSeeking] = useState(false);
    const [showDebug, setShowDebug] = useState(false);
    const [isBufferingDuringPlayback, setIsBufferingDuringPlayback] = useState(false);
    const [lastSafePosition, setLastSafePosition] = useState(0);

    const statusListenerRef = useRef<any>(null);
    const errorListenerRef = useRef<any>(null);
    const progressListenerRef = useRef<any>(null);
    const playerRef = useRef<VideoRef>(null);
    const lastStatusUpdate = useRef<number>(0);
    const lastStatusValues = useRef({ progress: 0, buffer: 0 });
    const seekErrorCount = useRef<number>(0);

    const clearAutoHide = () => {
        if (controlsTimeout.current) {
            clearTimeout(controlsTimeout.current);
            controlsTimeout.current = null;
        }
    };

    const scheduleAutoHide = () => {
        clearAutoHide();
        controlsTimeout.current = setTimeout(() => {
            setShowControls(false);
        }, AUTOHIDE_MS);
    };

    const showControlsTemporarily = () => {
        setShowControls(true);
        scheduleAutoHide();
    };

    const handleVideoTap = () => {
        if (showControls) {
            setShowControls(false);
        } else {
            showControlsTemporarily();
        }
    };

    const onUserAction = (fn?: () => void) => () => {
        showControlsTemporarily();
        fn?.();
    };


    useEffect(() => {
        startStreaming();

        const subscription = ScreenOrientation.addOrientationChangeListener(async (event) => {
            const orientation = event.orientationInfo.orientation;
            const landscape =
                orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
                orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;

            StatusBar.setHidden(landscape);

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
        if (buffering && status.bufferPercent >= 100 && status.progress >= 5) {
            setBuffering(false);
            setStatusMessage('Ready to play');
            showControlsTemporarily();
        }
    }, [buffering, status.bufferPercent, status.progress]);

    const startStreaming = async () => {
        try {
            setStatusMessage('Starting torrent stream...');
            const result = await TorrentStreamer.start(uri, { removeAfterStop: true });

            statusListenerRef.current = TorrentStreamer.addEventListener('status', (data) => {
                const now = Date.now();
                const bufferValue = data.buffer || 0;
                const progressValue = data.buffer || 0;
                const timeSinceLastUpdate = now - lastStatusUpdate.current;
                const significantChange =
                    Math.abs(progressValue - lastStatusValues.current.progress) > 1 ||
                    Math.abs(bufferValue - lastStatusValues.current.buffer) > 5;

                if (timeSinceLastUpdate < 500 && !significantChange) return;

                lastStatusUpdate.current = now;
                lastStatusValues.current = { progress: progressValue, buffer: bufferValue };

                setStatus({
                    progress: progressValue,
                    downloadSpeed: data.downloadRate || 0,
                    seeds: data.numSeeds || 0,
                    bufferPercent: bufferValue
                });

                if (bufferValue < 5) setStatusMessage(`Preparing stream... ${bufferValue.toFixed(1)}%`);
                else setStatusMessage(`Buffering... ${bufferValue.toFixed(1)}%`);
            });

            errorListenerRef.current = TorrentStreamer.addEventListener('error', (error) => {
                console.error('❗ ERROR EVENT:', error);
                Alert.alert('Streaming Error', error.msg || 'Failed to stream torrent');
            });

            setStreamUrl(result.url);
            setLoading(false);
            setStatusMessage('Buffering video...');
        } catch (error: any) {
            console.error('Error starting stream:', error);
            Alert.alert('Streaming Error', error.message || 'Could not start torrent stream. Please try again.', [
                { text: 'OK', onPress: () => onClose?.() }
            ]);
            setLoading(false);
        }
    };

    const cleanup = async () => {
        try {
            statusListenerRef.current?.remove?.();
            errorListenerRef.current?.remove?.();
            progressListenerRef.current?.remove?.();
            clearAutoHide();
            StatusBar.setHidden(false);
            if (Platform.OS === 'android') await NavigationBar.setVisibilityAsync('visible');
            TorrentStreamer.stop();
        } catch (error) {
            console.error('Cleanup error:', error);
        }
    };

    const togglePlayPause = onUserAction(() => setPaused((p) => !p));

    const handleSeek = (value: number) => {
        setSeeking(false);
        onUserAction()();
        if (playerRef.current && duration > 0) {
            const SEEK_THRESHOLD = 95;
            if (status.progress < SEEK_THRESHOLD) {
                Alert.alert(
                    'Seeking Disabled',
                    `Seeking is disabled during download to prevent playback errors.\n\nCurrent progress: ${status.progress.toFixed(1)}%\nSeeking available at: ${SEEK_THRESHOLD}%`,
                    [{ text: 'OK' }]
                );
                setCurrentTime(lastSafePosition);
                return;
            }
            playerRef.current.seek(value);
        }
    };

    const skipBackward = onUserAction(() => {
        if (playerRef.current && currentTime > 0) {
            const newTime = Math.max(0, currentTime - 10);
            playerRef.current.seek(newTime);
            setCurrentTime(newTime);
        }
    });

    const formatTime = (seconds: number): string => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleProgress = (data: OnProgressData) => {
        if (!seeking) {
            setCurrentTime(data.currentTime);
            setLastSafePosition(data.currentTime);
        }
    };

    const handleLoad = (data: OnLoadData) => {
        setDuration(data.duration);
        showControlsTemporarily();
    };

    const handleBuffer = (data: OnBufferData) => {
        if (data.isBuffering) {
            if (!paused) {
                setPaused(true);
                setIsBufferingDuringPlayback(true);
                setStatusMessage('Buffering... waiting for more data');
                setShowControls(true)
            }
        } else if (!data.isBuffering && isBufferingDuringPlayback) {
            if (status.bufferPercent > 50) {
                setPaused(false);
                setIsBufferingDuringPlayback(false);
                setStatusMessage('');
                showControlsTemporarily();
            }
        }
    };

    const handleError = (error: any) => {
        console.error('Video Player error:', error);
        const errorString = JSON.stringify(error);
        const isSeekError =
            errorString.includes('varint') ||
            errorString.includes('MatroskaExtractor') ||
            errorString.includes('Source error');

        if (isSeekError) {
            seekErrorCount.current += 1;
            if (seekErrorCount.current <= 2) {
                Alert.alert('Playback Error', 'Attempted to play unbuffered content. Returning to last position...', [{ text: 'OK' }]);
                setTimeout(() => {
                    if (playerRef.current && lastSafePosition > 0) {
                        playerRef.current.seek(lastSafePosition);
                        setPaused(false);
                    }
                }, 500);
            } else {
                Alert.alert('Playback Error', 'Unable to play this section of the video. Please wait for more content to download.', [
                    { text: 'OK' }
                ]);
                seekErrorCount.current = 0;
            }
        } else {
            Alert.alert('Playback Error', 'Failed to play video');
        }
    };

    const handlePlaybackStateChanged = (_state: any) => {};

    const bufferProgress = status.bufferPercent;

    return (
        <View className="flex-1 bg-black relative">
            {loading || !streamUrl || buffering ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={colors.accent} />
                    <Text className="mt-4 text-base" style={{ color: '#fff' }}>{statusMessage}</Text>
                    {buffering && streamUrl && (
                        <View className="mt-4 w-4/5">
                            <View style={{ width: '100%', height: 6, backgroundColor: '#333', borderRadius: 3, overflow: 'hidden' }}>
                                <View style={{ width: `${bufferProgress}%`, height: '100%', backgroundColor: colors.accent }} />
                            </View>
                            <Text className="mt-1 text-xs text-center" style={{ color: '#aaa' }}>Buffer: {bufferProgress.toFixed(1)}%</Text>
                            <Text className="mt-1 text-xs text-center" style={{ color: '#666' }}>
                                Downloaded: {status.progress.toFixed(1)}%
                            </Text>
                        </View>
                    )}
                </View>
            ) : (
                <View className="flex-1 bg-black relative">
                    <Video
                        className="absolute inset-0 z-0"
                        style={{ width: '100%', height: '100%' }}
                        pointerEvents="none"
                        ref={playerRef}
                        source={{
                            uri: streamUrl,
                            bufferConfig: {
                                minBufferMs: 15000,
                                maxBufferMs: 30000,
                                bufferForPlaybackMs: 5000,
                                bufferForPlaybackAfterRebufferMs: 5000,
                                backBufferDurationMs: 0,
                                cacheSizeMB: 0
                            }
                        }}
                        paused={paused}
                        resizeMode="contain"
                        onProgress={handleProgress}
                        onLoad={handleLoad}
                        onBuffer={handleBuffer}
                        onError={handleError}
                        onPlaybackStateChanged={handlePlaybackStateChanged}
                        progressUpdateInterval={250}
                        fullscreenAutorotate
                        disableDisconnectError
                        preventsDisplaySleepDuringVideoPlayback
                    />

                    <TouchableWithoutFeedback onPress={handleVideoTap}>
                        <View
                            className="absolute inset-0 z-10"
                            pointerEvents="box-only"
                            collapsable={false}
                            style={{ backgroundColor: 'transparent' }}
                        />
                    </TouchableWithoutFeedback>

                    {showControls && (
                        <Animated.View
                            entering={FadeIn}
                            exiting={FadeOut}
                            className="absolute inset-0 z-20"
                            pointerEvents="box-none">
                            <View
                                style={{
                                    position: 'absolute',
                                    top: 0, left: 0, right: 0,
                                    height: 80, paddingTop: 40, paddingHorizontal: 16,
                                    backgroundColor: 'rgba(0,0,0,0.6)',
                                    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end',
                                }}
                                pointerEvents="box-none"
                            >
                                <TouchableOpacity onPress={onUserAction(() => setShowDebug(d => !d))} style={{ padding: 8 }}>
                                    <Ionicons name="bug" size={24} color={showDebug ? colors.accent : '#fff'} />
                                </TouchableOpacity>
                            </View>

                            <View
                                style={{ flex: 1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 30 }}
                                pointerEvents="box-none"
                            >
                                <TouchableOpacity
                                    onPress={skipBackward}
                                    style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}
                                >
                                    <View style={{ alignItems: 'center' }}>
                                        <Ionicons name="refresh-outline" size={28} color="#fff" style={{ transform: [{ scaleX: -1 }] }} />
                                        <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold', position: 'absolute', top: 8 }}>10</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={togglePlayPause}
                                    style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}
                                >
                                    <Ionicons name={paused ? 'play' : 'pause'} size={36} color="#fff" />
                                </TouchableOpacity>
                            </View>

                            {showDebug && (
                                <View style={{ position: 'absolute', top: 100, left: 16, backgroundColor: 'rgba(0,0,0,0.8)', padding: 12, borderRadius: 8 }}>
                                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>Debug Info</Text>
                                    <Text style={{ color: '#fff', fontSize: 11 }}>Buffer: {(status.bufferPercent).toFixed(1)}%</Text>
                                    <Text style={{ color: '#666', fontSize: 11 }}>Downloaded: {(status.progress).toFixed(1)}%</Text>
                                    <Text style={{ color: '#fff', fontSize: 11 }}>Speed: {(status.downloadSpeed / 1024 / 1024).toFixed(2)} MB/s</Text>
                                    <Text style={{ color: '#fff', fontSize: 11 }}>Seeds: {status.seeds}</Text>
                                    <Text style={{ color: isBufferingDuringPlayback ? colors.accent : '#fff', fontSize: 11 }}>
                                        Buffering: {isBufferingDuringPlayback ? 'Yes' : 'No'}
                                    </Text>
                                    <Text style={{ color: '#888', fontSize: 11 }}>
                                        Seekable: {formatTime(Math.max(0, (duration * status.progress) / 100 - 10))} / {formatTime(duration)}
                                    </Text>
                                    <Text style={{ color: '#888', fontSize: 11 }}>Last Safe: {formatTime(lastSafePosition)}</Text>
                                </View>
                            )}

                            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingBottom: 20, backgroundColor: 'rgba(0,0,0,0.6)' }}>
                                <View style={{ marginBottom: 8, position: 'relative' }}>
                                    <View style={{ position: 'absolute', top: 18, left: 0, right: 0, height: 4, backgroundColor: '#333', borderRadius: 2, overflow: 'hidden' }}>
                                        <View style={{ width: `${status.progress}%`, height: '100%', backgroundColor: '#555' }} />
                                    </View>

                                    <Slider
                                        style={{ width: '100%', height: 40, opacity: status.progress < 95 ? 0.5 : 1 }}
                                        minimumValue={0}
                                        maximumValue={duration}
                                        value={seeking ? undefined : currentTime}
                                        onValueChange={(value) => {
                                            setSeeking(true);
                                            setCurrentTime(value);
                                            onUserAction()();
                                        }}
                                        onSlidingComplete={handleSeek}
                                        minimumTrackTintColor={colors.accent}
                                        maximumTrackTintColor="transparent"
                                        thumbTintColor={colors.accent}
                                        disabled={status.progress < 95}
                                    />

                                    {status.progress < 95 && (
                                        <Text style={{ color: '#888', fontSize: 10, textAlign: 'center', marginTop: -8 }}>
                                            Seeking disabled: {status.progress.toFixed(1)}% / 95%
                                        </Text>
                                    )}
                                </View>

                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <Text style={{ color: '#fff', fontSize: 14 }}>{formatTime(currentTime)}</Text>
                                    <Text style={{ color: '#fff', fontSize: 14 }}>{formatTime(duration)}</Text>
                                </View>
                            </View>
                        </Animated.View>
                    )}
                </View>
            )}
        </View>
    );
}
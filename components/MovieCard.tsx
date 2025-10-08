import {View, Text, Image, TouchableOpacity, ActivityIndicator} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import React, {useState} from 'react';
import Animated, {FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withSpring} from "react-native-reanimated";

interface MovieCardProps {
    title: string;
    rating?: number;
    posterUrl?: string;
    onPress: () => void;
    style?: 'horizontal' | 'grid';
    index?: number;
}

export default function MovieCard(props: MovieCardProps) {
    const widthClass = props.style === 'grid' ? 'w-full' : 'w-[230px]';
    const scale = useSharedValue(1);
    const [imageLoading, setImageLoading] = useState(true);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.95);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    return (
        <Animated.View
            entering={FadeInDown.delay((props.index || 0) * 100).springify()}
        >
            <Animated.View style={animatedStyle}>
                <TouchableOpacity
                    className={widthClass}
                    onPress={props.onPress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    activeOpacity={1}
                >
                <View className="relative w-full aspect-[2/3] rounded-lg overflow-hidden">
                    {props.posterUrl ? (
                        <View>
                            {imageLoading && (
                                <View className="absolute inset-0 items-center justify-center bg-gray-800">
                                    <ActivityIndicator size="small" color="#fff" />
                                </View>
                            )}

                            <Animated.Image
                                source={{ uri: props.posterUrl }}
                                className="w-full h-full"
                                resizeMode="cover"
                                onLoadStart={() => setImageLoading(true)}
                                onLoad={() => setImageLoading(false)}
                                entering={FadeIn.duration(300)}
                            />

                            <LinearGradient
                                colors={['transparent', 'rgba(0,0,0,0.9)']}
                                className="absolute bottom-0 left-0 right-0 h-40"
                            />
                        </View>
                    ) : (
                        <View className="w-full h-full bg-[#1a1a1a] items-center justify-center">
                            <Text className="text-3xl text-text dark:text-text-dark px-5 py-5 text-center">
                                {props.title}
                            </Text>
                        </View>
                    )}
                    {props.rating != null && (
                        <View className="absolute bottom-3 left-3 flex-row items-center gap-1">
                            <Text className="text-text dark:text-text-dark text-lg font-bold shadow-lg">
                                {props.rating.toFixed(1)}
                            </Text>
                            <Text className="text-base">⭐</Text>
                        </View>
                    )}
                </View>
                <Text className="text-text dark:text-text-dark text-base font-semibold mt-3 leading-5" numberOfLines={2}>
                    {props.title}
                </Text>
                </TouchableOpacity>
            </Animated.View>
        </Animated.View>
    );
}


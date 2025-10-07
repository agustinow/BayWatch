import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { useEffect } from "react";

export default function MovieCardSkeleton() {
      const opacity = useSharedValue(0.3);

      useEffect(() => {
          opacity.value = withRepeat(
              withTiming(1, { duration: 1000 }),
              -1,
              true
          );
      }, []);

      const animatedStyle = useAnimatedStyle(() => ({
          opacity: opacity.value,
      }));

      return (
          <View className="w-[230px]">
              <Animated.View
                  style={animatedStyle}
                  className="w-full aspect-[2/3] rounded-lg bg-gray-700"
              />
              <Animated.View
                  style={animatedStyle}
                  className="w-3/4 h-4 mt-3 rounded bg-gray-700"
              />
          </View>
      );
  }
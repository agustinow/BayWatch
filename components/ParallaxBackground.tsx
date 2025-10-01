import React from 'react';
import { StyleSheet, ViewStyle, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  SharedValue,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Stop, RadialGradient, Rect, Circle, Path, G } from 'react-native-svg';

interface ParallaxBackgroundProps {
  scrollY: SharedValue<number>;
  width?: string | number;
  height?: string | number;
  preserveAspectRatio?: string;
  style?: ViewStyle;
}

const AnimatedG = Animated.createAnimatedComponent(G);

export default function ParallaxBackground({
  scrollY,
  width = "100%",
  height = "100%",
  preserveAspectRatio = "xMidYMid slice",
  style = StyleSheet.absoluteFillObject
}: ParallaxBackgroundProps) {
  // Parallax for decorative lines (faster movement) - runs on UI thread
  const line1AnimatedProps = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, 1000],
      [0, 150]
    );
    return {
      transform: [{ translateY }],
    };
  });

  const line2AnimatedProps = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, 1000],
      [0, 200]
    );
    return {
      transform: [{ translateY }],
    };
  });

  // Parallax for circles (slower movement) - runs on UI thread
  const circle1AnimatedProps = useAnimatedStyle(() => {
    const translateY = interpolate(scrollY.value, [0, 1000], [0, 50]);
    return {
      transform: [{ translateY }],
    };
  });

  const circle2AnimatedProps = useAnimatedStyle(() => {
    const translateY = interpolate(scrollY.value, [0, 1000], [0, 70]);
    return {
      transform: [{ translateY }],
    };
  });

  const circle3AnimatedProps = useAnimatedStyle(() => {
    const translateY = interpolate(scrollY.value, [0, 1000], [0, 40]);
    return {
      transform: [{ translateY }],
    };
  });

  const circle4AnimatedProps = useAnimatedStyle(() => {
    const translateY = interpolate(scrollY.value, [0, 1000], [0, 60]);
    return {
      transform: [{ translateY }],
    };
  });

  return (
    <Svg width={width} height={height} viewBox="0 0 393 393" preserveAspectRatio={preserveAspectRatio} style={style}>
      <Defs>
        <LinearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#667eea" stopOpacity="1" />
          <Stop offset="50%" stopColor="#764ba2" stopOpacity="1" />
          <Stop offset="100%" stopColor="#f093fb" stopOpacity="1" />
        </LinearGradient>

        <RadialGradient id="overlayGradient" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
          <Stop offset="100%" stopColor="#000000" stopOpacity="0.05" />
        </RadialGradient>
      </Defs>

      {/* Main background */}
      <Rect width="393" height="393" fill="url(#mainGradient)" />

      {/* Overlay for depth */}
      <Rect width="393" height="393" fill="url(#overlayGradient)" />

      {/* Decorative circles with parallax */}
      <AnimatedG animatedProps={circle1AnimatedProps}>
        <Circle cx="80" cy="80" r="60" fill="#ffffff" opacity="0.05" />
      </AnimatedG>
      <AnimatedG animatedProps={circle2AnimatedProps}>
        <Circle cx="320" cy="100" r="40" fill="#ffffff" opacity="0.08" />
      </AnimatedG>
      <AnimatedG animatedProps={circle3AnimatedProps}>
        <Circle cx="60" cy="280" r="50" fill="#ffffff" opacity="0.06" />
      </AnimatedG>
      <AnimatedG animatedProps={circle4AnimatedProps}>
        <Circle cx="350" cy="320" r="70" fill="#ffffff" opacity="0.04" />
      </AnimatedG>

      {/* Decorative lines with parallax */}
      <AnimatedG animatedProps={line1AnimatedProps}>
        <Path d="M 0 150 Q 100 120, 200 150 T 393 150" stroke="#ffffff" strokeWidth="2" opacity="0.1" fill="none" />
      </AnimatedG>
      <AnimatedG animatedProps={line2AnimatedProps}>
        <Path d="M 0 250 Q 100 220, 200 250 T 393 250" stroke="#ffffff" strokeWidth="2" opacity="0.08" fill="none" />
      </AnimatedG>
    </Svg>
  );
}

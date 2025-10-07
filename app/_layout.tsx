import { Stack } from 'expo-router';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import {useEffect} from "react";
import { SafeAreaProvider } from 'react-native-safe-area-context';

function RootLayoutNav() {
    const { colors, theme } = useTheme();

    useEffect(() => {
        SystemUI.setBackgroundColorAsync(colors.primary);
    }, [colors.primary]);

    return (
        <>
            <StatusBar
                style={theme === 'dark' ? 'light' : 'dark'}
                backgroundColor={colors.primary}
                translucent={false}
            />

            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.primary },
                    animation: 'none'
                }}
            >
                <Stack.Screen name="(drawer)"/>
                <Stack.Screen name="movie/[id]"/>
                <Stack.Screen name="search"/>
                <Stack.Screen
                    name="player"
                    options={{
                        presentation: 'fullScreenModal',
                        animation: 'fade'
                    }}
                />
            </Stack>
        </>
    );
}


export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <RootLayoutNav />
            </ThemeProvider>
        </SafeAreaProvider>
    );
}
import { Stack } from 'expo-router';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import {useEffect} from "react";

function RootLayoutNav() {
    const { colors, theme } = useTheme(); // asumiendo que tu ThemeContext expone isDark

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
            >n
                <Stack.Screen name="(drawer)"/>
                <Stack.Screen name="movie/[id]"/>
                <Stack.Screen name="search"/>
            </Stack>
        </>
    );
}


export default function RootLayout() {
    return (
        <ThemeProvider>
            <RootLayoutNav />
        </ThemeProvider>
    );
}
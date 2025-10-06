import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { palette } from '@/constants/colors';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    colors: typeof palette.dark;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [theme, setThemeState] = useState<Theme>(systemColorScheme === 'dark' ? 'dark' : 'light');

    useEffect(() => {
        // Load saved theme preference
        AsyncStorage.getItem('theme').then((savedTheme: string | null) => {
            if (savedTheme === 'light' || savedTheme === 'dark') {
                setThemeState(savedTheme);
            }
        });
    }, []);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        AsyncStorage.setItem('theme', newTheme);
    };

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    };

    const colors = theme === 'dark' ? palette.dark : palette.light;

    return (
        <ThemeContext.Provider value={{ theme, colors, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

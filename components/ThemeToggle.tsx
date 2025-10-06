import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme, colors } = useTheme();

    return (
        <TouchableOpacity
            onPress={toggleTheme}
            className="rounded-full p-3"
            style={{ backgroundColor: colors.secondary }}
        >
            <Text style={{ color: colors.text, fontSize: 20 }}>
                {theme === 'dark' ? '☀️' : '🌙'}
            </Text>
        </TouchableOpacity>
    );
};

export default ThemeToggle;

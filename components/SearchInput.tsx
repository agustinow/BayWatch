import {View, TextInput, TouchableOpacity} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { useState, useEffect, useRef } from "react";

interface SearchInputProps {
    onSearch: (query: string) => void;
    placeholder?: string;
    debounceMs?: number;
}

export default function SearchInput({ onSearch, placeholder = "Search movies...", debounceMs = 500 }: SearchInputProps) {
    const { colors } = useTheme();
    const [value, setValue] = useState('');
    const timeoutRef = useRef<number>(null);
    const onSearchRef = useRef(onSearch);

    // Keep ref up to date
    useEffect(() => {
        onSearchRef.current = onSearch;
    }, [onSearch]);

    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        if (!value.trim()) {
            onSearchRef.current('');
            return;
        }

        // Debounce
        timeoutRef.current = setTimeout(() => {
            onSearchRef.current(value);
        }, debounceMs);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [value, debounceMs]);

    const handleClear = () => {
        setValue('');
    };

    return (
        <View className="flex-row items-center rounded-full px-5 py-2" style={{ backgroundColor: colors.secondary }}>
            <MaterialCommunityIcons name="magnify" size={20} color={colors.text} />
            <TextInput
                value={value}
                onChangeText={setValue}
                placeholder={placeholder}
                placeholderTextColor={colors.text + '80'}
                className="flex-1 text-xl ms-4"
                style={{ color: colors.text }}
                autoFocus
                returnKeyType="search"
                onSubmitEditing={() => onSearchRef.current(value)}
            />
            {value.length > 0 && (
                <TouchableOpacity onPress={handleClear}>
                    <MaterialCommunityIcons name="close" size={20} color={colors.text} />
                </TouchableOpacity>
            )}
        </View>
    );
}
import { Drawer } from "expo-router/drawer";
import { useTheme } from '@/contexts/ThemeContext';
import {DrawerContentScrollView} from "@react-navigation/drawer";
import {Image, View, Text, TouchableOpacity} from "react-native";
import Constants from "expo-constants";
import { useRouter, usePathname } from 'expo-router';
import {MaterialCommunityIcons} from "@expo/vector-icons";

function DrawerContent(props: any) {
    const { colors } = useTheme();
    const version = Constants.expoConfig?.version || 'unknown';

    return (
        <DrawerContentScrollView {...props}>
            <View className="p-5 items-center border-b border-gray-700">
                <Image
                    source={require('@/assets/icons/icon.png')}
                    className="size-12 mb-3"/>
                <Text className="text-2xl font-bold text-accent">BayWatch</Text>
                <Text className="text-sm mt-1" style={{ color: colors.text, opacity: 0.6 }}>v{version}</Text>
            </View>
        </DrawerContentScrollView>
    )
}

export default function DrawerLayout() {
    const { colors } = useTheme();
    const router = useRouter();
    const pathname = usePathname();

    return (
        <Drawer
            drawerContent={(props) => <DrawerContent {...props} /> }
            screenOptions={{
                drawerStyle: {
                    backgroundColor: colors.primary
                },
                drawerActiveTintColor: colors.accent,
                drawerInactiveTintColor: colors.text,
                headerStyle: {
                    backgroundColor: colors.primary,
                },
                headerTintColor: colors.text,
            }}
        >
            <Drawer.Screen
                name="index"
                options={{
                    drawerLabel: 'Home',
                    title: 'BayWatch',
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={() => router.push('/search')}
                            className="mr-4"
                        >
                            <MaterialCommunityIcons name="magnify" size={24} color={colors.text} />
                        </TouchableOpacity>
                    )
                }}
            />
        </Drawer>
    )
}
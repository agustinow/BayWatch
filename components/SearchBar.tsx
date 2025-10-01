import {View, Text} from "react-native";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {colors} from "@/constants/colors";

const SearchBar = () => {
    return (
        <View className="flex-row items-center bg-dark-200 rounded-full px-5 py-4">
            <MaterialCommunityIcons name="magnify" size={20} color={colors.light[300]} />
            <Text className="text-xl text-light-300 ms-4">
                Search
            </Text>
        </View>
    )
}

export default SearchBar
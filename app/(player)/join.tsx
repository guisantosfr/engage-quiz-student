import { Text, View } from "react-native";
import GradientBackground from "@/components/GradientBackground";

export default function JoinScreen() {
    return (
        <GradientBackground>
            <View className="flex-1 items-center justify-center">
                <Text className="text-xl font-bold text-white">
                    Welcome to Nativewind!
                </Text>
            </View>
        </GradientBackground>
    )
}
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, ViewStyle } from "react-native";

interface GradientBackgroundProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export default function GradientBackground({ children, style }: GradientBackgroundProps) {
    return (
        <LinearGradient
            colors={["#1e3a8a", "#111827"]}
            style={[styles.gradient, style]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            {children}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
});

import { useEffect } from 'react';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import useStyles from "../hooks/useStyles";

export default function ProgressBar({ total, current }) {
    const styles = useStyles();
    const theme = useTheme();

    const percentage = Math.round((current / total) * 100);
    const sharedProgress = useSharedValue(percentage);

    const styledAnimated = useAnimatedStyle(() => {
        return {
            width: `${sharedProgress.value}%`
        }
    })

    useEffect(() => {
        sharedProgress.value = withTiming(percentage);
    }, [current])

    return (
        <View style={[styles.track, { backgroundColor: theme.colors.outline }]}>
            <Animated.View style={[styles.progress, styledAnimated, { backgroundColor: theme.colors.primary }]} />
        </View>
    );
}
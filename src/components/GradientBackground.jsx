import { SafeAreaView } from 'react-native';
import { useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import useStyles from '../hooks/useStyles';

const GradientBackground = ({ children }) => {
    const theme = useTheme();
    const styles = useStyles();

    return (
        <LinearGradient
            colors={[theme.colors.surfaceVariant, theme.colors.background]}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ flex: 1 }}
        >
            <SafeAreaView style={styles.container}>
                {children}
            </SafeAreaView>
        </LinearGradient>
    );
};

export default GradientBackground;
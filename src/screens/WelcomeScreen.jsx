import { useEffect } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

export default function WelcomeScreen() {
    const navigation = useNavigation();

    useEffect(() => {
        AsyncStorage.getItem('hasSeenWelcome').then((value) => {
            if (value === 'true') {
                navigation.replace('Initial');
            }
        });
    }, []);

    const goToInitial = async () => {
        await AsyncStorage.setItem('hasSeenWelcome', 'true');
        navigation.replace('Initial');
    };

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('../assets/classroom.jpeg')}
                resizeMode='cover'
                style={styles.bgImg}>
                <LinearGradient
                    colors={["rgba(0,0,0,0.7)", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.6)"]}
                    style={styles.bgGradient}
                />
            </ImageBackground>

            <Text variant="headlineSmall" style={styles.text}>Bem-vindo (a)</Text>
            <Button
                mode="contained"
                style={styles.button}
                onPress={goToInitial}
            >Continuar</Button>
        </View>

    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#000'
    },

    bgImg: {
        ...StyleSheet.absoluteFillObject
    },

    bgGradient: {
        ...StyleSheet.absoluteFillObject
    },

    text: {
        textAlign: 'center',
        marginBottom: 100
    },

    button: {
        width: '50%',
        marginHorizontal: 'auto'
    }
})
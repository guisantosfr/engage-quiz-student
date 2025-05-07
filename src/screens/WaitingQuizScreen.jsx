import { useEffect, useState } from 'react';
import { useTheme, ActivityIndicator, Text, Appbar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

import GradientBackground from '../components/GradientBackground';

export default function WaitingQuizScreen({ navigation }) {
    const [isSuccess, setIsSuccess] = useState(false);
    const [quizToSolve, setQuizToSolve] = useState(null);

    const theme = useTheme();

    const goBack = async () => {
        await AsyncStorage.removeItem('matricula');
        navigation.goBack()
    }

    useEffect(() => {
        const askForQuiz = async () => {
            const value = await AsyncStorage.getItem('matricula');

            try {
                const response = await api.post('/getQuestionarioAluno', JSON.stringify({
                    matricula: value
                }));

                if (response.data !== 'questionario não liberado') {
                    setQuizToSolve(response.data);
                    setIsSuccess(true);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        if (!isSuccess) {
            const id = setInterval(askForQuiz, 2000);
            return () => clearInterval(id);
        }
    }, [isSuccess]);

    useEffect(() => {
        if (isSuccess) {
            navigation.navigate('Solve', { quizToSolve: quizToSolve });
        }
    }, [isSuccess, quizToSolve, navigation]);

    return (
        <>
            <Appbar.Header>
                <Appbar.BackAction onPress={goBack} />
                <Appbar.Content title="Aguardar início" />
            </Appbar.Header>

            <GradientBackground>
                {
                    isSuccess ? (
                        <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
                    ) : (
                        <>
                            <Text variant="titleLarge" style={{ marginBottom: 10 }}>Aguardando autorização</Text>
                            <Text variant="titleMedium">Aguarde o professor iniciar o questionário</Text>
                            <Text variant="titleMedium" style={{ marginBottom: 20 }}>Isso pode levar alguns instantes</Text>

                            <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
                        </>
                    )
                }
            </GradientBackground>
        </>
    );
}

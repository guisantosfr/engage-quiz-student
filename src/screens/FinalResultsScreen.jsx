import { useEffect, useState } from 'react';
import { useNavigation } from "@react-navigation/native";
import { useTheme, ActivityIndicator, Button, Text } from 'react-native-paper';
import GradientBackground from '../components/GradientBackground';

import api from '../services/api';
import useQuizStore from '../stores/QuizStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Podium from '../components/Podium';

export default function FinalResultsScreen() {
    const [matricula, setMatricula] = useState(null);
    const [hasMatricula, setHasMatricula] = useState(false);
    const [podiumReceived, setPodiumReceived] = useState(false);
    const [students, setStudents] = useState([]);
    const [intervalId, setIntervalId] = useState(null);

    const [quizCode, setQuizCode] = useState(null);
    const [hasQuizCode, setHasQuizCode] = useState(false);

    const navigation = useNavigation();
    const quiz = useQuizStore((state) => state.quiz);
    const correctAnswers = useQuizStore((state) => state.correctAnswers);
    const results = useQuizStore((state) => state.results);
    const reset = useQuizStore((state) => state.reset);
    const theme = useTheme();

    useEffect(() => {
        const getMatricula = async () => {
            try {
                const value = await AsyncStorage.getItem('matricula');
                if (value !== null) {
                    setMatricula(value);
                    setHasMatricula(true);
                }
            } catch (e) {
                console.error(e);
            }
        };

        const getQuizCode = async () => {
            try {
              const value = await AsyncStorage.getItem('codigo');
              setQuizCode(value);
              setHasQuizCode(true);
            } catch (e) {
              console.error(e)
            }
          };

        getMatricula();
        getQuizCode();
    }, []);

    useEffect(() => {
        if (!hasMatricula || !hasQuizCode) return;

        async function finishQuiz() {
            try {
                await api.post('/conectarAluno', JSON.stringify({
                    matricula: Number(matricula),
                    codigo: quizCode
                }));

                await api.post('/salvaPontuacao', JSON.stringify({
                    matricula: Number(matricula),
                    pontuacao: String(correctAnswers)
                }));
                
                await api.post('/gravarRespostas', {
                    matricula: matricula,
                    pontuacao: String(correctAnswers),
                    data: new Date().toISOString(),
                    questoes: results
                });
                
                const id = setInterval(async () => {
                    try {
                        const response = await api.get('/retornaPodio');
                        setStudents(response.data);
                        setPodiumReceived(true);
                    } catch (error) {
                        console.error('Error making API call:', error);
                    }
                }, 3000);

                setIntervalId(id);
            } catch (error) {
                console.error('Error making API call:', error);
            }
        }

        finishQuiz();
    }, [hasMatricula, hasQuizCode]);

    const handleEnd = async () => {
        if (intervalId) {
            clearInterval(intervalId);
        }

        await AsyncStorage.removeItem('matricula');
        await AsyncStorage.removeItem('codigo');
        navigation.popToTop();
        reset();
    };

    return (
        <GradientBackground>
            <Text variant='headlineSmall'>Questionário finalizado</Text>
            <Text variant='titleLarge' style={{ marginVertical: 30 }}>Você acertou {correctAnswers} de {quiz.questoes.length} questões</Text>

            {
                podiumReceived ? (
                    <Podium students={students} />
                ) : (
                    <ActivityIndicator animating={true} size="large" color={theme.colors.primary} style={{ marginVertical: 20 }}/>
                )

            }

            <Button
                mode="contained"
                style={{ padding: 10 }}
                onPress={handleEnd}>
                Encerrar
            </Button>
        </GradientBackground>
    );
}
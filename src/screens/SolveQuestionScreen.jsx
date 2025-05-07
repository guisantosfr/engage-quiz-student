import { useEffect, useState, useCallback } from "react";
import { Alert, BackHandler, TouchableOpacity, View, ScrollView } from "react-native";
import { useRoute, useFocusEffect } from "@react-navigation/native";
import { useTheme, ActivityIndicator, Button, Text } from "react-native-paper";
import api from '../services/api';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useQuizStore from "../stores/QuizStore";
import useStyles from "../hooks/useStyles";
import getReadingTime from '../utils/getReadingTime'
import GradientBackground from '../components/GradientBackground';
import ProgressBar from "../components/ProgressBar";

export default function SolveQuestionScreen({ navigation }) {
    const route = useRoute();
    const { quizToSolve } = route.params;

    const [timer, setTimer] = useState(0);
    const [timeIsOver, setTimeIsOver] = useState(false);
    const [key, setKey] = useState(0);
    const [matricula, setMatricula] = useState(null);
    const [hasMatricula, setHasMatricula] = useState(false);

    const [quizCode, setQuizCode] = useState(null);
    const [hasQuizCode, setHasQuizCode] = useState(false);

    const quiz = useQuizStore((state) => state.quiz);
    const currentQuestionIndex = useQuizStore((state) => state.currentQuestionIndex);
    const lastAnswer = useQuizStore((state) => state.lastAnswer);
    const setSelectedAnswer = useQuizStore((state) => state.setSelectedAnswer);
    const computeAnswer = useQuizStore((state) => state.computeAnswer);
    const nextQuestion = useQuizStore((state) => state.nextQuestion);
    const fetchQuiz = useQuizStore((state) => state.fetchQuiz);
    const reset = useQuizStore((state) => state.reset);
    const jumpToQuestion = useQuizStore((state) => state.jumpToQuestion);

    const theme = useTheme();
    const styles = useStyles();

    useEffect(() => {
        reset();
        fetchQuiz(quizToSolve);
    }, []);

    useEffect(() => {
        const getMatricula = async () => {
            try {
                const value = await AsyncStorage.getItem('matricula');
                setMatricula(value);
                setHasMatricula(true);
            } catch (e) {
                console.error(e)
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
    }, [])

    useEffect(() => {
        if (!hasMatricula || !hasQuizCode) return;

        async function connect() {
            await api.post('/conectarAluno', JSON.stringify({
                matricula: Number(matricula),
                codigo: quizCode
            }))
                .then(response =>
                    console.log(response.data))
                .catch((error) => {
                    console.error(error);
                });
        }

        connect();
    }, [currentQuestionIndex, hasMatricula, hasQuizCode]);

    useFocusEffect(
        useCallback(() => {
            setTimeIsOver(false);
            setSelectedAnswer(null);
        }, [])
    );

    useEffect(() => {
        if (quiz && quiz.questoes && quiz.questoes[currentQuestionIndex]) {
          const readingTime = getReadingTime(quiz.questoes[currentQuestionIndex].enunciado);
          setTimer(readingTime);
        }
      }, [currentQuestionIndex, quiz]);

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                Alert.alert(
                    "Alerta",
                    "Você quer mesmo sair do questionário?",
                    [
                        {
                            text: "Cancelar",
                            onPress: () => null,
                            style: "cancel"
                        },
                        {
                            text: "Sair",
                            onPress: () => navigation.popToTop()
                        }
                    ]
                );
                return true;
            }

            const backHandler = BackHandler.addEventListener(
                'hardwareBackPress',
                onBackPress
            );

            return () => {
                BackHandler.removeEventListener('hardwareBackPress', onBackPress);
            };
        }, [])
    )

    useEffect(() => {
        if (timeIsOver) {
            const socket = new WebSocket(process.env.EXPO_PUBLIC_WEBSOCKET_URL);

            socket.onmessage = function (event) {
                if (event.data == 'true') {
                    if (currentQuestionIndex === quiz.questoes.length - 1) {
                        finishQuiz();
                    } else {
                        answerNextQuestion();
                    }
                    socket.close();
                }
            };

        }
    }, [timeIsOver])

    useEffect(() => {
        async function compare() {
            await api.get('/retornaQuestaoAtual')
                .then(response => {
                    const current = response.data;

                    if (current !== currentQuestionIndex) {
                        setSelectedAnswer(null);

                        if (current === quiz.questoes.length) {
                            finishQuiz();
                        } else {
                            for (let i = currentQuestionIndex; i < current; i++) {
                                computeAnswer(null, quiz.questoes[i].resposta);
                            }

                            setKey(prevKey => prevKey + 1);
                            setTimeIsOver(false);
                            jumpToQuestion(current);
                        }

                    }

                })
                .catch((error) => {
                    console.error(error);
                });
        }

        compare();

    }, [currentQuestionIndex])

    const answerNextQuestion = () => {
        computeAnswer(lastAnswer, quiz.questoes[currentQuestionIndex].resposta)
        setSelectedAnswer(null);
        setKey(prevKey => prevKey + 1);
        setTimeIsOver(false);
        nextQuestion();
    }

    const finishQuiz = () => {
        computeAnswer(lastAnswer, quiz.questoes[currentQuestionIndex].resposta);
        navigation.navigate('Final');
    }

    const renderTime = ({ remainingTime }) => {
        return (
            <Text variant="titleLarge">{remainingTime}</Text>
        );
    };

    return (
        <GradientBackground>
            {
                !quiz ?
                    <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
                    :
                    (
                        <>
                            {
                                !timeIsOver ? (
                                    <CountdownCircleTimer
                                        key={key}
                                        isPlaying
                                        duration={timer}
                                        size={120}
                                        strokeWidth={6}
                                        colors={['#663399', '#93000a']}
                                        colorsTime={[timer, 0]}
                                        onComplete={() => setTimeIsOver(true)}>
                                        {renderTime}
                                    </CountdownCircleTimer>
                                ) : (
                                    <Text variant="titleLarge">
                                        Tempo esgotado
                                    </Text>
                                )}

                            <View style={styles.header}>
                                <Text variant="titleMedium">
                                    Questão {currentQuestionIndex + 1}
                                </Text>

                                <Text variant="titleMedium">
                                    {currentQuestionIndex + 1} / {quiz.questoes.length}
                                </Text>
                            </View>

                            <ProgressBar
                                total={quiz.questoes.length}
                                current={currentQuestionIndex + 1}
                            />

                            {
                                quiz.questoes[currentQuestionIndex].enunciado.length >= 275 ? (
                                    <ScrollView style={{ maxHeight: 300, width: '80%', marginVertical: 20}}>
                                        <Text variant="titleLarge">
                                            {quiz.questoes[currentQuestionIndex].enunciado}
                                        </Text>
                                    </ScrollView>
                                ) : (
                                    <Text
                                        variant="titleLarge"
                                        style={{ marginVertical: 20, width: '80%' }}>
                                        {quiz.questoes[currentQuestionIndex].enunciado}
                                    </Text>
                                )
                            }

                            {/* <Text
                                variant={renderQuestionText(quiz.questoes[currentQuestionIndex].enunciado)}
                                style={{ marginVertical: 20, width: '80%' }}>
                                {quiz.questoes[currentQuestionIndex].enunciado}
                            </Text> */}


                            <View style={styles.buttonContainer}>
                                {/* <Button
                                    mode={lastAnswer === true ? 'contained' : 'outlined'}
                                    onPress={() => setSelectedAnswer(true)}
                                    buttonColor={lastAnswer === true ? '#1E90FF' : theme.colors.outline}
                                    style={styles.button}
                                    disabled={timeIsOver}
                                >
                                    Verdadeiro
                                </Button> */}
                                <TouchableOpacity
                                    onPress={() => setSelectedAnswer(true)}
                                    disabled={timeIsOver}
                                    style={[
                                        styles.button,
                                        lastAnswer === true ? styles.containedTrue : styles.outlined(theme.colors.outline),
                                        timeIsOver && styles.disabled,
                                    ]}
                                >
                                    <Text style={[
                                        styles.text,
                                        lastAnswer === true && styles.containedText,
                                        timeIsOver && styles.disabledText
                                    ]}>
                                        Verdadeiro
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => setSelectedAnswer(false)}
                                    disabled={timeIsOver}
                                    style={[
                                        styles.button,
                                        lastAnswer === false ? styles.containedFalse : styles.outlined(theme.colors.outline),
                                        timeIsOver && styles.disabled,
                                    ]}
                                >
                                    <Text style={[
                                        styles.text,
                                        lastAnswer === false && styles.containedText,
                                        timeIsOver && styles.disabledText
                                    ]}>
                                        Falso
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {
                                (timeIsOver && lastAnswer === null) && (
                                    <Text variant="titleMedium">
                                        Você não respondeu a questão
                                    </Text>
                                )
                            }

                            {lastAnswer !== null && (
                                <Text variant="titleMedium">
                                    Você selecionou: {lastAnswer ? "Verdadeiro" : "Falso"}
                                </Text>
                            )}

                            {
                                timeIsOver && (
                                    currentQuestionIndex === quiz.questoes.length - 1 ?
                                        <>
                                            <Text variant="titleSmall" style={{ marginVertical: 20 }}>Aguarde a finalização do questionário</Text>
                                            <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
                                        </>
                                        :
                                        <>
                                            <Text variant="titleSmall" style={{ marginVertical: 20 }}>Aguarde a próxima questão</Text>
                                            <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
                                        </>
                                )

                            }

                        </>
                    )
            }
        </GradientBackground>
    );
}
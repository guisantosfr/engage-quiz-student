import { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    Pressable,
    Alert,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    BackHandler,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import GradientBackground from '@/components/GradientBackground';
import { Question } from '@/types/Question';
import Toast from 'react-native-toast-message';
import { io, Socket } from 'socket.io-client';

const OPTION_ICONS = ['diamond', 'circle', 'square', 'star'] as const;

const OPTION_COLORS = [
    { bg: 'bg-red-500/10', border: 'border-red-500/40', activeBg: 'bg-red-500/60' },
    { bg: 'bg-blue-500/10', border: 'border-blue-500/40', activeBg: 'bg-blue-500/60' },
    { bg: 'bg-yellow-500/10', border: 'border-yellow-500/40', activeBg: 'bg-yellow-500/60' },
    { bg: 'bg-green-500/10', border: 'border-green-500/40', activeBg: 'bg-green-500/60' },
];

const TRUE_FALSE_COLORS = [
    { bg: 'bg-blue-500/10', border: 'border-blue-500/40', activeBg: 'bg-blue-500/60' },
    { bg: 'bg-red-500/10', border: 'border-red-500/40', activeBg: 'bg-red-500/60' },
];

type ClosedReason = 'timeout' | 'all_answered' | null;

export default function DisplayQuestionScreen() {
    const { sessionId, n, playerId, quizTitle, totalQuestions, questionData } =
        useLocalSearchParams<{
            sessionId: string;
            n: string;
            playerId: string;
            quizTitle: string;
            totalQuestions: string;
            questionData: string;
        }>();

    const router = useRouter();
    const socketRef = useRef<Socket | null>(null);

    const initialQuestion: Question | null = questionData ? JSON.parse(questionData) : null;

    const [question, setQuestion] = useState<Question | null>(initialQuestion);
    const [questionNumber, setQuestionNumber] = useState(Number(n) + 1);
    const [totalQuestionsCount] = useState(Number(totalQuestions) || 0);
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(initialQuestion?.timeLimit ?? 0);
    const [confirmed, setConfirmed] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [closedReason, setClosedReason] = useState<ClosedReason>(null);

    // Timer countdown
    useEffect(() => {
        if (timeLeft <= 0 || confirmed || closedReason) return;

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [confirmed, closedReason, timeLeft]);

    // WebSocket connection
    useEffect(() => {
        const socket = io(`${process.env.EXPO_PUBLIC_API_URL}/sessions`, {
            transports: ['websocket'],
            autoConnect: true,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            socket.emit('join_session', { sessionId, playerId });
        });

        socket.on('answer_result', () => {
            setConfirmed(true);
        });

        socket.on('question_closed', (data: any) => {
            setClosedReason(data.reason ?? 'timeout');
        });

        socket.on('next_question', (data: any) => {
            const nextQuestion: Question = data.question;
            setQuestion(nextQuestion);
            setQuestionNumber((prev) => prev + 1);
            setSelectedOptionId(null);
            setConfirmed(false);
            setSubmitting(false);
            setClosedReason(null);
            setTimeLeft(nextQuestion.timeLimit);
        });

        socket.on('session_finished', () => {
            socket.disconnect();
            socketRef.current = null;
            router.replace({
                pathname: `/quiz/${sessionId}/results`,
                params: { playerId },
            });
        });

        socket.on('session_canceled', () => {
            Toast.show({ type: 'error', text1: 'Sessão cancelada pelo professor' });
            socket.disconnect();
            socketRef.current = null;
            router.dismissAll();
        });

        socket.on('connect_error', (err) => {
            console.error('Socket connect_error:', err?.message || err);
        });

        return () => {
            socket.off('answer_result');
            socket.off('question_closed');
            socket.off('next_question');
            socket.off('session_finished');
            socket.off('session_canceled');
            socket.off('connect_error');
            socket.disconnect();
            socketRef.current = null;
        };
    }, [sessionId, playerId]);

    const handleConfirm = useCallback(async () => {
        if (!selectedOptionId || confirmed || submitting || !question) return;

        setSubmitting(true);
        try {
            const response = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/sessions/${sessionId}/questions/${question.id}/answer`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ playerId, optionId: selectedOptionId }),
                }
            );

            if (!response.ok) {
                throw new Error('Erro ao enviar resposta');
            }
        } catch (error) {
            console.error(error);
            setSubmitting(false);
            Toast.show({ type: 'error', text1: 'Erro ao enviar resposta' });
        }
    }, [selectedOptionId, confirmed, submitting, question, sessionId, playerId]);

    const handleExit = useCallback(() => {
        Alert.alert(
            'Sair do Questionário',
            'Tem certeza que deseja sair? Seu progresso será perdido.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sair',
                    style: 'destructive',
                    onPress: () => {
                        socketRef.current?.disconnect();
                        router.dismissAll();
                    },
                },
            ]
        );
    }, [router]);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            handleExit();
            return true;
        });
        return () => backHandler.remove();
    }, [handleExit]);

    if (!question) {
        return (
            <GradientBackground>
                <SafeAreaView className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#60a5fa" />
                    <Text className="text-white/70 text-base mt-4">Carregando questão...</Text>
                </SafeAreaView>
            </GradientBackground>
        );
    }

    const timerProgress = question.timeLimit > 0 ? timeLeft / question.timeLimit : 0;
    const timerColor = timeLeft <= 5 ? '#ef4444' : timeLeft <= 10 ? '#f59e0b' : '#60a5fa';
    const isTrueFalse = question.type === 'TRUE_FALSE';
    const colors = isTrueFalse ? TRUE_FALSE_COLORS : OPTION_COLORS;
    const isLocked = confirmed || submitting || closedReason !== null || timeLeft <= 0;

    return (
        <GradientBackground>
            <SafeAreaView className="flex-1">
                <View className="flex-row items-center justify-between px-5 py-3">
                    <View className="flex-1">
                        <Text className="text-lg text-white/70">
                            Questão {questionNumber} de {totalQuestionsCount}
                        </Text>
                    </View>
                    <Pressable
                        onPress={handleExit}
                        className="w-10 h-10 items-center justify-center rounded-full bg-white/10 ml-3"
                    >
                        <FontAwesome6 name="xmark" iconStyle="solid" size={18} color="white" />
                    </Pressable>
                </View>

                <ScrollView
                    className="flex-1 px-5"
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View className="items-center py-4">
                        {closedReason === null && timeLeft > 0 ? (
                            <>
                                <View className="w-20 h-20 rounded-full items-center justify-center border-4"
                                    style={{
                                        borderColor: timerColor,
                                        backgroundColor: `${timerColor}15`,
                                    }}
                                >
                                    <Text className="text-2xl font-bold" style={{ color: timerColor }}>
                                        {timeLeft}
                                    </Text>
                                </View>
                                <View className="w-full h-2 bg-white/10 rounded-full mt-4 overflow-hidden">
                                    <View
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${timerProgress * 100}%`,
                                            backgroundColor: timerColor,
                                        }}
                                    />
                                </View>
                            </>
                        ) : closedReason === 'all_answered' ? (
                            <View className="bg-blue-500/20 border border-blue-500/40 rounded-2xl px-6 py-3 flex-row items-center gap-3">
                                <FontAwesome6 name="users" iconStyle="solid" size={20} color="#60a5fa" />
                                <Text className="text-blue-400 text-lg font-bold">Todos responderam</Text>
                            </View>
                        ) : (
                            <View className="bg-red-500/20 border border-red-500/40 rounded-2xl px-6 py-3 flex-row items-center gap-3">
                                <FontAwesome6 name="clock" iconStyle="solid" size={20} color="#ef4444" />
                                <Text className="text-red-400 text-lg font-bold">Tempo Esgotado</Text>
                            </View>
                        )}
                    </View>

                    <View className="bg-white/10 rounded-2xl p-5 border border-white/20 my-5">
                        <Text className="text-white text-xl font-semibold leading-7">
                            {question.text}
                        </Text>
                    </View>

                    <View className={`gap-3 ${isTrueFalse ? '' : 'mt-2'}`}>
                        {question.options.map((option, index) => {
                            const colorSet = colors[index % colors.length];
                            const isSelected = selectedOptionId === option.id;
                            const bgClass = isSelected ? colorSet.activeBg : colorSet.bg;
                            const borderClass = colorSet.border;

                            return (
                                <Pressable
                                    key={option.id}
                                    onPress={() => !isLocked && setSelectedOptionId(option.id)}
                                    className={`rounded-2xl p-4 flex-row items-center gap-4 border ${bgClass} ${borderClass} ${isLocked ? 'opacity-70' : ''}`}
                                    disabled={isLocked}
                                >
                                    <View className={`w-10 h-10 rounded-full items-center justify-center ${isSelected ? 'bg-white/30' : 'bg-white/10'}`}>
                                        {isTrueFalse ? (
                                            <FontAwesome6
                                                name={index === 0 ? 'check' : 'xmark'}
                                                iconStyle="solid"
                                                size={18}
                                                color="white"
                                            />
                                        ) : (
                                            <FontAwesome6
                                                name={OPTION_ICONS[index % OPTION_ICONS.length]}
                                                iconStyle="solid"
                                                size={16}
                                                color="white"
                                            />
                                        )}
                                    </View>
                                    <Text className="text-white text-base flex-1 font-medium">
                                        {option.text}
                                    </Text>
                                    {isSelected && (
                                        <FontAwesome6 name="paper-plane" iconStyle="solid" size={20} color="white" />
                                    )}
                                </Pressable>
                            );
                        })}
                    </View>

                    {!isLocked && (
                        <Pressable
                            onPress={handleConfirm}
                            disabled={!selectedOptionId}
                            className={`mt-8 p-4 rounded-2xl flex-row items-center justify-center gap-3 ${selectedOptionId ? 'bg-blue-600 active:bg-blue-700' : 'bg-white/10'}`}
                            style={selectedOptionId ? styles.button : undefined}
                        >
                            <FontAwesome6
                                name="arrow-right"
                                iconStyle="solid"
                                size={20}
                                color={selectedOptionId ? 'white' : 'rgba(255,255,255,0.4)'}
                            />
                            <Text className={`text-lg font-bold ${selectedOptionId ? 'text-white' : 'text-white/40'}`}>
                                Confirmar Resposta
                            </Text>
                        </Pressable>
                    )}

                    {isLocked && (
                        <View className="mt-8 items-center gap-3 bg-white/5 rounded-2xl p-5 border border-white/10">
                            <ActivityIndicator size="small" color="#60a5fa" />
                            <Text className="text-white/70 text-base font-medium text-center">
                                Aguarde a próxima questão
                            </Text>
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: 32,
    },
    button: {
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});
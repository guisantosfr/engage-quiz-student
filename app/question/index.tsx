import { useState, useEffect, useCallback } from 'react';
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
import { Redirect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import GradientBackground from '@/components/GradientBackground';
import QuestionTimer from '@/components/QuestionTimer';
import Toast from 'react-native-toast-message';
import { useSessionStore } from '@/stores/useSessionStore';

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
    const router = useRouter();

    const { session, player, socket, currentQuestion, questionNumber, setNextQuestion, disconnectSocket, resetGame } = useSessionStore();

    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const [confirmed, setConfirmed] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [closedReason, setClosedReason] = useState<ClosedReason>(null);

    const totalQuestionsCount = session?.quiz?.numberOfQuestions;

    useEffect(() => {
        setSelectedOptionId(null);
        setConfirmed(false);
        setSubmitting(false);
        setClosedReason(null);
    }, [currentQuestion?.id]);

    useEffect(() => {
        if (!socket) return;

        const onAnswerResult = () => setConfirmed(true);

        const onQuestionClosed = (data: any) => setClosedReason(data.reason ?? 'timeout');

        const onNextQuestion = (data: any) => {
            setNextQuestion(data.question, questionNumber + 1);
        };

        const onSessionFinished = () => {
            router.replace('/results');
        };

        const onSessionCanceled = () => {
            Toast.show({ type: 'error', text1: 'Sessão cancelada pelo professor' });
            resetGame();
            disconnectSocket();
            router.dismissAll();
        };

        socket.on('answer_result', onAnswerResult);
        socket.on('question_closed', onQuestionClosed);
        socket.on('next_question', onNextQuestion);
        socket.on('session_finished', onSessionFinished);
        socket.on('session_canceled', onSessionCanceled);

        return () => {
            socket.off('answer_result', onAnswerResult);
            socket.off('question_closed', onQuestionClosed);
            socket.off('next_question', onNextQuestion);
            socket.off('session_finished', onSessionFinished);
            socket.off('session_canceled', onSessionCanceled);
        };
    }, [socket, questionNumber]);

    const handleConfirm = useCallback(async () => {
        if (!selectedOptionId || confirmed || submitting) return;

        setSubmitting(true);
        try {
            const response = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/sessions/${session?.id}/questions/${currentQuestion?.id}/answer`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ playerId: player?.id, optionId: selectedOptionId }),
                }
            );

            if (!response.ok) throw new Error('Erro ao enviar resposta');
        } catch (error) {
            console.error(error);
            setSubmitting(false);
            Toast.show({ type: 'error', text1: 'Erro ao enviar resposta' });
        }
    }, [selectedOptionId, confirmed, submitting, currentQuestion?.id, session?.id, player?.id]);

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
                        resetGame();
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

    const isTrueFalse = currentQuestion?.type === 'TRUE_FALSE';
    const colors = isTrueFalse ? TRUE_FALSE_COLORS : OPTION_COLORS;
    const isLocked = confirmed || submitting || closedReason !== null;
    const hideOptionTexts = currentQuestion?.options.some((o) => o.text.length >= 85);

    if (!session || !player || !currentQuestion) {
        return <Redirect href="/join" />;
    }

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
                        {closedReason === null ? (
                            <QuestionTimer
                                timeLimit={currentQuestion.timeLimit}
                                isLocked={isLocked}
                            />
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
                            {currentQuestion.text}
                        </Text>
                    </View>

                    {hideOptionTexts && (
                        <View className="bg-yellow-500/15 border border-yellow-500/30 rounded-xl px-4 py-3 flex-row items-center gap-3 mb-4">
                            <FontAwesome6 name="tv" iconStyle="solid" size={16} color="#eab308" />
                            <Text className="text-yellow-300 text-sm font-medium flex-1">
                                Leia as opções na tela do professor
                            </Text>
                        </View>
                    )}

                    <View className={`gap-3 ${isTrueFalse ? '' : 'mt-2'}`}>
                        {currentQuestion.options.map((option, index) => {
                            const colorSet = colors[index % colors.length];
                            const isSelected = selectedOptionId === option.id;
                            const bgClass = isSelected ? colorSet.activeBg : colorSet.bg;
                            const borderClass = colorSet.border;

                            return (
                                <Pressable
                                    key={option.id}
                                    onPress={() => !isLocked && setSelectedOptionId(option.id)}
                                    className={`rounded-2xl p-4 flex-row items-center ${hideOptionTexts ? 'justify-center' : 'gap-4'} border ${bgClass} ${borderClass} ${isLocked ? 'opacity-70' : ''}`}
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
                                    {!hideOptionTexts && (
                                        <Text className="text-white text-base flex-1 font-medium">
                                            {option.text}
                                        </Text>
                                    )}
                                    {isSelected && !hideOptionTexts && (
                                        <FontAwesome6 name="paper-plane" iconStyle="solid" size={20} color="white" />
                                    )}
                                </Pressable>
                            );
                        })}
                    </View>
                </ScrollView>

                <View className="px-5 pb-4">
                    {!isLocked ? (
                        <Pressable
                            onPress={handleConfirm}
                            disabled={!selectedOptionId}
                            className={`p-4 rounded-2xl flex-row items-center justify-center gap-3 ${selectedOptionId ? 'bg-blue-600 active:bg-blue-700' : 'bg-white/10'}`}
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
                    ) : (
                        <View className="items-center gap-3 bg-white/5 rounded-2xl p-5 border border-white/10">
                            <ActivityIndicator size="small" color="#60a5fa" />
                            <Text className="text-white/70 text-base font-medium text-center">
                                {questionNumber === totalQuestionsCount
                                    ? 'Aguarde os resultados do questionário'
                                    : 'Aguarde a próxima questão'}
                            </Text>
                        </View>
                    )}
                </View>
            </SafeAreaView>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: 16,
    },
    button: {
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});
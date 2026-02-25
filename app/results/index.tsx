import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import GradientBackground from '@/components/GradientBackground';
import Toast from 'react-native-toast-message';
import { useSessionStore } from '@/stores/useSessionStore';
import AnswerItem from '@/components/AnswerItem';

export interface AnswerDetail {
    questionIndex: number;
    questionText: string;
    selectedOption: { id: string; text: string } | null;
    correctOption: { id: string; text: string };
    isCorrect: boolean;
}

interface ResultsData {
    session: { id: string; code: string };
    quiz: { title: string; numberOfQuestions: number };
    performance: {
        correctAnswers: number;
        totalAnswers: number;
        accuracy: number;
        position: number;
        totalPlayers: number;
    };
    answers: AnswerDetail[];
}

export default function FinalResultsScreen() {
    const router = useRouter();
    const { session, player, resetGame } = useSessionStore();

    const [results, setResults] = useState<ResultsData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchResults = useCallback(async () => {
        const { session: s, player: p } = useSessionStore.getState();
        if (!s || !p) return;
        try {
            const response = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/sessions/${s.id}/results/${p.id}`
            );
            if (!response.ok) throw new Error('Erro ao carregar resultados');
            const data: ResultsData = await response.json();
            setResults(data);
        } catch (error) {
            console.error(error);
            Toast.show({ type: 'error', text1: 'Erro ao carregar resultados' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchResults();
    }, [fetchResults]);

    if (!session || !player) {
        return <Redirect href="/join" />;
    }

    if (loading) {
        return (
            <GradientBackground>
                <SafeAreaView className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#60a5fa" />
                    <Text className="text-white/70 text-base mt-4">Carregando resultados...</Text>
                </SafeAreaView>
            </GradientBackground>
        );
    }

    if (!results) {
        return (
            <GradientBackground>
                <SafeAreaView className="flex-1 items-center justify-center px-8">
                    <FontAwesome6 name="circle-exclamation" iconStyle="solid" size={40} color="#ef4444" />
                    <Text className="text-white text-lg font-semibold mt-4 text-center">
                        Não foi possível carregar os resultados
                    </Text>
                    <Pressable
                        onPress={() => router.dismissAll()}
                        className="mt-6 px-8 py-3 rounded-2xl bg-blue-600 active:bg-blue-700"
                    >
                        <Text className="text-white font-bold text-base">Voltar ao Início</Text>
                    </Pressable>
                </SafeAreaView>
            </GradientBackground>
        );
    }

    const { quiz, performance, answers } = results;

    return (
        <GradientBackground>
            <SafeAreaView className="flex-1">
                <View className="items-center p-5 my-5">
                    <FontAwesome6 name="flag-checkered" iconStyle="solid" size={28} color="#60a5fa" />
                    <Text className="text-2xl font-bold text-white my-2">Resultado Final</Text>
                    <Text className="text-white/60">{quiz.title}</Text>
                </View>

                <ScrollView
                    className="flex-1 px-5"
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View className="bg-blue-500/20 rounded-2xl p-5 border border-blue-500/40 mb-4">
                        <View className="flex-row items-center gap-4">
                            <View className="w-14 h-14 rounded-full bg-blue-500 items-center justify-center">
                                <FontAwesome6 name="user" iconStyle="solid" size={24} color="white" />
                            </View>
                            <View className="flex-1 ml-2">
                                <Text className="text-white/60">{player.nickname}</Text>
                                <Text className="text-white text-2xl font-bold my-1">
                                    {performance.position}º lugar
                                </Text>
                                <Text className="text-white/50 text-sm">
                                    de {performance.totalPlayers} {performance.totalPlayers === 1 ? 'jogador' : 'jogadores'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View className="flex-row gap-3 mb-6">
                        <View className="flex-1 bg-green-500/15 rounded-2xl p-4 border border-green-500/30 items-center">
                            <FontAwesome6 name="check" iconStyle="solid" size={18} color="#22c55e" />
                            <Text className="text-green-400 text-2xl font-bold mt-1">
                                {performance.correctAnswers}
                            </Text>
                            <Text className="text-white/50 text-sm">{performance.correctAnswers === 1 ? 'Acerto' : 'Acertos'}</Text>
                        </View>
                        <View className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/10 items-center">
                            <FontAwesome6 name="list-ol" iconStyle="solid" size={18} color="#60a5fa" />
                            <Text className="text-blue-400 text-2xl font-bold mt-1">
                                {performance.totalAnswers}
                            </Text>
                            <Text className="text-white/50 text-sm">{performance.totalAnswers === 1 ? 'Resposta' : 'Respostas'}</Text>
                        </View>
                        <View className="flex-1 bg-yellow-500/15 rounded-2xl p-4 border border-yellow-500/30 items-center">
                            <FontAwesome6 name="percent" iconStyle="solid" size={18} color="#eab308" />
                            <Text className="text-yellow-400 text-2xl font-bold mt-1">
                                {performance.accuracy}%
                            </Text>
                            <Text className="text-white/50 text-sm">Precisão</Text>
                        </View>
                    </View>

                    <Text className="text-white text-lg font-semibold mb-3">Suas Respostas</Text>
                    <View className="gap-3">
                        {answers.map((answer) => (
                            <AnswerItem key={answer.questionIndex} answer={answer} />
                        ))}
                    </View>
                </ScrollView>

                <View className="px-5 pb-4">
                    <Pressable
                        onPress={() => { resetGame(); router.dismissAll(); }}
                        className="p-4 rounded-2xl bg-blue-600 active:bg-blue-700"
                        style={styles.button}
                    >
                        <View className="flex-row items-center justify-center gap-3">
                            <FontAwesome6 name="house" iconStyle="solid" size={20} color="white" />
                            <Text className="text-xl text-white font-bold">Voltar ao Início</Text>
                        </View>
                    </Pressable>
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
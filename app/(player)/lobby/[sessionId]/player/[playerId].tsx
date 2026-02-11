import { useCallback, useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    Pressable,
    Alert,
    ActivityIndicator,
    ScrollView,
    StyleSheet
} from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import GradientBackground from '@/components/GradientBackground';
import { Session } from '@/types/Session';
import { Player } from '@/types/Player';
import Toast from 'react-native-toast-message';
import { io, Socket } from 'socket.io-client';

const MAX_VISIBLE_PLAYERS = 10;

export default function StudentLobbyScreen() {
    const { sessionId, playerId } = useLocalSearchParams<{
        sessionId: string;
        playerId: string;
    }>();

    const router = useRouter();

    const [session, setSession] = useState<Session>();
    const [player, setPlayer] = useState<Player>();
    const [players, setPlayers] = useState<Player[]>([]);

    const socketRef = useRef<Socket | null>(null);

    if (!sessionId || !playerId) {
        return <Redirect href="/join" />;
    }

    const fetchSessionPlayerData = useCallback(async () => {
        try {
            const response = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/sessions/${sessionId}/player/${playerId}`
            );
            const data = await response.json();
            setSession(data.session);
            setPlayer(data.player);
        } catch (error) {
            console.error(error);
            Toast.show({ type: 'error', text1: 'Erro ao carregar sessão' });
        }
    }, [sessionId, playerId]);

    const fetchPlayers = useCallback(async () => {
        try {
            const response = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/sessions/${sessionId}/players`
            );
            const data = await response.json();
            setPlayers(data);
        } catch (error) {
            console.error(error);
        }
    }, [sessionId]);

    useEffect(() => {
        fetchSessionPlayerData();
        fetchPlayers();
    }, [fetchSessionPlayerData, fetchPlayers]);

    const leaveSession = useCallback(async () => {
        try {
            const response = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/sessions/${sessionId}/players/${playerId}/leave`,
                { method: 'DELETE' }
            );

            if (response.ok) {
                Toast.show({ type: 'success', text1: 'Você saiu da sessão' });
                socketRef.current?.disconnect();
                router.replace('/join');
            } else {
                Toast.show({ type: 'error', text1: 'Não foi possível sair da sessão' });
            }
        } catch (error) {
            console.error(error)
            Toast.show({ type: 'error', text1: 'Não foi possível sair da sessão' });
        }
    }, [sessionId, playerId, router]);

    const handleExit = () => {
        Alert.alert(
            'Sair do Lobby',
            'Tem certeza que deseja sair do questionário?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sair',
                    style: 'destructive',
                    onPress: leaveSession
                },
            ]
        );
    };

    useEffect(() => {
        const socket = io(`${process.env.EXPO_PUBLIC_API_URL}/sessions`, {
            transports: ['websocket'],
            autoConnect: true,
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            socket.emit('join_session', {
                sessionId,
                playerId,
                nickname: player?.nickname ?? 'Aluno',
            });
        });

        const shouldHandle = (payload: any) => {
            return !payload?.sessionId || payload.sessionId === sessionId;
        };

        const refreshPlayers = async (payload: any) => {
            if (!shouldHandle(payload)) return;
            await fetchPlayers();
        };

        const onPlayerKicked = (payload: any) => {
            if (!shouldHandle(payload)) return;

            const kickedId = payload?.player?.playerId ?? payload?.playerId;

            if (kickedId === playerId) {
                Toast.show({ type: 'error', text1: 'Você foi expulso da sessão' });
                socket.disconnect();
                router.replace('/join');
            }
        };

        const onSessionCanceled = (payload: any) => {
            if (!shouldHandle(payload)) return;
            Toast.show({ type: 'error', text1: 'Sessão cancelada' });
            socket.disconnect();
            router.replace('/join');
        };

        socket.on('player_joined', refreshPlayers);
        socket.on('player_left', refreshPlayers);
        socket.on('player_disconnected', refreshPlayers);

        socket.on('player_kicked', onPlayerKicked);
        socket.on('session_canceled', onSessionCanceled);

        socket.on('quiz_started', (data: any) => {
            socket.disconnect();
            socketRef.current = null;

            const firstQuestion = data.firstQuestion;
            router.replace({
                pathname: `/quiz/${sessionId}/question/0`,
                params: {
                    playerId,
                    quizTitle: session?.quiz?.title ?? '',
                    totalQuestions: String(session?.quiz?.numberOfQuestions ?? 0),
                    questionData: JSON.stringify(firstQuestion),
                },
            });
        });

        socket.on('connect_error', (err) => {
            console.error('Socket connect_error:', err?.message || err);
        });

        return () => {
            socket.off('player_joined', refreshPlayers);
            socket.off('player_left', refreshPlayers);
            socket.off('player_disconnected', refreshPlayers);
            socket.off('player_kicked', onPlayerKicked);
            socket.off('session_canceled', onSessionCanceled);
            socket.off('quiz_started');
            socket.disconnect();
            socketRef.current = null;
        };

    }, [sessionId, playerId, fetchPlayers, router]);

    const visiblePlayers = players.slice(0, MAX_VISIBLE_PLAYERS);
    const hiddenPlayersCount = Math.max(0, players.length - MAX_VISIBLE_PLAYERS);

    return (
        <GradientBackground>
            <SafeAreaView className="flex-1">
                <View className="flex-row items-center justify-between px-5 py-4">
                    <Text className="text-xl font-bold text-white flex-1">
                        {session?.quiz.title}
                    </Text>
                    <Pressable
                        onPress={handleExit}
                        className="w-10 h-10 items-center justify-center rounded-full bg-white/10"
                    >
                        <FontAwesome6 name="xmark" iconStyle="solid" size={18} color="white" />
                    </Pressable>
                </View>

                <ScrollView
                    className="flex-1 px-5"
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View className="items-center py-8">
                        <ActivityIndicator size="large" color="#60a5fa" />
                        <Text className="text-white/70 text-base mt-4 text-center">
                            Aguarde o professor iniciar o questionário
                        </Text>
                    </View>

                    <View className="bg-white/10 rounded-2xl p-4 flex-col items-center gap-4 border border-white/20 w-3/4 mx-auto">
                        <View className="w-16 h-16 rounded-full bg-blue-500 items-center justify-center">
                            <FontAwesome6 name="user" iconStyle="solid" size={32} color="white" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-white/60 text-sm text-center">Conectado como</Text>
                            <Text className="text-white text-lg font-semibold text-center">{player?.nickname}</Text>
                        </View>
                    </View>

                    <View className="flex-row items-center justify-between mt-8 mb-4">
                        <Text className="text-white text-lg font-semibold">
                            Jogadores conectados
                        </Text>
                        <View className="bg-blue-500 px-3 py-1 rounded-full">
                            <Text className="text-white font-bold">{players.length}</Text>
                        </View>
                    </View>

                    <View className="flex-row flex-wrap gap-3 justify-center">
                        {visiblePlayers.map((player) => (
                            <View
                                key={player?.id}
                                className="bg-white/10 rounded-xl px-4 py-3 flex-row items-center gap-2 border border-white/10"
                            >
                                <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center">
                                    <FontAwesome6 name="user" iconStyle="solid" size={12} color="rgba(255,255,255,0.8)" />
                                </View>
                                <Text className="text-white text-sm">{player?.nickname}</Text>
                            </View>
                        ))}

                        {hiddenPlayersCount > 0 && (
                            <View className="bg-white/5 rounded-xl px-4 py-3 flex-row items-center gap-2 border border-dashed border-white/20">
                                <View className="w-8 h-8 rounded-full bg-white/10 items-center justify-center">
                                    <FontAwesome6 name="users" iconStyle="solid" size={12} color="rgba(255,255,255,0.5)" />
                                </View>
                                <Text className="text-white/60 text-sm">+{hiddenPlayersCount} outro(s)</Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: 24,
    },
});
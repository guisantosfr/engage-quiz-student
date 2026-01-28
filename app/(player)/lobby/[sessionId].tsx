import { useEffect, useState } from 'react';
import {
    View,
    Text,
    Pressable,
    Alert,
    ActivityIndicator,
    ScrollView,
    StyleSheet
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import GradientBackground from '@/components/GradientBackground';

const MAX_VISIBLE_PLAYERS = 10;

export default function StudentLobbyScreen() {
    const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
    const router = useRouter();

    const [session, setSession] = useState(null);

    useEffect(() => {
        const fetchSessionData = async () => {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/sessions/${sessionId}`);
            const data = await response.json();
            setSession(data);
        };
        fetchSessionData();
    }, [])

    const [quizName] = useState('Questionário de Geografia');
    const [playerName] = useState('Guilherme');
    const [players] = useState([
        { id: '1', name: 'Guilherme' },
        { id: '2', name: 'Maria' },
        { id: '3', name: 'João' },
        { id: '4', name: 'Ana' },
        { id: '5', name: 'Pedro' },
        { id: '6', name: 'Carla' },
        { id: '7', name: 'Lucas' },
        { id: '8', name: 'Fernanda' },
        { id: '9', name: 'Ricardo' },
        { id: '10', name: 'Julia' },
        { id: '11', name: 'Bruno' },
    ]);

    const visiblePlayers = players.slice(0, MAX_VISIBLE_PLAYERS);
    const hiddenPlayersCount = Math.max(0, players.length - MAX_VISIBLE_PLAYERS);

    const handleExit = () => {
        Alert.alert(
            'Sair do Lobby',
            'Tem certeza que deseja sair do questionário?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sair',
                    style: 'destructive',
                    onPress: () => router.back()
                },
            ]
        );
    };

    return (
        <GradientBackground>
            <SafeAreaView className="flex-1">
                <View className="flex-row items-center justify-between px-5 py-4">
                    <View className="w-10" />
                    <Text className="text-xl font-bold text-white text-center flex-1">
                        {quizName}
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
                            <Text className="text-white text-lg font-semibold text-center">{playerName}</Text>
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
                                key={player.id}
                                className="bg-white/10 rounded-xl px-4 py-3 flex-row items-center gap-2 border border-white/10"
                            >
                                <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center">
                                    <FontAwesome6 name="user" iconStyle="solid" size={12} color="rgba(255,255,255,0.8)" />
                                </View>
                                <Text className="text-white text-sm">{player.name}</Text>
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
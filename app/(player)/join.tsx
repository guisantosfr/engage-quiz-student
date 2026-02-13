import { useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, Text, TextInput, View, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Alert } from "react-native";
import GradientBackground from "@/components/GradientBackground";
import FontAwesome6 from "@react-native-vector-icons/fontawesome6";
import Toast from "react-native-toast-message";

export default function JoinScreen() {
    const router = useRouter();

    const [nickname, setNickname] = useState<string>('');
    const [sessionCode, setSessionCode] = useState<string>('');

    const handleJoin = async () => {
        if (!nickname || !sessionCode) {
            return Toast.show({
                type: 'error',
                text1: 'Por favor, preencha todos os campos.',
            })
        }

        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/sessions/${sessionCode}/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nickname: nickname.trim(),
                }),
            });

            if (response.ok) {
                const data = await response.json();

                Toast.show({
                    type: 'success',
                    text1: 'Conectado com sucesso!',
                })

                router.push(`/lobby/${data.session.id}/player/${data.player.id}?nickname=${encodeURIComponent(nickname.trim())}`);
            }
        } catch (error) {
            console.error(error);

            Toast.show({
                type: 'error',
                text1: 'Erro ao se conectar ao questionário.',
            })
        }
    };

    return (
        <GradientBackground>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View className="flex-1 items-center justify-center gap-6 px-6 py-10">
                        <Text className="text-4xl font-bold text-white tracking-wide">
                            EngageQuiz
                        </Text>
                        <Text className="text-lg text-white/80 text-center mb-4">
                            Preencha os campos abaixo para se conectar a um questionário
                        </Text>

                        <View className="w-full">
                            <Text className="text-sm text-white/70 mb-2 ml-1">
                                Apelido / Nickname
                            </Text>
                            <View className="flex-row items-center bg-white/10 rounded-2xl border border-white/20 px-4">
                                <FontAwesome6
                                    name="user"
                                    iconStyle="solid"
                                    size={18}
                                    color="rgba(255,255,255,0.6)"
                                />
                                <TextInput
                                    placeholder="Como gostaria de ser chamado?"
                                    placeholderTextColor="rgba(255,255,255,0.4)"
                                    className="flex-1 p-4 text-white text-base"
                                    maxLength={20}
                                    value={nickname}
                                    onChangeText={setNickname}
                                />
                            </View>
                        </View>

                        <View className="w-full">
                            <Text className="text-sm text-white/70 mb-2 ml-1">
                                Código / PIN (6 dígitos)
                            </Text>
                            <View className="flex-row items-center bg-white/10 rounded-2xl border border-white/20 px-4">
                                <FontAwesome6
                                    name="hashtag"
                                    iconStyle="solid"
                                    size={18}
                                    color="rgba(255,255,255,0.6)"
                                />
                                <TextInput
                                    placeholder="Digite o PIN de 6 dígitos"
                                    placeholderTextColor="rgba(255,255,255,0.4)"
                                    className="flex-1 p-4 text-white text-base tracking-widest"
                                    maxLength={6}
                                    keyboardType="numeric"
                                    value={sessionCode}
                                    onChangeText={setSessionCode}
                                />
                            </View>
                        </View>

                        <Pressable
                            className="w-full mt-4 p-4 rounded-2xl bg-blue-600 active:bg-blue-700"
                            style={styles.button}
                            onPress={handleJoin}
                        >
                            <View className="flex-row items-center justify-center gap-3">
                                <FontAwesome6
                                    name="right-to-bracket"
                                    iconStyle="solid"
                                    size={20}
                                    color="white"
                                />
                                <Text className="text-xl text-white font-bold">
                                    Conectar
                                </Text>
                            </View>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </GradientBackground>
    )
}

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    button: {
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});
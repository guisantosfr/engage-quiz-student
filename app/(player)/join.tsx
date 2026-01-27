import { Pressable, Text, TextInput, View } from "react-native";
import GradientBackground from "@/components/GradientBackground";
//import Header from "@/components/Header";

export default function JoinScreen() {
    return (
        <GradientBackground>
            {/* <Header /> */}

            <View className="flex-1 items-center justify-center gap-5">
                <Text className="text-3xl font-bold text-white">
                    EngageQuiz
                </Text>
                <Text className="text-xl text-white w-3/4 mx-auto">
                    Preencha os campos abaixo para se conectar a um questionário
                </Text>


                {/* label */}
                <Text className="text-md text-white w-3/4 mx-auto">
                    Apelido / Nickname
                </Text>
                <TextInput
                    placeholder="Como gostaria de ser chamado?"
                    placeholderTextColor="white"
                    className="w-3/4 mx-auto p-4 rounded-lg border border-white text-white"
                    maxLength={20}
                />

                <Text className="text-md text-white w-3/4 mx-auto">
                    Código / PIN (6 dígitos)
                </Text>
                <TextInput
                    placeholder="######"
                    placeholderTextColor="white"
                    className="w-3/4 mx-auto p-4 rounded-lg border border-white text-white"
                    maxLength={6}
                    keyboardType="numeric"
                />

                <Pressable className="mx-auto p-4 rounded-xl bg-blue-700 w-1/2">
                    <Text className="text-xl text-white font-bold text-center">Conectar</Text>
                </Pressable>
            </View>
        </GradientBackground>
    )
}
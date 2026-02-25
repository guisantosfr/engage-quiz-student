import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';

interface AnswerDetail {
    questionIndex: number;
    questionText: string;
    selectedOption: { id: string; text: string } | null;
    correctOption: { id: string; text: string };
    isCorrect: boolean;
}

export default function AnswerItem({ answer }: { answer: AnswerDetail }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <Pressable
            onPress={() => setExpanded(!expanded)}
            className={`rounded-xl p-4 border ${answer.isCorrect
                ? 'bg-green-500/10 border-green-500/25'
                : 'bg-red-500/10 border-red-500/25'
                }`}
        >
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                    <View className={`w-8 h-8 rounded-full items-center justify-center ${answer.isCorrect ? 'bg-green-500/30' : 'bg-red-500/30'
                        }`}>
                        <FontAwesome6
                            name={answer.isCorrect ? 'check' : 'xmark'}
                            iconStyle="solid"
                            size={14}
                            color={answer.isCorrect ? '#22c55e' : '#ef4444'}
                        />
                    </View>
                    <Text className="text-white font-semibold text-base">
                        Questão {answer.questionIndex + 1}
                    </Text>
                </View>
                <FontAwesome6
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    iconStyle="solid"
                    size={14}
                    color="rgba(255,255,255,0.5)"
                />
            </View>

            {expanded && (
                <View className="mt-4 pt-4 border-t border-white/10">
                    <Text className="text-white font-medium mb-3">
                        {answer.questionText}
                    </Text>

                    <View className="gap-2">
                        <Text className="text-white/60">
                            Sua resposta:{' '}
                            <Text className={answer.isCorrect ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>
                                {answer.selectedOption ? answer.selectedOption.text : 'Não respondida'}
                            </Text>
                        </Text>
                        {!answer.isCorrect && (
                            <Text className="text-white/60">
                                Correta:{' '}
                                <Text className="text-green-400 font-semibold">{answer.correctOption.text}</Text>
                            </Text>
                        )}
                    </View>
                </View>
            )}
        </Pressable>
    );
}

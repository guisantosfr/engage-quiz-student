import { View, Text } from 'react-native';
import useAccurateTimer from '@/app/hooks/useAccurateTimer';

interface QuestionTimerProps {
    timeLimit: number;
    isLocked: boolean;
}

export default function QuestionTimer({ timeLimit, isLocked }: QuestionTimerProps) {
    const timeLeft = useAccurateTimer(timeLimit, isLocked);

    const timerColor = timeLeft <= 5 ? '#ef4444' : timeLeft <= 10 ? '#f59e0b' : '#60a5fa';
    const timerProgress = timeLimit > 0 ? timeLeft / timeLimit : 0;

    return (
        <>
            <View
                className="w-20 h-20 rounded-full items-center justify-center border-4"
                style={{ borderColor: timerColor, backgroundColor: `${timerColor}15` }}
            >
                <Text className="text-2xl font-bold" style={{ color: timerColor }}>
                    {timeLeft}
                </Text>
            </View>
            <View className="w-full h-2 bg-white/10 rounded-full mt-4 overflow-hidden">
                <View
                    className="h-full rounded-full"
                    style={{ width: `${timerProgress * 100}%`, backgroundColor: timerColor }}
                />
            </View>
        </>
    );
}

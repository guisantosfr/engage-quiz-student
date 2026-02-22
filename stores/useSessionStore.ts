import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { Session } from '@/types/Session';
import { Player } from '@/types/Player';
import { Question } from '@/types/Question';

interface GameState {
    // Dados estáticos da partida
    session: Session | null;
    player: Player | null;

    // Estado dinâmico do jogo
    currentQuestion: Question | null;
    questionNumber: number;

    // Conexão Global
    socket: Socket | null;

    // Actions (Mutadores)
    setJoinData: (session: Session, player: Player) => void;
    connectSocket: () => void;
    disconnectSocket: () => void;
    setNextQuestion: (question: Question, number: number) => void;
    resetGame: () => void;
}

export const useSessionStore = create<GameState>((set, get) => ({
    session: null,
    player: null,
    currentQuestion: null,
    questionNumber: 0,
    socket: null,

    setJoinData: (session, player) => set({ session, player }),

    connectSocket: () => {
        const { session, player, socket } = get();

        // Evita múltiplas conexões
        if (socket?.connected) return;

        if (session && player) {
            const newSocket = io(`${process.env.EXPO_PUBLIC_API_URL}/sessions`, {
                transports: ['websocket'],
                autoConnect: true,
            });

            newSocket.on('connect', () => {
                newSocket.emit('join_session', {
                    sessionId: session.id,
                    playerId: player.id,
                    nickname: player.nickname,
                });
            });

            set({ socket: newSocket });
        }
    },

    disconnectSocket: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
            set({ socket: null });
        }
    },

    setNextQuestion: (question, number) =>
        set({ currentQuestion: question, questionNumber: number }),

    resetGame: () => {
        get().disconnectSocket();
        set({
            session: null,
            player: null,
            currentQuestion: null,
            questionNumber: 0,
        });
    },
}));
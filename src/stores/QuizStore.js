import { create } from 'zustand';

const defaultState = {
    quiz: null,
    currentQuestionIndex: 0,
    lastAnswer: null,
    correctAnswers: 0,
    isLastAnswerCorrect: null,
    results: []
}

const useQuizStore = create((set) => ({
    ...defaultState,

    reset: () => set(() => ({
        ...defaultState,
        results: [...defaultState.results],
    })),

    fetchQuiz: (quizData) => set({ quiz: quizData }),

    nextQuestion: () => set((state) => (
    { currentQuestionIndex: Math.min(state.currentQuestionIndex + 1, state.quiz.questoes.length - 1) })),

    jumpToQuestion: (index) => set((state) => ({
        currentQuestionIndex: Math.min(Math.max(0, index), state.quiz.questoes.length - 1)
    })),

    setSelectedAnswer: (answer) => set({ lastAnswer: answer }),

    computeAnswer: (lastAnswer, questionAnswer) => set((state) => {
        const answer = questionAnswer === 'V' ? true : false;

        const newResult = {
            idQuestao: state.quiz.questoes[state.currentQuestionIndex]._id,
            acertou: lastAnswer === answer
        };

        return {
            isLastAnswerCorrect: newResult.acertou,
            correctAnswers: lastAnswer === answer ? state.correctAnswers + 1 : state.correctAnswers,
            results: [...state.results, newResult], // Append immutably
        };
    }),
    
    setCorrectAnswer: () => set((state) => ({correctAnswers: state.correctAnswers + 1}))

}))

export default useQuizStore;
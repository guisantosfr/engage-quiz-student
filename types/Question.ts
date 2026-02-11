export type QuestionType = 'TRUE_FALSE' | 'MULTIPLE_CHOICE';

export interface QuestionOption {
    id: string;
    text: string;
}

export interface Question {
    id: string;
    text: string;
    type: QuestionType;
    options: QuestionOption[];
    timeLimit: number;
}

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';

export interface BaseQuestion {
    id: string;
    type: QuestionType;
    text: string;
    points: number;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
    type: 'multiple_choice';
    options: string[];
    correctIndex: number;
}

export interface TrueFalseQuestion extends BaseQuestion {
    type: 'true_false';
    correctValue: boolean; // true or false
}

export interface ShortAnswerQuestion extends BaseQuestion {
    type: 'short_answer';
    correctAnswer: string; // Case insensitive match, can support comma separated for multiple valid answers in future if needed
}

export type QuizQuestion = MultipleChoiceQuestion | TrueFalseQuestion | ShortAnswerQuestion;

export interface QuizSettings {
    timeLimitSeconds: number; // 0 for unlimited
    shuffleQuestions: boolean;
    showResultsImmediately: boolean;
    enablePowerUps: boolean;
}

export interface QuizContent {
    questions: QuizQuestion[];
    settings: QuizSettings;
}

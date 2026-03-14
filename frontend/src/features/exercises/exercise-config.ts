import type { CanvasState } from '../../components/geometry/types';
import type { ClassExerciseSummary } from '../../types/api.types';

export type ExerciseQuestionType =
    | 'multiple_choice'
    | 'numeric'
    | 'short_text'
    | 'canvas'
    | 'shape_area'
    | 'shape_perimeter';

export interface ExerciseQuestionOption {
    id: string;
    text: string;
    isCorrect?: boolean;
}

export interface ExerciseQuestionVisualConfig {
    enabled: boolean;
    canvasState?: unknown | null;
    canvasMode: 'readonly' | 'interactive';
    showFunctionPanel: boolean;
    hideFunctionExpressions: boolean;
    showCoordinates: boolean;
    showToolbar: boolean;
    compactToolbar: boolean;
}

export interface ExerciseQuestionMeasurement {
    label: string;
    value: number;
    unit?: string;
}

export interface ExerciseQuestionShapeConfig {
    shapeType: 'square' | 'rectangle' | 'triangle' | 'parallelogram' | 'circle';
    measurements: ExerciseQuestionMeasurement[];
    formulaHint?: string;
}

export interface ExerciseQuestion {
    id: string;
    title: string;
    prompt: string;
    type: ExerciseQuestionType;
    points: number;
    options?: ExerciseQuestionOption[];
    correctOptionId?: string;
    correctValue?: number;
    tolerance?: number;
    acceptedText?: string;
    manualReview?: boolean;
    placeholder?: string;
    visual?: ExerciseQuestionVisualConfig;
    shape?: ExerciseQuestionShapeConfig;
}

export interface ExerciseAnswerItem {
    questionId: string;
    value?: string | number | null;
    canvasState?: unknown | null;
}

export interface ExerciseQuestionResult {
    questionId: string;
    type: ExerciseQuestionType;
    score: number;
    maxScore: number;
    status: 'correct' | 'incorrect' | 'pending_review';
    requiresManualReview: boolean;
}

const defaultVisualConfig: ExerciseQuestionVisualConfig = {
    enabled: false,
    canvasState: null,
    canvasMode: 'readonly',
    showFunctionPanel: false,
    hideFunctionExpressions: false,
    showCoordinates: true,
    showToolbar: true,
    compactToolbar: true
};

const createQuestionId = () => `question_${Math.random().toString(36).slice(2, 10)}`;

const safeJsonParse = <T>(value?: string | null): T | null => {
    if (!value) {
        return null;
    }

    try {
        return JSON.parse(value) as T;
    } catch {
        return null;
    }
};

export const createEmptyCanvasState = (): CanvasState => ({
    objects: [],
    measurements: [],
    functions: [],
    selectedObjectId: null,
    currentTool: 'select',
    zoom: 1,
    pan: { x: 0, y: 0 },
    gridEnabled: true,
    snapToGrid: true
});

export const createQuestionTemplate = (type: ExerciseQuestionType, index: number): ExerciseQuestion => {
    const baseQuestion: ExerciseQuestion = {
        id: createQuestionId(),
        title: `Soal ${index + 1}`,
        prompt: '',
        type,
        points: 10,
        placeholder: type === 'numeric' || type === 'shape_area' || type === 'shape_perimeter'
            ? 'Masukkan jawaban numerik'
            : type === 'short_text'
                ? 'Tulis jawaban singkat'
                : undefined
    };

    if (type === 'multiple_choice') {
        return {
            ...baseQuestion,
            options: [
                { id: 'opt_a', text: '' },
                { id: 'opt_b', text: '' },
                { id: 'opt_c', text: '' }
            ],
            correctOptionId: 'opt_a'
        };
    }

    if (type === 'numeric') {
        return {
            ...baseQuestion,
            correctValue: 0,
            tolerance: 0
        };
    }

    if (type === 'shape_area' || type === 'shape_perimeter') {
        return {
            ...baseQuestion,
            correctValue: 0,
            tolerance: 0,
            shape: {
                shapeType: 'rectangle',
                measurements: [
                    { label: 'Panjang', value: 0, unit: 'cm' },
                    { label: 'Lebar', value: 0, unit: 'cm' }
                ]
            }
        };
    }

    if (type === 'short_text') {
        return {
            ...baseQuestion,
            acceptedText: '',
            manualReview: true
        };
    }

    return {
        ...baseQuestion,
        manualReview: true,
        visual: {
            ...defaultVisualConfig,
            enabled: true,
            canvasMode: 'interactive',
            showToolbar: true,
            showCoordinates: false,
            canvasState: createEmptyCanvasState()
        }
    };
};

const buildLegacyQuestion = (exercise: Pick<ClassExerciseSummary, 'title' | 'description' | 'instructions' | 'points' | 'answerType' | 'correctAnswer' | 'options' | 'canvasState' | 'canvasMode'>): ExerciseQuestion => {
    const baseQuestion: ExerciseQuestion = {
        id: createQuestionId(),
        title: exercise.title || 'Soal 1',
        prompt: exercise.instructions || exercise.description || exercise.title || 'Kerjakan soal berikut.',
        type: 'multiple_choice',
        points: exercise.points || 10
    };

    if (exercise.answerType === 'numeric') {
        const numericAnswer = safeJsonParse<{ value?: number; tolerance?: number }>(exercise.correctAnswer);
        return {
            ...baseQuestion,
            type: 'numeric',
            correctValue: numericAnswer?.value ?? 0,
            tolerance: numericAnswer?.tolerance ?? 0,
            placeholder: 'Masukkan jawaban numerik'
        };
    }

    if (exercise.answerType === 'canvas') {
        return {
            ...baseQuestion,
            type: 'canvas',
            manualReview: true,
            visual: {
                ...defaultVisualConfig,
                enabled: true,
                canvasState: safeJsonParse(exercise.canvasState),
                canvasMode: exercise.canvasMode === 'interactive' ? 'interactive' : 'readonly',
                showToolbar: true,
                showCoordinates: false
            }
        };
    }

    const options = safeJsonParse<Array<{ id: string; text: string; isCorrect?: boolean }>>(exercise.options) ?? [];
    const correctAnswer = safeJsonParse<{ id?: string } | string>(exercise.correctAnswer);

    return {
        ...baseQuestion,
        type: 'multiple_choice',
        options,
        correctOptionId: typeof correctAnswer === 'string' ? correctAnswer : correctAnswer?.id ?? options.find((option) => option.isCorrect)?.id
    };
};

export const parseExerciseQuestions = (exercise: Pick<ClassExerciseSummary, 'title' | 'description' | 'instructions' | 'points' | 'answerType' | 'correctAnswer' | 'options' | 'canvasState' | 'canvasMode' | 'questionSet'>): ExerciseQuestion[] => {
    const parsedQuestionSet = safeJsonParse<ExerciseQuestion[]>(exercise.questionSet ?? null);

    if (Array.isArray(parsedQuestionSet) && parsedQuestionSet.length > 0) {
        return parsedQuestionSet.map((question, index) => ({
            ...question,
            id: question.id || createQuestionId(),
            title: question.title || `Soal ${index + 1}`,
            prompt: question.prompt || '',
            points: question.points || 10,
            visual: question.visual ? { ...defaultVisualConfig, ...question.visual } : undefined
        }));
    }

    return [buildLegacyQuestion(exercise)];
};

export const parseStoredAnswers = (value?: string | null): ExerciseAnswerItem[] => {
    const parsed = safeJsonParse<ExerciseAnswerItem[] | string | number | null>(value);

    if (Array.isArray(parsed)) {
        return parsed;
    }

    return [];
};

export const parseQuestionResults = (value?: string | null): ExerciseQuestionResult[] => {
    const parsed = safeJsonParse<ExerciseQuestionResult[]>(value);
    return Array.isArray(parsed) ? parsed : [];
};

export const getQuestionTypeLabel = (type: ExerciseQuestionType | string) => {
    const labels: Record<string, string> = {
        multiple_choice: 'Pilihan ganda',
        numeric: 'Numerik',
        short_text: 'Jawaban singkat',
        canvas: 'Konstruksi canvas',
        shape_area: 'Luas bangun datar',
        shape_perimeter: 'Keliling bangun datar'
    };

    return labels[type] || type;
};

export const getQuestionAnswerTypeSummary = (questions: ExerciseQuestion[]) => {
    const uniqueTypes = new Set(questions.map((question) => question.type));
    return Array.from(uniqueTypes).map((type) => getQuestionTypeLabel(type));
};

export const findAnswerForQuestion = (answers: ExerciseAnswerItem[], questionId: string) =>
    answers.find((answer) => answer.questionId === questionId);

import { z } from 'zod';

export const EXERCISE_STATUS_GRADED = 'graded' as const;
export const EXERCISE_STATUS_PENDING_REVIEW = 'pending_review' as const;

const questionTypeSchema = z.enum([
    'multiple_choice',
    'numeric',
    'short_text',
    'canvas',
    'shape_area',
    'shape_perimeter'
]);

const shapeTypeSchema = z.enum([
    'square',
    'rectangle',
    'triangle',
    'parallelogram',
    'circle'
]);

const questionOptionSchema = z.object({
    id: z.string().trim().min(1),
    text: z.string().trim().min(1),
    isCorrect: z.boolean().optional()
});

const questionMeasurementSchema = z.object({
    label: z.string().trim().min(1),
    value: z.number().positive(),
    unit: z.string().trim().min(1).optional()
});

const visualConfigSchema = z.object({
    enabled: z.boolean().default(false),
    canvasState: z.unknown().nullable().optional(),
    canvasMode: z.enum(['readonly', 'interactive']).default('readonly'),
    showFunctionPanel: z.boolean().default(false),
    hideFunctionExpressions: z.boolean().default(false),
    showCoordinates: z.boolean().default(true),
    showToolbar: z.boolean().default(true),
    compactToolbar: z.boolean().default(true)
});

const shapeConfigSchema = z.object({
    shapeType: shapeTypeSchema,
    measurements: z.array(questionMeasurementSchema).default([]),
    formulaHint: z.string().trim().min(1).optional()
});

const exerciseQuestionSchema = z.object({
    id: z.string().trim().min(1),
    title: z.string().trim().min(1),
    prompt: z.string().trim().min(1),
    type: questionTypeSchema,
    points: z.number().int().min(1).max(100).default(10),
    options: z.array(questionOptionSchema).optional(),
    correctOptionId: z.string().trim().min(1).optional(),
    correctValue: z.number().optional(),
    tolerance: z.number().min(0).max(1000).default(0),
    acceptedText: z.string().trim().min(1).optional(),
    manualReview: z.boolean().default(false),
    placeholder: z.string().trim().min(1).optional(),
    visual: visualConfigSchema.optional(),
    shape: shapeConfigSchema.optional()
}).superRefine((question, ctx) => {
    if (question.type === 'multiple_choice') {
        if (!question.options || question.options.length < 2) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['options'],
                message: 'Pilihan ganda minimal memiliki dua opsi'
            });
        }

        const inferredCorrectOptionId = question.correctOptionId
            ?? question.options?.find((option) => option.isCorrect)?.id;

        if (!inferredCorrectOptionId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['correctOptionId'],
                message: 'Pilih jawaban benar untuk soal pilihan ganda'
            });
        }
    }

    if (['numeric', 'shape_area', 'shape_perimeter'].includes(question.type) && question.correctValue === undefined) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['correctValue'],
            message: 'Jawaban numerik wajib diisi'
        });
    }

    if ((question.type === 'shape_area' || question.type === 'shape_perimeter') && !question.shape) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['shape'],
            message: 'Informasi bangun datar wajib dilengkapi'
        });
    }

    if (question.type === 'short_text' && !question.manualReview && !question.acceptedText) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['acceptedText'],
            message: 'Isi jawaban referensi atau aktifkan review manual untuk jawaban singkat'
        });
    }
});

const questionSetSchema = z.array(exerciseQuestionSchema).min(1).max(20);

export type ExerciseQuestionType = z.infer<typeof questionTypeSchema>;
export type ExerciseShapeType = z.infer<typeof shapeTypeSchema>;
export type ExerciseQuestionOption = z.infer<typeof questionOptionSchema>;
export type ExerciseQuestionVisualConfig = z.infer<typeof visualConfigSchema>;
export type ExerciseQuestionShapeConfig = z.infer<typeof shapeConfigSchema>;
export type ExerciseQuestion = z.infer<typeof exerciseQuestionSchema>;

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

export interface ExerciseGradeOutcome {
    normalizedAnswers: ExerciseAnswerItem[];
    questionResults: ExerciseQuestionResult[];
    score: number;
    gradingStatus: typeof EXERCISE_STATUS_GRADED | typeof EXERCISE_STATUS_PENDING_REVIEW;
    isCorrect: boolean;
    gradedAt: Date | null;
    primaryCanvasData: string | null;
}

export interface LegacyExerciseLike {
    title?: string | null;
    description?: string | null;
    instructions?: string | null;
    points?: number | null;
    answerType?: string | null;
    correctAnswer?: string | null;
    options?: string | null;
    canvasState?: string | null;
    canvasMode?: string | null;
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

const normalizeText = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');

const parseCanvasStateInput = (value: unknown) => {
    if (typeof value !== 'string') {
        return value;
    }

    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
};

const buildQuestionId = (index: number) => `question_${index + 1}`;

const buildVisualConfigFromLegacy = (exercise: LegacyExerciseLike): ExerciseQuestionVisualConfig | undefined => {
    const parsedCanvasState = safeJsonParse<unknown>(exercise.canvasState);

    if (!parsedCanvasState) {
        return undefined;
    }

    return {
        ...defaultVisualConfig,
        enabled: true,
        canvasState: parsedCanvasState,
        canvasMode: exercise.canvasMode === 'interactive' ? 'interactive' : 'readonly',
        showToolbar: exercise.canvasMode === 'interactive',
        showFunctionPanel: false,
        hideFunctionExpressions: true
    };
};

const buildLegacyQuestion = (exercise: LegacyExerciseLike): ExerciseQuestion => {
    const legacyType = exercise.answerType || 'multiple_choice';
    const baseQuestion = {
        id: buildQuestionId(0),
        title: String(exercise.title || 'Soal 1').trim() || 'Soal 1',
        prompt: String(exercise.instructions || exercise.description || exercise.title || 'Kerjakan soal berikut.').trim(),
        points: Math.max(1, Number(exercise.points) || 10),
        manualReview: legacyType === 'canvas',
        placeholder: legacyType === 'numeric' ? 'Masukkan jawaban numerik' : undefined,
        visual: buildVisualConfigFromLegacy(exercise)
    };

    if (legacyType === 'multiple_choice') {
        const options = safeJsonParse<Array<{ id: string; text: string; isCorrect?: boolean }>>(exercise.options)
            ?? [];
        const parsedCorrect = safeJsonParse<{ id?: string } | string>(exercise.correctAnswer);
        const correctOptionId = typeof parsedCorrect === 'string'
            ? parsedCorrect
            : parsedCorrect?.id ?? options.find((option) => option.isCorrect)?.id;

        return exerciseQuestionSchema.parse({
            ...baseQuestion,
            type: 'multiple_choice',
            options,
            correctOptionId
        });
    }

    if (legacyType === 'numeric') {
        const parsedCorrect = safeJsonParse<{ value?: number; tolerance?: number }>(exercise.correctAnswer);
        const correctValue = parsedCorrect?.value ?? Number(exercise.correctAnswer ?? 0);
        const tolerance = parsedCorrect?.tolerance ?? 0;

        return exerciseQuestionSchema.parse({
            ...baseQuestion,
            type: 'numeric',
            correctValue,
            tolerance
        });
    }

    if (legacyType === 'canvas') {
        return exerciseQuestionSchema.parse({
            ...baseQuestion,
            type: 'canvas',
            manualReview: true,
            visual: {
                ...defaultVisualConfig,
                ...(buildVisualConfigFromLegacy(exercise) ?? {}),
                enabled: true,
                canvasMode: exercise.canvasMode === 'interactive' ? 'interactive' : 'readonly',
                showToolbar: true
            }
        });
    }

    return exerciseQuestionSchema.parse({
        ...baseQuestion,
        type: 'short_text',
        manualReview: true,
        placeholder: 'Tulis jawaban singkat kamu'
    });
};

const normalizeQuestion = (question: ExerciseQuestion, index: number): ExerciseQuestion => {
    const inferredCorrectOptionId = question.correctOptionId
        ?? question.options?.find((option) => option.isCorrect)?.id;

    return exerciseQuestionSchema.parse({
        ...question,
        id: question.id || buildQuestionId(index),
        title: question.title || `Soal ${index + 1}`,
        points: Math.max(1, question.points || 10),
        correctOptionId: inferredCorrectOptionId,
        manualReview: question.type === 'canvas' ? true : question.manualReview,
        visual: question.visual
            ? {
                ...defaultVisualConfig,
                ...question.visual
            }
            : undefined
    });
};

export const parseQuestionSet = (questionSet: string | null | undefined, legacyExercise?: LegacyExerciseLike): ExerciseQuestion[] => {
    const parsedQuestionSet = safeJsonParse<unknown>(questionSet);

    if (Array.isArray(parsedQuestionSet)) {
        return questionSetSchema.parse(parsedQuestionSet).map((question, index) => normalizeQuestion(question, index));
    }

    if (legacyExercise) {
        return [buildLegacyQuestion(legacyExercise)];
    }

    return [];
};

export const normalizeQuestionSetInput = (questionSet: unknown, legacyExercise: LegacyExerciseLike): ExerciseQuestion[] => {
    if (Array.isArray(questionSet)) {
        return questionSetSchema.parse(questionSet).map((question, index) => normalizeQuestion(question, index));
    }

    return [buildLegacyQuestion(legacyExercise)];
};

export const serializeQuestionSet = (questions: ExerciseQuestion[]) =>
    JSON.stringify(questions.map((question, index) => normalizeQuestion(question, index)));

export const sanitizeQuestionSetForStudent = (questions: ExerciseQuestion[]) =>
    questions.map((question) => ({
        id: question.id,
        title: question.title,
        prompt: question.prompt,
        type: question.type,
        points: question.points,
        options: question.options?.map((option) => ({
            id: option.id,
            text: option.text
        })),
        tolerance: question.type === 'numeric' ? question.tolerance : undefined,
        placeholder: question.placeholder,
        visual: question.visual,
        shape: question.shape
    }));

export const projectQuestionSetToLegacyFields = (questions: ExerciseQuestion[]) => {
    const totalPoints = questions.reduce((sum, question) => sum + question.points, 0);
    const firstQuestion = questions[0];
    const anyInteractiveCanvas = questions.some(
        (question) => question.visual?.enabled && question.visual.canvasMode === 'interactive'
    );
    const firstVisualQuestion = questions.find((question) => question.visual?.enabled);
    const firstCanvasState = firstVisualQuestion?.visual?.canvasState ?? null;

    if (questions.length > 1) {
        return {
            points: totalPoints,
            answerType: 'mixed',
            correctAnswer: null,
            options: null,
            canvasState: firstCanvasState ? JSON.stringify(firstCanvasState) : null,
            canvasMode: anyInteractiveCanvas ? 'interactive' : 'readonly'
        };
    }

    if (firstQuestion.type === 'multiple_choice') {
        return {
            points: totalPoints,
            answerType: 'multiple_choice',
            correctAnswer: JSON.stringify({ id: firstQuestion.correctOptionId }),
            options: JSON.stringify(
                (firstQuestion.options ?? []).map((option) => ({
                    id: option.id,
                    text: option.text,
                    isCorrect: option.id === firstQuestion.correctOptionId
                }))
            ),
            canvasState: firstCanvasState ? JSON.stringify(firstCanvasState) : null,
            canvasMode: anyInteractiveCanvas ? 'interactive' : 'readonly'
        };
    }

    if (['numeric', 'shape_area', 'shape_perimeter'].includes(firstQuestion.type)) {
        return {
            points: totalPoints,
            answerType: 'numeric',
            correctAnswer: JSON.stringify({
                value: firstQuestion.correctValue,
                tolerance: firstQuestion.tolerance ?? 0
            }),
            options: null,
            canvasState: firstCanvasState ? JSON.stringify(firstCanvasState) : null,
            canvasMode: anyInteractiveCanvas ? 'interactive' : 'readonly'
        };
    }

    if (firstQuestion.type === 'canvas') {
        return {
            points: totalPoints,
            answerType: 'canvas',
            correctAnswer: null,
            options: null,
            canvasState: firstCanvasState ? JSON.stringify(firstCanvasState) : null,
            canvasMode: anyInteractiveCanvas ? 'interactive' : 'readonly'
        };
    }

    return {
        points: totalPoints,
        answerType: 'short_text',
        correctAnswer: firstQuestion.acceptedText ? JSON.stringify({ text: firstQuestion.acceptedText }) : null,
        options: null,
        canvasState: firstCanvasState ? JSON.stringify(firstCanvasState) : null,
        canvasMode: anyInteractiveCanvas ? 'interactive' : 'readonly'
    };
};

const normalizeSubmissionAnswers = (
    questions: ExerciseQuestion[],
    rawAnswer: unknown,
    fallbackCanvasData?: string | null
): ExerciseAnswerItem[] => {
    if (Array.isArray(rawAnswer)) {
        return rawAnswer
            .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
            .map((item) => ({
                questionId: String(item.questionId || ''),
                value: typeof item.value === 'string' || typeof item.value === 'number' || item.value === null
                    ? item.value
                    : item.value !== undefined
                        ? JSON.stringify(item.value)
                        : null,
                canvasState: parseCanvasStateInput(item.canvasState)
            }))
            .filter((item) => item.questionId);
    }

    const firstQuestion = questions[0];
    if (!firstQuestion) {
        return [];
    }

    return [{
        questionId: firstQuestion.id,
        value: typeof rawAnswer === 'string' || typeof rawAnswer === 'number' || rawAnswer === null
            ? rawAnswer
            : rawAnswer !== undefined
                ? JSON.stringify(rawAnswer)
                : null,
        canvasState: fallbackCanvasData ? parseCanvasStateInput(fallbackCanvasData) : null
    }];
};

const compareNumericAnswer = (answerValue: string | number | null | undefined, correctValue: number, tolerance: number) => {
    const numericValue = typeof answerValue === 'number' ? answerValue : Number(answerValue);

    if (!Number.isFinite(numericValue)) {
        return false;
    }

    return Math.abs(numericValue - correctValue) <= tolerance;
};

export const gradeExerciseSubmission = (
    questions: ExerciseQuestion[],
    rawAnswer: unknown,
    fallbackCanvasData?: string | null
): ExerciseGradeOutcome => {
    const normalizedAnswers = normalizeSubmissionAnswers(questions, rawAnswer, fallbackCanvasData);
    const answersByQuestionId = new Map(normalizedAnswers.map((answer) => [answer.questionId, answer]));
    const questionResults: ExerciseQuestionResult[] = [];
    let score = 0;
    let requiresManualReview = false;

    questions.forEach((question) => {
        const submittedAnswer = answersByQuestionId.get(question.id);

        if (question.type === 'canvas') {
            requiresManualReview = true;
            questionResults.push({
                questionId: question.id,
                type: question.type,
                score: 0,
                maxScore: question.points,
                status: 'pending_review',
                requiresManualReview: true
            });
            return;
        }

        if (question.type === 'short_text' && (question.manualReview || !question.acceptedText)) {
            requiresManualReview = true;
            questionResults.push({
                questionId: question.id,
                type: question.type,
                score: 0,
                maxScore: question.points,
                status: 'pending_review',
                requiresManualReview: true
            });
            return;
        }

        let isCorrect = false;

        if (question.type === 'multiple_choice') {
            isCorrect = String(submittedAnswer?.value ?? '') === String(question.correctOptionId ?? '');
        } else if (question.type === 'short_text' && question.acceptedText) {
            isCorrect = normalizeText(String(submittedAnswer?.value ?? '')) === normalizeText(question.acceptedText);
        } else if (question.correctValue !== undefined) {
            isCorrect = compareNumericAnswer(submittedAnswer?.value, question.correctValue, question.tolerance ?? 0);
        }

        const questionScore = isCorrect ? question.points : 0;
        score += questionScore;
        questionResults.push({
            questionId: question.id,
            type: question.type,
            score: questionScore,
            maxScore: question.points,
            status: isCorrect ? 'correct' : 'incorrect',
            requiresManualReview: false
        });
    });

    const primaryCanvasAnswer = normalizedAnswers.find((answer) => answer.canvasState !== undefined && answer.canvasState !== null);
    const primaryCanvasData = primaryCanvasAnswer?.canvasState !== undefined && primaryCanvasAnswer?.canvasState !== null
        ? JSON.stringify(primaryCanvasAnswer.canvasState)
        : fallbackCanvasData ?? null;

    return {
        normalizedAnswers,
        questionResults,
        score,
        gradingStatus: requiresManualReview ? EXERCISE_STATUS_PENDING_REVIEW : EXERCISE_STATUS_GRADED,
        isCorrect: !requiresManualReview && questionResults.every((result) => result.status === 'correct'),
        gradedAt: requiresManualReview ? null : new Date(),
        primaryCanvasData
    };
};

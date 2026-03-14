"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gradeExerciseSubmission = exports.projectQuestionSetToLegacyFields = exports.sanitizeQuestionSetForStudent = exports.serializeQuestionSet = exports.normalizeQuestionSetInput = exports.parseQuestionSet = exports.EXERCISE_STATUS_PENDING_REVIEW = exports.EXERCISE_STATUS_GRADED = void 0;
const zod_1 = require("zod");
exports.EXERCISE_STATUS_GRADED = 'graded';
exports.EXERCISE_STATUS_PENDING_REVIEW = 'pending_review';
const questionTypeSchema = zod_1.z.enum([
    'multiple_choice',
    'numeric',
    'short_text',
    'canvas',
    'shape_area',
    'shape_perimeter'
]);
const shapeTypeSchema = zod_1.z.enum([
    'square',
    'rectangle',
    'triangle',
    'parallelogram',
    'circle'
]);
const questionOptionSchema = zod_1.z.object({
    id: zod_1.z.string().trim().min(1),
    text: zod_1.z.string().trim().min(1),
    isCorrect: zod_1.z.boolean().optional()
});
const questionMeasurementSchema = zod_1.z.object({
    label: zod_1.z.string().trim().min(1),
    value: zod_1.z.number().positive(),
    unit: zod_1.z.string().trim().min(1).optional()
});
const visualConfigSchema = zod_1.z.object({
    enabled: zod_1.z.boolean().default(false),
    canvasState: zod_1.z.unknown().nullable().optional(),
    canvasMode: zod_1.z.enum(['readonly', 'interactive']).default('readonly'),
    showFunctionPanel: zod_1.z.boolean().default(false),
    hideFunctionExpressions: zod_1.z.boolean().default(false),
    showCoordinates: zod_1.z.boolean().default(true),
    showToolbar: zod_1.z.boolean().default(true),
    compactToolbar: zod_1.z.boolean().default(true)
});
const shapeConfigSchema = zod_1.z.object({
    shapeType: shapeTypeSchema,
    measurements: zod_1.z.array(questionMeasurementSchema).default([]),
    formulaHint: zod_1.z.string().trim().min(1).optional()
});
const exerciseQuestionSchema = zod_1.z.object({
    id: zod_1.z.string().trim().min(1),
    title: zod_1.z.string().trim().min(1),
    prompt: zod_1.z.string().trim().min(1),
    type: questionTypeSchema,
    points: zod_1.z.number().int().min(1).max(100).default(10),
    options: zod_1.z.array(questionOptionSchema).optional(),
    correctOptionId: zod_1.z.string().trim().min(1).optional(),
    correctValue: zod_1.z.number().optional(),
    tolerance: zod_1.z.number().min(0).max(1000).default(0),
    acceptedText: zod_1.z.string().trim().min(1).optional(),
    manualReview: zod_1.z.boolean().default(false),
    placeholder: zod_1.z.string().trim().min(1).optional(),
    visual: visualConfigSchema.optional(),
    shape: shapeConfigSchema.optional()
}).superRefine((question, ctx) => {
    if (question.type === 'multiple_choice') {
        if (!question.options || question.options.length < 2) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                path: ['options'],
                message: 'Pilihan ganda minimal memiliki dua opsi'
            });
        }
        const inferredCorrectOptionId = question.correctOptionId
            ?? question.options?.find((option) => option.isCorrect)?.id;
        if (!inferredCorrectOptionId) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                path: ['correctOptionId'],
                message: 'Pilih jawaban benar untuk soal pilihan ganda'
            });
        }
    }
    if (['numeric', 'shape_area', 'shape_perimeter'].includes(question.type) && question.correctValue === undefined) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ['correctValue'],
            message: 'Jawaban numerik wajib diisi'
        });
    }
    if ((question.type === 'shape_area' || question.type === 'shape_perimeter') && !question.shape) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ['shape'],
            message: 'Informasi bangun datar wajib dilengkapi'
        });
    }
    if (question.type === 'short_text' && !question.manualReview && !question.acceptedText) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ['acceptedText'],
            message: 'Isi jawaban referensi atau aktifkan review manual untuk jawaban singkat'
        });
    }
});
const questionSetSchema = zod_1.z.array(exerciseQuestionSchema).min(1).max(20);
const defaultVisualConfig = {
    enabled: false,
    canvasState: null,
    canvasMode: 'readonly',
    showFunctionPanel: false,
    hideFunctionExpressions: false,
    showCoordinates: true,
    showToolbar: true,
    compactToolbar: true
};
const safeJsonParse = (value) => {
    if (!value) {
        return null;
    }
    try {
        return JSON.parse(value);
    }
    catch {
        return null;
    }
};
const normalizeText = (value) => value.trim().toLowerCase().replace(/\s+/g, ' ');
const parseCanvasStateInput = (value) => {
    if (typeof value !== 'string') {
        return value;
    }
    try {
        return JSON.parse(value);
    }
    catch {
        return value;
    }
};
const buildQuestionId = (index) => `question_${index + 1}`;
const buildVisualConfigFromLegacy = (exercise) => {
    const parsedCanvasState = safeJsonParse(exercise.canvasState);
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
const buildLegacyQuestion = (exercise) => {
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
        const options = safeJsonParse(exercise.options)
            ?? [];
        const parsedCorrect = safeJsonParse(exercise.correctAnswer);
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
        const parsedCorrect = safeJsonParse(exercise.correctAnswer);
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
const normalizeQuestion = (question, index) => {
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
const parseQuestionSet = (questionSet, legacyExercise) => {
    const parsedQuestionSet = safeJsonParse(questionSet);
    if (Array.isArray(parsedQuestionSet)) {
        return questionSetSchema.parse(parsedQuestionSet).map((question, index) => normalizeQuestion(question, index));
    }
    if (legacyExercise) {
        return [buildLegacyQuestion(legacyExercise)];
    }
    return [];
};
exports.parseQuestionSet = parseQuestionSet;
const normalizeQuestionSetInput = (questionSet, legacyExercise) => {
    if (Array.isArray(questionSet)) {
        return questionSetSchema.parse(questionSet).map((question, index) => normalizeQuestion(question, index));
    }
    return [buildLegacyQuestion(legacyExercise)];
};
exports.normalizeQuestionSetInput = normalizeQuestionSetInput;
const serializeQuestionSet = (questions) => JSON.stringify(questions.map((question, index) => normalizeQuestion(question, index)));
exports.serializeQuestionSet = serializeQuestionSet;
const sanitizeQuestionSetForStudent = (questions) => questions.map((question) => ({
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
exports.sanitizeQuestionSetForStudent = sanitizeQuestionSetForStudent;
const projectQuestionSetToLegacyFields = (questions) => {
    const totalPoints = questions.reduce((sum, question) => sum + question.points, 0);
    const firstQuestion = questions[0];
    const anyInteractiveCanvas = questions.some((question) => question.visual?.enabled && question.visual.canvasMode === 'interactive');
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
            options: JSON.stringify((firstQuestion.options ?? []).map((option) => ({
                id: option.id,
                text: option.text,
                isCorrect: option.id === firstQuestion.correctOptionId
            }))),
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
exports.projectQuestionSetToLegacyFields = projectQuestionSetToLegacyFields;
const normalizeSubmissionAnswers = (questions, rawAnswer, fallbackCanvasData) => {
    if (Array.isArray(rawAnswer)) {
        return rawAnswer
            .filter((item) => typeof item === 'object' && item !== null)
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
const compareNumericAnswer = (answerValue, correctValue, tolerance) => {
    const numericValue = typeof answerValue === 'number' ? answerValue : Number(answerValue);
    if (!Number.isFinite(numericValue)) {
        return false;
    }
    return Math.abs(numericValue - correctValue) <= tolerance;
};
const gradeExerciseSubmission = (questions, rawAnswer, fallbackCanvasData) => {
    const normalizedAnswers = normalizeSubmissionAnswers(questions, rawAnswer, fallbackCanvasData);
    const answersByQuestionId = new Map(normalizedAnswers.map((answer) => [answer.questionId, answer]));
    const questionResults = [];
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
        }
        else if (question.type === 'short_text' && question.acceptedText) {
            isCorrect = normalizeText(String(submittedAnswer?.value ?? '')) === normalizeText(question.acceptedText);
        }
        else if (question.correctValue !== undefined) {
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
        gradingStatus: requiresManualReview ? exports.EXERCISE_STATUS_PENDING_REVIEW : exports.EXERCISE_STATUS_GRADED,
        isCorrect: !requiresManualReview && questionResults.every((result) => result.status === 'correct'),
        gradedAt: requiresManualReview ? null : new Date(),
        primaryCanvasData
    };
};
exports.gradeExerciseSubmission = gradeExerciseSubmission;
//# sourceMappingURL=exercise-config.js.map
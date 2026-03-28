import { z } from 'zod';
export declare const EXERCISE_STATUS_GRADED: "graded";
export declare const EXERCISE_STATUS_PENDING_REVIEW: "pending_review";
declare const questionTypeSchema: z.ZodEnum<{
    multiple_choice: "multiple_choice";
    numeric: "numeric";
    short_text: "short_text";
    canvas: "canvas";
    shape_area: "shape_area";
    shape_perimeter: "shape_perimeter";
}>;
declare const shapeTypeSchema: z.ZodEnum<{
    square: "square";
    rectangle: "rectangle";
    triangle: "triangle";
    parallelogram: "parallelogram";
    circle: "circle";
}>;
declare const questionOptionSchema: z.ZodObject<{
    id: z.ZodString;
    text: z.ZodString;
    isCorrect: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
declare const visualConfigSchema: z.ZodObject<{
    enabled: z.ZodDefault<z.ZodBoolean>;
    canvasState: z.ZodOptional<z.ZodNullable<z.ZodUnknown>>;
    canvasMode: z.ZodDefault<z.ZodEnum<{
        readonly: "readonly";
        interactive: "interactive";
    }>>;
    showFunctionPanel: z.ZodDefault<z.ZodBoolean>;
    hideFunctionExpressions: z.ZodDefault<z.ZodBoolean>;
    showCoordinates: z.ZodDefault<z.ZodBoolean>;
    showToolbar: z.ZodDefault<z.ZodBoolean>;
    compactToolbar: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
declare const shapeConfigSchema: z.ZodObject<{
    shapeType: z.ZodEnum<{
        square: "square";
        rectangle: "rectangle";
        triangle: "triangle";
        parallelogram: "parallelogram";
        circle: "circle";
    }>;
    measurements: z.ZodDefault<z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        value: z.ZodNumber;
        unit: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    formulaHint: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
declare const exerciseQuestionSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    prompt: z.ZodString;
    type: z.ZodEnum<{
        multiple_choice: "multiple_choice";
        numeric: "numeric";
        short_text: "short_text";
        canvas: "canvas";
        shape_area: "shape_area";
        shape_perimeter: "shape_perimeter";
    }>;
    points: z.ZodDefault<z.ZodNumber>;
    options: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        text: z.ZodString;
        isCorrect: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>>;
    correctOptionId: z.ZodOptional<z.ZodString>;
    correctValue: z.ZodOptional<z.ZodNumber>;
    tolerance: z.ZodDefault<z.ZodNumber>;
    acceptedText: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodOptional<z.ZodString>>;
    manualReview: z.ZodDefault<z.ZodBoolean>;
    placeholder: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodOptional<z.ZodString>>;
    visual: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        canvasState: z.ZodOptional<z.ZodNullable<z.ZodUnknown>>;
        canvasMode: z.ZodDefault<z.ZodEnum<{
            readonly: "readonly";
            interactive: "interactive";
        }>>;
        showFunctionPanel: z.ZodDefault<z.ZodBoolean>;
        hideFunctionExpressions: z.ZodDefault<z.ZodBoolean>;
        showCoordinates: z.ZodDefault<z.ZodBoolean>;
        showToolbar: z.ZodDefault<z.ZodBoolean>;
        compactToolbar: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>>;
    shape: z.ZodOptional<z.ZodObject<{
        shapeType: z.ZodEnum<{
            square: "square";
            rectangle: "rectangle";
            triangle: "triangle";
            parallelogram: "parallelogram";
            circle: "circle";
        }>;
        measurements: z.ZodDefault<z.ZodArray<z.ZodObject<{
            label: z.ZodString;
            value: z.ZodNumber;
            unit: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>>;
        formulaHint: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodOptional<z.ZodString>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
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
export declare const parseQuestionSet: (questionSet: string | null | undefined, legacyExercise?: LegacyExerciseLike) => ExerciseQuestion[];
export declare const normalizeQuestionSetInput: (questionSet: unknown, legacyExercise: LegacyExerciseLike) => ExerciseQuestion[];
export declare const serializeQuestionSet: (questions: ExerciseQuestion[]) => string;
export declare const sanitizeQuestionSetForStudent: (questions: ExerciseQuestion[]) => {
    id: string;
    title: string;
    prompt: string;
    type: "multiple_choice" | "numeric" | "short_text" | "canvas" | "shape_area" | "shape_perimeter";
    points: number;
    options: {
        id: string;
        text: string;
    }[] | undefined;
    tolerance: number | undefined;
    placeholder: string | undefined;
    visual: {
        enabled: boolean;
        canvasMode: "readonly" | "interactive";
        showFunctionPanel: boolean;
        hideFunctionExpressions: boolean;
        showCoordinates: boolean;
        showToolbar: boolean;
        compactToolbar: boolean;
        canvasState?: unknown;
    } | undefined;
    shape: {
        shapeType: "square" | "rectangle" | "triangle" | "parallelogram" | "circle";
        measurements: {
            label: string;
            value: number;
            unit?: string | undefined;
        }[];
        formulaHint?: string | undefined;
    } | undefined;
}[];
export declare const projectQuestionSetToLegacyFields: (questions: ExerciseQuestion[]) => {
    points: number;
    answerType: string;
    correctAnswer: string;
    options: string;
    canvasState: string | null;
    canvasMode: string;
} | {
    points: number;
    answerType: string;
    correctAnswer: string | null;
    options: null;
    canvasState: string | null;
    canvasMode: string;
};
export declare const gradeExerciseSubmission: (questions: ExerciseQuestion[], rawAnswer: unknown, fallbackCanvasData?: string | null) => ExerciseGradeOutcome;
export {};
//# sourceMappingURL=exercise-config.d.ts.map
import prisma from '../../utils/prisma';

/**
 * Duplikasi konten antar kelas milik guru yang sama.
 *
 * Aturan:
 * - Data siswa (attempt, progress, enrollment) tidak pernah ikut disalin.
 * - Latihan hasil salinan selalu draft (isPublished: false) agar guru review dulu.
 * - Tautan materi ke kuis/latihan ikut digandakan (deep copy), bukan menunjuk ke aslinya.
 */

export class DuplicationError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'DuplicationError';
        this.status = status;
    }
}

export const duplicateClassExercise = async (exerciseId: string, targetClassId: string) => {
    const source = await prisma.classExercise.findUnique({
        where: { id: exerciseId }
    });

    if (!source) {
        throw new DuplicationError('Exercise not found', 404);
    }

    const targetClass = await prisma.class.findUnique({
        where: { id: targetClassId },
        select: { id: true }
    });

    if (!targetClass) {
        throw new DuplicationError('Target class not found', 404);
    }

    return prisma.classExercise.create({
        data: {
            classId: targetClassId,
            title: source.title,
            description: source.description,
            instructions: source.instructions,
            exerciseType: source.exerciseType,
            difficulty: source.difficulty,
            points: source.points,
            hasTimer: source.hasTimer,
            timerMinutes: source.timerMinutes,
            canvasState: source.canvasState,
            canvasMode: source.canvasMode,
            answerType: source.answerType,
            correctAnswer: source.correctAnswer,
            options: source.options,
            questionSet: source.questionSet,
            isPublished: false,
            order: source.order
        }
    });
};

export const duplicateMaterial = async (
    materialId: string,
    targetModuleId: string,
    copyLinkedContent: boolean
) => {
    const source = await prisma.material.findUnique({
        where: { id: materialId }
    });

    if (!source) {
        throw new DuplicationError('Material not found', 404);
    }

    const targetModule = await prisma.module.findUnique({
        where: { id: targetModuleId },
        select: { id: true, classId: true }
    });

    if (!targetModule || !targetModule.classId) {
        throw new DuplicationError('Target module not found', 404);
    }

    let linkedQuizId: string | null = null;
    let linkedExerciseId: string | null = null;

    if (copyLinkedContent) {
        if (source.linkedQuizId) {
            const copiedQuiz = await copyQuizMaterial(source.linkedQuizId, targetModule.id);
            linkedQuizId = copiedQuiz.id;
        }

        if (source.linkedExerciseId) {
            const copiedExercise = await duplicateClassExercise(source.linkedExerciseId, targetModule.classId);
            linkedExerciseId = copiedExercise.id;
        }
    }

    return prisma.material.create({
        data: {
            title: source.title,
            type: source.type,
            category: source.category,
            level: source.level,
            content: source.content,
            semester: source.semester,
            grade: source.grade,
            moduleId: targetModule.id,
            moduleOrder: source.moduleOrder,
            linkedQuizId,
            linkedExerciseId,
            minPassingScore: source.minPassingScore,
            order: source.order,
            createdById: source.createdById
        }
    });
};

/**
 * Salinan materi kuis untuk keperluan deep copy.
 * Kuis tidak menautkan konten lain, jadi salinannya tidak membawa tautan.
 */
const copyQuizMaterial = async (quizId: string, targetModuleId: string) => {
    const quiz = await prisma.material.findUnique({
        where: { id: quizId }
    });

    if (!quiz) {
        throw new DuplicationError('Linked quiz not found', 404);
    }

    return prisma.material.create({
        data: {
            title: quiz.title,
            type: quiz.type,
            category: quiz.category,
            level: quiz.level,
            content: quiz.content,
            semester: quiz.semester,
            grade: quiz.grade,
            moduleId: targetModuleId,
            moduleOrder: quiz.moduleOrder,
            linkedQuizId: null,
            linkedExerciseId: null,
            minPassingScore: quiz.minPassingScore,
            order: quiz.order,
            createdById: quiz.createdById
        }
    });
};

export const duplicateClassBook = async (bookId: string, sourceClassId: string, targetClassId: string) => {
    const source = await prisma.classBook.findFirst({
        where: { id: bookId, classId: sourceClassId }
    });

    if (!source) {
        throw new DuplicationError('Book not found', 404);
    }

    const targetClass = await prisma.class.findUnique({
        where: { id: targetClassId },
        select: { id: true }
    });

    if (!targetClass) {
        throw new DuplicationError('Target class not found', 404);
    }

    return prisma.classBook.create({
        data: {
            classId: targetClassId,
            title: source.title,
            author: source.author,
            description: source.description,
            coverUrl: source.coverUrl,
            contentType: source.contentType,
            content: source.content,
            pdfUrl: source.pdfUrl
        }
    });
};

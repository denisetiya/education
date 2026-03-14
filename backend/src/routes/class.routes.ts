import { Router } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { authMiddleware, AuthRequest, requireRole } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import {
    EXERCISE_STATUS_GRADED,
    EXERCISE_STATUS_PENDING_REVIEW,
    gradeExerciseSubmission,
    normalizeQuestionSetInput,
    parseQuestionSet,
    projectQuestionSetToLegacyFields,
    sanitizeQuestionSetForStudent,
    serializeQuestionSet
} from '../features/exercises/exercise-config';

const router = Router();

const classDetailInclude = {
    teacher: { select: { id: true, name: true } },
    modules: {
        include: {
            materials: {
                select: { id: true, title: true, type: true, moduleOrder: true },
                orderBy: { moduleOrder: 'asc' as const }
            }
        },
        orderBy: { order: 'asc' as const }
    },
    students: {
        select: {
            joinedAt: true,
            student: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        },
        orderBy: { joinedAt: 'desc' as const }
    },
    _count: {
        select: {
            students: true,
            modules: true
        }
    }
};

const classDashboardInclude = {
    teacher: { select: { name: true } },
    modules: {
        include: {
            materials: {
                select: { id: true, title: true, type: true, moduleOrder: true },
                orderBy: { moduleOrder: 'asc' as const }
            }
        },
        orderBy: { order: 'asc' as const }
    },
    achievements: true,
    _count: { select: { students: true } }
};

const generateClassCode = async (): Promise<string> => {
    let code = '';
    let exists = true;

    while (exists) {
        code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const existingClass = await prisma.class.findUnique({ where: { code } });
        exists = Boolean(existingClass);
    }

    return code;
};

const normalizeClassCode = (code: string) => code.trim().toUpperCase();

const getRequestUser = (req: AuthRequest) => {
    if (!req.user) {
        throw new Error('Missing authenticated user');
    }

    return req.user;
};

const getClassAccess = async (classId: string, userId: string, role: string) => {
    const targetClass = await prisma.class.findUnique({
        where: { id: classId },
        select: { id: true, teacherId: true }
    });

    if (!targetClass) {
        return {
            targetClass: null,
            isAdmin: role === 'ADMIN',
            isTeacher: false,
            isEnrolled: false
        };
    }

    const isAdmin = role === 'ADMIN';
    const isTeacher = targetClass.teacherId === userId;

    let isEnrolled = false;
    if (!isAdmin && !isTeacher) {
        const enrollment = await prisma.classEnrollment.findUnique({
            where: {
                studentId_classId: {
                    studentId: userId,
                    classId
                }
            }
        });
        isEnrolled = Boolean(enrollment);
    }

    return {
        targetClass,
        isAdmin,
        isTeacher,
        isEnrolled
    };
};

const canAccessClass = (access: Awaited<ReturnType<typeof getClassAccess>>) =>
    access.isAdmin || access.isTeacher || access.isEnrolled;

const canManageClass = (access: Awaited<ReturnType<typeof getClassAccess>>) =>
    access.isAdmin || access.isTeacher;

const clampScore = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

const discussionThreadSchema = z.object({
    title: z.string().trim().min(3, 'Judul minimal 3 karakter').max(120, 'Judul terlalu panjang'),
    content: z.string().trim().min(3, 'Isi diskusi minimal 3 karakter').max(4000, 'Isi diskusi terlalu panjang')
});

const discussionReplySchema = z.object({
    content: z.string().trim().min(1, 'Balasan tidak boleh kosong').max(2000, 'Balasan terlalu panjang')
});

const discussionToggleSchema = z.object({
    value: z.boolean()
});

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

const getExerciseQuestions = (exercise: {
    questionSet?: string | null;
    title?: string | null;
    description?: string | null;
    instructions?: string | null;
    points?: number | null;
    answerType?: string | null;
    correctAnswer?: string | null;
    options?: string | null;
    canvasState?: string | null;
    canvasMode?: string | null;
}) => parseQuestionSet(exercise.questionSet ?? null, exercise);

const formatExerciseForResponse = <
    T extends {
        questionSet?: string | null;
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
>(
    exercise: T,
    includeTeacherFields: boolean
) => {
    const questions = getExerciseQuestions(exercise);
    const primaryQuestion = questions[0];

    const formattedExercise = {
        ...exercise,
        questionSet: JSON.stringify(includeTeacherFields ? questions : sanitizeQuestionSetForStudent(questions)),
        questionCount: questions.length,
        questionTypes: questions.map((question) => question.type),
        answerType: questions.length > 1
            ? 'mixed'
            : primaryQuestion?.type ?? exercise.answerType ?? 'multiple_choice',
        points: questions.reduce((sum, question) => sum + question.points, 0) || exercise.points || 0
    } as T & {
        questionSet: string;
        questionCount: number;
        questionTypes: string[];
        answerType: string;
        points: number;
    };

    if (!includeTeacherFields) {
        formattedExercise.options = sanitizeExerciseOptionsForStudent(exercise.options ?? null) as T['options'];
        delete (formattedExercise as Record<string, unknown>).correctAnswer;
    }

    return formattedExercise;
};

const buildExerciseMutationData = (payload: Record<string, unknown>) => {
    const normalizedQuestions = normalizeQuestionSetInput(payload.questionSet, {
        title: typeof payload.title === 'string' ? payload.title : null,
        description: typeof payload.description === 'string' ? payload.description : null,
        instructions: typeof payload.instructions === 'string' ? payload.instructions : null,
        points: typeof payload.points === 'number' ? payload.points : Number(payload.points ?? 10),
        answerType: typeof payload.answerType === 'string' ? payload.answerType : null,
        correctAnswer: typeof payload.correctAnswer === 'string' ? payload.correctAnswer : null,
        options: typeof payload.options === 'string' ? payload.options : null,
        canvasState: typeof payload.canvasState === 'string' ? payload.canvasState : null,
        canvasMode: typeof payload.canvasMode === 'string' ? payload.canvasMode : null
    });

    const projectedLegacyFields = projectQuestionSetToLegacyFields(normalizedQuestions);

    return {
        normalizedQuestions,
        data: {
            questionSet: serializeQuestionSet(normalizedQuestions),
            points: projectedLegacyFields.points,
            answerType: projectedLegacyFields.answerType,
            correctAnswer: projectedLegacyFields.correctAnswer,
            options: projectedLegacyFields.options,
            canvasState: projectedLegacyFields.canvasState,
            canvasMode: projectedLegacyFields.canvasMode
        }
    };
};

const getQuestionResultsSummary = (value?: string | null) =>
    safeJsonParse<Array<{ status?: string }>>(value) ?? [];

const buildClassLeaderboard = async (classId: string, currentUserId?: string) => {
    const classData = await prisma.class.findUnique({
        where: { id: classId },
        select: {
            id: true,
            name: true,
            xpMultiplier: true,
            students: {
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                            level: true,
                            xp: true
                        }
                    }
                }
            },
            modules: {
                include: {
                    materials: {
                        select: {
                            id: true
                        }
                    }
                }
            }
        }
    });

    if (!classData) {
        return null;
    }

    const materialIds = classData.modules.flatMap((module) => module.materials.map((material) => material.id));
    const studentIds = classData.students.map((enrollment) => enrollment.studentId);

    const [progressRows, attemptRows, achievementRows, discussionThreads] = await Promise.all([
        prisma.progress.findMany({
            where: {
                userId: { in: studentIds },
                materialId: { in: materialIds },
                status: 'completed'
            },
            select: {
                userId: true,
                score: true,
                materialId: true
            }
        }),
        prisma.exerciseAttempt.findMany({
            where: {
                studentId: { in: studentIds },
                exercise: {
                    classId
                }
            },
            select: {
                studentId: true,
                score: true,
                gradingStatus: true,
                questionResults: true
            }
        }),
        prisma.studentClassAchievement.findMany({
            where: {
                studentId: { in: studentIds },
                achievement: { classId }
            },
            include: {
                achievement: {
                    select: {
                        id: true,
                        title: true,
                        icon: true,
                        xpReward: true
                    }
                }
            }
        }),
        prisma.classDiscussionThread.findMany({
            where: { classId },
            select: {
                authorId: true,
                replies: {
                    select: {
                        authorId: true
                    }
                }
            }
        })
    ]);

    const progressByStudent = new Map<string, { materialXp: number; completedMaterials: number }>();
    progressRows.forEach((progress) => {
        const existing = progressByStudent.get(progress.userId) ?? { materialXp: 0, completedMaterials: 0 };
        existing.materialXp += Math.round((progress.score || 50) * (classData.xpMultiplier || 1));
        existing.completedMaterials += 1;
        progressByStudent.set(progress.userId, existing);
    });

    const exerciseByStudent = new Map<string, { exerciseXp: number; pendingReviews: number; solvedQuestions: number }>();
    attemptRows.forEach((attempt) => {
        const existing = exerciseByStudent.get(attempt.studentId) ?? { exerciseXp: 0, pendingReviews: 0, solvedQuestions: 0 };
        existing.exerciseXp += attempt.score;
        if (attempt.gradingStatus === EXERCISE_STATUS_PENDING_REVIEW) {
            existing.pendingReviews += 1;
        }
        existing.solvedQuestions += getQuestionResultsSummary(attempt.questionResults).length;
        exerciseByStudent.set(attempt.studentId, existing);
    });

    const achievementByStudent = new Map<string, { achievementXp: number; badges: Array<{ id: string; label: string; icon: string; tone: string }> }>();
    achievementRows.forEach((row) => {
        const existing = achievementByStudent.get(row.studentId) ?? { achievementXp: 0, badges: [] };
        existing.achievementXp += row.achievement.xpReward;
        existing.badges.push({
            id: row.achievement.id,
            label: row.achievement.title,
            icon: row.achievement.icon,
            tone: 'gold'
        });
        achievementByStudent.set(row.studentId, existing);
    });

    const discussionCountByStudent = new Map<string, number>();
    discussionThreads.forEach((thread) => {
        discussionCountByStudent.set(thread.authorId, (discussionCountByStudent.get(thread.authorId) ?? 0) + 1);
        thread.replies.forEach((reply) => {
            discussionCountByStudent.set(reply.authorId, (discussionCountByStudent.get(reply.authorId) ?? 0) + 1);
        });
    });

    const totalMaterials = materialIds.length;

    const rankedEntries = classData.students.map((enrollment) => {
        const materialProgress = progressByStudent.get(enrollment.studentId) ?? { materialXp: 0, completedMaterials: 0 };
        const exerciseProgress = exerciseByStudent.get(enrollment.studentId) ?? { exerciseXp: 0, pendingReviews: 0, solvedQuestions: 0 };
        const achievementProgress = achievementByStudent.get(enrollment.studentId) ?? { achievementXp: 0, badges: [] };
        const discussionCount = discussionCountByStudent.get(enrollment.studentId) ?? 0;
        const completionRate = totalMaterials > 0
            ? Math.round((materialProgress.completedMaterials / totalMaterials) * 100)
            : 0;

        const badges = [...achievementProgress.badges];
        if (completionRate >= 100) {
            badges.push({ id: `full-progress-${enrollment.studentId}`, label: 'Tuntas Penuh', icon: 'sparkles', tone: 'emerald' });
        } else if (completionRate >= 70) {
            badges.push({ id: `steady-progress-${enrollment.studentId}`, label: 'Konsisten', icon: 'target', tone: 'blue' });
        }

        if (discussionCount >= 3) {
            badges.push({ id: `discussion-${enrollment.studentId}`, label: 'Aktif Diskusi', icon: 'message-circle', tone: 'violet' });
        }

        return {
            studentId: enrollment.student.id,
            name: enrollment.student.name,
            email: enrollment.student.email,
            avatar: enrollment.student.avatar,
            level: enrollment.student.level,
            globalXp: enrollment.student.xp,
            classXp: materialProgress.materialXp + exerciseProgress.exerciseXp + achievementProgress.achievementXp,
            materialXp: materialProgress.materialXp,
            exerciseXp: exerciseProgress.exerciseXp,
            achievementXp: achievementProgress.achievementXp,
            completionRate,
            completedMaterials: materialProgress.completedMaterials,
            discussionCount,
            pendingReviews: exerciseProgress.pendingReviews,
            solvedQuestions: exerciseProgress.solvedQuestions,
            badges
        };
    }).sort((left, right) => {
        if (right.classXp !== left.classXp) {
            return right.classXp - left.classXp;
        }

        if (right.completionRate !== left.completionRate) {
            return right.completionRate - left.completionRate;
        }

        return left.name.localeCompare(right.name);
    }).map((entry, index) => ({
        ...entry,
        rank: index + 1,
        isCurrentUser: entry.studentId === currentUserId
    }));

    return rankedEntries.map((entry) => {
        const rankBadges = [...entry.badges];
        if (entry.rank === 1) {
            rankBadges.unshift({ id: `rank-1-${entry.studentId}`, label: 'Juara Kelas', icon: 'crown', tone: 'amber' });
        } else if (entry.rank <= 3) {
            rankBadges.unshift({ id: `podium-${entry.studentId}`, label: 'Podium Kelas', icon: 'medal', tone: 'amber' });
        }

        return {
            ...entry,
            badges: rankBadges.slice(0, 5)
        };
    });
};

const sanitizeExerciseOptionsForStudent = (options: string | null) => {
    if (!options) {
        return options;
    }

    try {
        const parsed = JSON.parse(options);
        if (!Array.isArray(parsed)) {
            return options;
        }

        return JSON.stringify(
            parsed.map((option: Record<string, unknown>) => ({
                id: option.id,
                text: option.text
            }))
        );
    } catch (error) {
        return options;
    }
};

// Create a new class (Teacher only)
router.post('/', authMiddleware, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res) => {
    try {
        const { name, subject, description } = req.body;

        if (!name || !String(name).trim()) {
            return res.status(400).json({ error: 'Class name is required' });
        }

        const code = await generateClassCode();
        const user = getRequestUser(req);

        const newClass = await prisma.class.create({
            data: {
                name: String(name).trim(),
                subject: String(subject || 'Umum').trim() || 'Umum',
                description: description ? String(description).trim() : null,
                code,
                teacherId: user.id
            }
        });

        res.status(201).json(newClass);
    } catch (error) {
        console.error('Create class error:', error);
        res.status(500).json({ error: 'Failed to create class' });
    }
});

// List classes (Role based)
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const user = getRequestUser(req);

        let classes;
        if (user.role === 'ADMIN') {
            classes = await prisma.class.findMany({
                include: {
                    teacher: { select: { name: true } },
                    _count: { select: { modules: true, students: true } }
                },
                orderBy: { createdAt: 'desc' }
            });
        } else if (user.role === 'TEACHER') {
            classes = await prisma.class.findMany({
                where: { teacherId: user.id },
                include: {
                    teacher: { select: { name: true } },
                    _count: { select: { modules: true, students: true } }
                },
                orderBy: { createdAt: 'desc' }
            });
        } else {
            classes = await prisma.class.findMany({
                where: {
                    students: {
                        some: { studentId: user.id }
                    }
                },
                include: {
                    teacher: { select: { name: true } },
                    _count: { select: { modules: true, students: true } }
                },
                orderBy: { createdAt: 'desc' }
            });
        }

        res.json(classes);
    } catch (error) {
        console.error('Get classes error:', error);
        res.status(500).json({ error: 'Failed to fetch classes' });
    }
});

// Join Class (Student)
router.post('/join', authMiddleware, requireRole('STUDENT'), async (req: AuthRequest, res) => {
    try {
        const { code } = req.body;
        const user = getRequestUser(req);

        if (!code || !String(code).trim()) {
            return res.status(400).json({ error: 'Code is required' });
        }

        const normalizedCode = normalizeClassCode(String(code));
        const targetClass = await prisma.class.findUnique({
            where: { code: normalizedCode }
        });

        if (!targetClass) {
            return res.status(404).json({ error: 'Invalid class code' });
        }

        const existingEnrollment = await prisma.classEnrollment.findUnique({
            where: {
                studentId_classId: {
                    studentId: user.id,
                    classId: targetClass.id
                }
            }
        });

        if (existingEnrollment) {
            return res.status(400).json({ error: 'Already enrolled in this class' });
        }

        await prisma.classEnrollment.create({
            data: {
                studentId: user.id,
                classId: targetClass.id
            }
        });

        res.json({
            message: 'Successfully joined class',
            classId: targetClass.id,
            className: targetClass.name
        });
    } catch (error) {
        console.error('Join class error:', error);
        res.status(500).json({ error: 'Failed to join class' });
    }
});

// List public classes for discovery
router.get('/public/discover', async (req, res) => {
    try {
        const { search, subject } = req.query;
        const where: Record<string, unknown> = { isPublic: true };

        if (search) {
            where.OR = [
                { name: { contains: String(search) } },
                { description: { contains: String(search) } }
            ];
        }

        if (subject) {
            where.subject = String(subject);
        }

        const classes = await prisma.class.findMany({
            where,
            select: {
                id: true,
                name: true,
                code: true,
                subject: true,
                description: true,
                thumbnail: true,
                progressionMode: true,
                teacher: { select: { name: true } },
                _count: { select: { students: true, modules: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(classes);
    } catch (error) {
        console.error('Get public classes error:', error);
        res.status(500).json({ error: 'Failed to fetch public classes' });
    }
});

// Preview public class before joining
router.get('/public/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const classDetail = await prisma.class.findFirst({
            where: { id, isPublic: true },
            select: {
                id: true,
                name: true,
                subject: true,
                description: true,
                thumbnail: true,
                progressionMode: true,
                code: true,
                teacher: { select: { name: true } },
                _count: { select: { students: true, modules: true } },
                modules: {
                    select: { id: true, title: true, order: true },
                    orderBy: { order: 'asc' }
                }
            }
        });

        if (!classDetail) {
            return res.status(404).json({ error: 'Class not found or not public' });
        }

        res.json(classDetail);
    } catch (error) {
        console.error('Get public class detail error:', error);
        res.status(500).json({ error: 'Failed to fetch class details' });
    }
});

// Get Class Details
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const user = getRequestUser(req);
        const access = await getClassAccess(id, user.id, user.role);

        if (!access.targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

        if (!canAccessClass(access)) {
            return res.status(403).json({ error: 'Not authorized to view this class' });
        }

        const classDetail = await prisma.class.findUnique({
            where: { id },
            include: classDetailInclude
        });

        if (!classDetail) {
            return res.status(404).json({ error: 'Class not found' });
        }

        if (canManageClass(access)) {
            return res.json(classDetail);
        }

        const { students, ...studentView } = classDetail;
        res.json(studentView);
    } catch (error) {
        console.error('Get class detail error:', error);
        res.status(500).json({ error: 'Failed to fetch class details' });
    }
});

// Class settings (Teacher only)
router.put('/:id/settings', authMiddleware, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const { isPublic, progressionMode, thumbnail, xpMultiplier, geogebraEnabled } = req.body;
        const user = getRequestUser(req);
        const access = await getClassAccess(id, user.id, user.role);

        if (!access.targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

        if (!canManageClass(access)) {
            return res.status(403).json({ error: 'Not authorized to modify this class' });
        }

        const updated = await prisma.class.update({
            where: { id },
            data: {
                ...(isPublic !== undefined && { isPublic: Boolean(isPublic) }),
                ...(progressionMode !== undefined && { progressionMode }),
                ...(thumbnail !== undefined && { thumbnail }),
                ...(xpMultiplier !== undefined && { xpMultiplier: Number(xpMultiplier) }),
                ...(geogebraEnabled !== undefined && { geogebraEnabled: Boolean(geogebraEnabled) })
            }
        });

        res.json(updated);
    } catch (error) {
        console.error('Update class settings error:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// Class dashboard
router.get('/:id/dashboard', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const user = getRequestUser(req);
        const access = await getClassAccess(id, user.id, user.role);

        if (!access.targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

        if (!canAccessClass(access)) {
            return res.status(403).json({ error: 'Not authorized to view this dashboard' });
        }

        const classData = await prisma.class.findUnique({
            where: { id },
            include: classDashboardInclude
        });

        if (!classData) {
            return res.status(404).json({ error: 'Class not found' });
        }

        const materialIds = classData.modules.flatMap((module) => module.materials.map((material) => material.id));

        const progress = access.isEnrolled
            ? await prisma.progress.findMany({
                where: {
                    userId: user.id,
                    materialId: { in: materialIds }
                }
            })
            : [];

        const unlockedAchievements = access.isEnrolled
            ? await prisma.studentClassAchievement.findMany({
                where: {
                    studentId: user.id,
                    achievement: { classId: id }
                },
                include: { achievement: true }
            })
            : [];

        const totalMaterials = materialIds.length;
        const completedMaterials = progress.filter((item) => item.status === 'completed').length;
        const totalXP = progress
            .filter((item) => item.status === 'completed')
            .reduce((sum, item) => sum + (item.score || 50) * (classData.xpMultiplier || 1), 0);

        res.json({
            class: classData,
            progress: {
                completed: completedMaterials,
                total: totalMaterials,
                percentage: totalMaterials > 0 ? Math.round((completedMaterials / totalMaterials) * 100) : 0,
                xp: Math.round(totalXP)
            },
            materialProgress: progress,
            achievements: {
                unlocked: unlockedAchievements,
                total: classData.achievements.length
            }
        });
    } catch (error) {
        console.error('Get class dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard' });
    }
});

// Class leaderboard
router.get('/:id/leaderboard', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const user = getRequestUser(req);
        const access = await getClassAccess(id, user.id, user.role);

        if (!access.targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

        if (!canAccessClass(access)) {
            return res.status(403).json({ error: 'Not authorized to view this leaderboard' });
        }

        const leaderboard = await buildClassLeaderboard(id, user.id);
        res.json(leaderboard ?? []);
    } catch (error) {
        console.error('Get class leaderboard error:', error);
        res.status(500).json({ error: 'Failed to fetch class leaderboard' });
    }
});

// List class discussions
router.get('/:id/discussions', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const user = getRequestUser(req);
        const access = await getClassAccess(id, user.id, user.role);

        if (!access.targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

        if (!canAccessClass(access)) {
            return res.status(403).json({ error: 'Not authorized to view class discussions' });
        }

        const threads = await prisma.classDiscussionThread.findMany({
            where: { classId: id },
            orderBy: [
                { isPinned: 'desc' },
                { updatedAt: 'desc' }
            ],
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        role: true
                    }
                },
                replies: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                role: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        replies: true
                    }
                }
            }
        });

        res.json(threads);
    } catch (error) {
        console.error('Get class discussions error:', error);
        res.status(500).json({ error: 'Failed to fetch discussions' });
    }
});

// Create class discussion thread
router.post('/:id/discussions', authMiddleware, validateBody(discussionThreadSchema), async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const user = getRequestUser(req);
        const access = await getClassAccess(id, user.id, user.role);

        if (!access.targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

        if (!canAccessClass(access)) {
            return res.status(403).json({ error: 'Not authorized to create discussion in this class' });
        }

        const thread = await prisma.classDiscussionThread.create({
            data: {
                classId: id,
                authorId: user.id,
                title: req.body.title,
                content: req.body.content
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        role: true
                    }
                },
                replies: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                role: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        replies: true
                    }
                }
            }
        });

        res.status(201).json(thread);
    } catch (error) {
        console.error('Create class discussion error:', error);
        res.status(500).json({ error: 'Failed to create discussion thread' });
    }
});

// Reply to class discussion thread
router.post('/:id/discussions/:threadId/replies', authMiddleware, validateBody(discussionReplySchema), async (req: AuthRequest, res) => {
    try {
        const { id, threadId } = req.params;
        const user = getRequestUser(req);
        const access = await getClassAccess(id, user.id, user.role);

        if (!access.targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

        if (!canAccessClass(access)) {
            return res.status(403).json({ error: 'Not authorized to reply in this class' });
        }

        const thread = await prisma.classDiscussionThread.findFirst({
            where: {
                id: threadId,
                classId: id
            },
            select: {
                id: true,
                isLocked: true
            }
        });

        if (!thread) {
            return res.status(404).json({ error: 'Discussion thread not found' });
        }

        if (thread.isLocked && !canManageClass(access)) {
            return res.status(403).json({ error: 'Thread is locked by the teacher' });
        }

        const reply = await prisma.$transaction(async (tx) => {
            const createdReply = await tx.classDiscussionReply.create({
                data: {
                    threadId,
                    authorId: user.id,
                    content: req.body.content
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            role: true
                        }
                    }
                }
            });

            await tx.classDiscussionThread.update({
                where: { id: threadId },
                data: {
                    updatedAt: new Date()
                }
            });

            return createdReply;
        });

        res.status(201).json(reply);
    } catch (error) {
        console.error('Create discussion reply error:', error);
        res.status(500).json({ error: 'Failed to create discussion reply' });
    }
});

// Pin or unpin discussion thread
router.patch('/:id/discussions/:threadId/pin', authMiddleware, requireRole('TEACHER', 'ADMIN'), validateBody(discussionToggleSchema), async (req: AuthRequest, res) => {
    try {
        const { id, threadId } = req.params;
        const user = getRequestUser(req);
        const access = await getClassAccess(id, user.id, user.role);

        if (!access.targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

        if (!canManageClass(access)) {
            return res.status(403).json({ error: 'Not authorized to moderate this class discussion' });
        }

        const thread = await prisma.classDiscussionThread.findFirst({
            where: {
                id: threadId,
                classId: id
            }
        });

        if (!thread) {
            return res.status(404).json({ error: 'Discussion thread not found' });
        }

        const updatedThread = await prisma.classDiscussionThread.update({
            where: { id: threadId },
            data: {
                isPinned: req.body.value
            }
        });

        res.json(updatedThread);
    } catch (error) {
        console.error('Pin discussion thread error:', error);
        res.status(500).json({ error: 'Failed to update pinned state' });
    }
});

// Lock or unlock discussion thread
router.patch('/:id/discussions/:threadId/lock', authMiddleware, requireRole('TEACHER', 'ADMIN'), validateBody(discussionToggleSchema), async (req: AuthRequest, res) => {
    try {
        const { id, threadId } = req.params;
        const user = getRequestUser(req);
        const access = await getClassAccess(id, user.id, user.role);

        if (!access.targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

        if (!canManageClass(access)) {
            return res.status(403).json({ error: 'Not authorized to moderate this class discussion' });
        }

        const thread = await prisma.classDiscussionThread.findFirst({
            where: {
                id: threadId,
                classId: id
            }
        });

        if (!thread) {
            return res.status(404).json({ error: 'Discussion thread not found' });
        }

        const updatedThread = await prisma.classDiscussionThread.update({
            where: { id: threadId },
            data: {
                isLocked: req.body.value
            }
        });

        res.json(updatedThread);
    } catch (error) {
        console.error('Lock discussion thread error:', error);
        res.status(500).json({ error: 'Failed to update locked state' });
    }
});

// Create achievement (Teacher)
router.post('/:id/achievements', authMiddleware, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const { title, description, icon, xpReward, condition } = req.body;
        const user = getRequestUser(req);
        const access = await getClassAccess(id, user.id, user.role);

        if (!access.targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

        if (!canManageClass(access)) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        if (!title || !description || !condition) {
            return res.status(400).json({ error: 'Title, description, and condition are required' });
        }

        const achievement = await prisma.classAchievement.create({
            data: {
                title,
                description,
                icon: icon || 'trophy',
                xpReward: xpReward || 50,
                condition: typeof condition === 'string' ? condition : JSON.stringify(condition),
                classId: id
            }
        });

        res.status(201).json(achievement);
    } catch (error) {
        console.error('Create achievement error:', error);
        res.status(500).json({ error: 'Failed to create achievement' });
    }
});

// List achievements for class
router.get('/:id/achievements', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const user = getRequestUser(req);
        const access = await getClassAccess(id, user.id, user.role);

        if (!access.targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

        if (!canAccessClass(access)) {
            return res.status(403).json({ error: 'Not authorized to view achievements for this class' });
        }

        const achievements = await prisma.classAchievement.findMany({
            where: { classId: id },
            include: {
                unlockedBy: {
                    where: { studentId: user.id },
                    select: { unlockedAt: true }
                }
            }
        });

        const formatted = achievements.map((achievement) => ({
            ...achievement,
            unlocked: achievement.unlockedBy.length > 0,
            unlockedAt: achievement.unlockedBy[0]?.unlockedAt || null
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Get achievements error:', error);
        res.status(500).json({ error: 'Failed to fetch achievements' });
    }
});

// Claim/check achievement (Student)
router.post('/:id/achievements/:achId/claim', authMiddleware, requireRole('STUDENT'), async (req: AuthRequest, res) => {
    try {
        const { id, achId } = req.params;
        const user = getRequestUser(req);
        const access = await getClassAccess(id, user.id, user.role);

        if (!access.targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

        if (!access.isEnrolled) {
            return res.status(403).json({ error: 'Only enrolled students can claim achievements' });
        }

        const achievement = await prisma.classAchievement.findFirst({
            where: { id: achId, classId: id }
        });

        if (!achievement) {
            return res.status(404).json({ error: 'Achievement not found' });
        }

        const existing = await prisma.studentClassAchievement.findUnique({
            where: {
                studentId_achievementId: {
                    studentId: user.id,
                    achievementId: achId
                }
            }
        });

        if (existing) {
            return res.status(400).json({ error: 'Achievement already unlocked' });
        }

        let condition: { type?: string; target?: number };
        try {
            condition = JSON.parse(achievement.condition);
        } catch (parseError) {
            return res.status(400).json({ error: 'Achievement condition is invalid' });
        }

        let conditionMet = false;
        const classModules = await prisma.module.findMany({
            where: { classId: id },
            include: { materials: true }
        });
        const materialIds = classModules.flatMap((module) => module.materials.map((material) => material.id));

        if (condition.type === 'complete_materials') {
            const completed = await prisma.progress.count({
                where: {
                    userId: user.id,
                    materialId: { in: materialIds },
                    status: 'completed'
                }
            });
            conditionMet = completed >= (condition.target || 0);
        } else if (condition.type === 'quiz_score') {
            const quizzes = await prisma.progress.findMany({
                where: {
                    userId: user.id,
                    materialId: { in: materialIds },
                    status: 'completed',
                    score: { gte: condition.target || 0 }
                }
            });
            conditionMet = quizzes.length > 0;
        } else if (condition.type === 'complete_module') {
            let completedModules = 0;

            for (const module of classModules) {
                const moduleMaterialIds = module.materials.map((material) => material.id);
                if (moduleMaterialIds.length === 0) {
                    continue;
                }

                const completed = await prisma.progress.count({
                    where: {
                        userId: user.id,
                        materialId: { in: moduleMaterialIds },
                        status: 'completed'
                    }
                });

                if (completed === moduleMaterialIds.length) {
                    completedModules += 1;
                }
            }

            conditionMet = completedModules >= (condition.target || 0);
        }

        if (!conditionMet) {
            return res.status(400).json({ error: 'Achievement condition not met', condition });
        }

        await prisma.studentClassAchievement.create({
            data: {
                studentId: user.id,
                achievementId: achId
            }
        });

        await prisma.user.update({
            where: { id: user.id },
            data: { xp: { increment: achievement.xpReward } }
        });

        res.json({
            message: 'Achievement unlocked!',
            achievement,
            xpAwarded: achievement.xpReward
        });
    } catch (error) {
        console.error('Claim achievement error:', error);
        res.status(500).json({ error: 'Failed to claim achievement' });
    }
});

// Get all books for a class
router.get('/:id/books', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const user = getRequestUser(req);
        const access = await getClassAccess(id, user.id, user.role);

        if (!access.targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

        if (!canAccessClass(access)) {
            return res.status(403).json({ error: 'Not authorized to view class books' });
        }

        const books = await prisma.classBook.findMany({
            where: { classId: id },
            orderBy: { createdAt: 'desc' }
        });

        res.json(books);
    } catch (error) {
        console.error('Get books error:', error);
        res.status(500).json({ error: 'Failed to fetch books' });
    }
});

// Create a book (Teacher only)
router.post('/:id/books', authMiddleware, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const { title, author, description, coverUrl, contentType, content, pdfUrl } = req.body;
        const user = getRequestUser(req);
        const access = await getClassAccess(id, user.id, user.role);

        if (!access.targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

        if (!canManageClass(access)) {
            return res.status(403).json({ error: 'Not authorized to manage books in this class' });
        }

        if (!title || !String(title).trim()) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const book = await prisma.classBook.create({
            data: {
                classId: id,
                title: String(title).trim(),
                author,
                description,
                coverUrl,
                contentType: contentType || 'rich_text',
                content,
                pdfUrl
            }
        });

        res.status(201).json(book);
    } catch (error) {
        console.error('Create book error:', error);
        res.status(500).json({ error: 'Failed to create book' });
    }
});

// Update a book
router.put('/:id/books/:bookId', authMiddleware, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res) => {
    try {
        const { id, bookId } = req.params;
        const { title, author, description, coverUrl, contentType, content, pdfUrl } = req.body;
        const user = getRequestUser(req);
        const access = await getClassAccess(id, user.id, user.role);

        if (!access.targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

        if (!canManageClass(access)) {
            return res.status(403).json({ error: 'Not authorized to update books in this class' });
        }

        const existingBook = await prisma.classBook.findFirst({
            where: { id: bookId, classId: id }
        });

        if (!existingBook) {
            return res.status(404).json({ error: 'Book not found' });
        }

        const book = await prisma.classBook.update({
            where: { id: bookId },
            data: {
                ...(title !== undefined && { title }),
                ...(author !== undefined && { author }),
                ...(description !== undefined && { description }),
                ...(coverUrl !== undefined && { coverUrl }),
                ...(contentType !== undefined && { contentType }),
                ...(content !== undefined && { content }),
                ...(pdfUrl !== undefined && { pdfUrl })
            }
        });

        res.json(book);
    } catch (error) {
        console.error('Update book error:', error);
        res.status(500).json({ error: 'Failed to update book' });
    }
});

// Delete a book
router.delete('/:id/books/:bookId', authMiddleware, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res) => {
    try {
        const { id, bookId } = req.params;
        const user = getRequestUser(req);
        const access = await getClassAccess(id, user.id, user.role);

        if (!access.targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

        if (!canManageClass(access)) {
            return res.status(403).json({ error: 'Not authorized to delete books in this class' });
        }

        const existingBook = await prisma.classBook.findFirst({
            where: { id: bookId, classId: id }
        });

        if (!existingBook) {
            return res.status(404).json({ error: 'Book not found' });
        }

        await prisma.classBook.delete({ where: { id: bookId } });
        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        console.error('Delete book error:', error);
        res.status(500).json({ error: 'Failed to delete book' });
    }
});

// Get all exercises for a class
router.get('/:id/exercises', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const user = getRequestUser(req);
        const access = await getClassAccess(id, user.id, user.role);

        if (!access.targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

        if (!canAccessClass(access)) {
            return res.status(403).json({ error: 'Not authorized to view class exercises' });
        }

        const whereClause = user.role === 'STUDENT'
            ? { classId: id, isPublished: true }
            : { classId: id };

        const exercises = await prisma.classExercise.findMany({
            where: whereClause,
            orderBy: { order: 'asc' },
            include: {
                attempts: user.role === 'STUDENT'
                    ? {
                        where: { studentId: user.id },
                        select: {
                            id: true,
                            isCorrect: true,
                            score: true,
                            createdAt: true,
                            gradingStatus: true,
                            feedback: true,
                            gradedAt: true,
                            timeSpent: true,
                            questionResults: true
                        }
                    }
                    : {
                        select: {
                            id: true,
                            isCorrect: true,
                            score: true,
                            gradingStatus: true,
                            createdAt: true,
                            questionResults: true
                        }
                    }
            }
        });

        res.json(exercises.map((exercise) => formatExerciseForResponse(exercise, user.role !== 'STUDENT')));
    } catch (error) {
        console.error('Get exercises error:', error);
        res.status(500).json({ error: 'Failed to fetch exercises' });
    }
});

// Get single exercise with details
router.get('/:id/exercises/:exerciseId', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { id, exerciseId } = req.params;
        const user = getRequestUser(req);
        const access = await getClassAccess(id, user.id, user.role);

        if (!access.targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

        if (!canAccessClass(access)) {
            return res.status(403).json({ error: 'Not authorized to view this exercise' });
        }

        const exercise = await prisma.classExercise.findFirst({
            where: { id: exerciseId, classId: id },
            include: {
                attempts: user.role === 'STUDENT'
                    ? {
                        where: { studentId: user.id },
                        select: {
                            id: true,
                            isCorrect: true,
                            score: true,
                            answer: true,
                            canvasData: true,
                            timeSpent: true,
                            createdAt: true,
                            gradingStatus: true,
                            feedback: true,
                            gradedAt: true,
                            questionResults: true
                        }
                    }
                    : {
                        select: {
                            id: true,
                            answer: true,
                            canvasData: true,
                            isCorrect: true,
                            score: true,
                            timeSpent: true,
                            createdAt: true,
                            gradingStatus: true,
                            feedback: true,
                            gradedAt: true,
                            questionResults: true,
                            student: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true
                                }
                            }
                        }
                    }
            }
        });

        if (!exercise) {
            return res.status(404).json({ error: 'Exercise not found' });
        }

        if (user.role === 'STUDENT' && !exercise.isPublished) {
            return res.status(403).json({ error: 'Exercise not available' });
        }

        res.json(formatExerciseForResponse(exercise, user.role !== 'STUDENT'));
    } catch (error) {
        console.error('Get exercise error:', error);
        res.status(500).json({ error: 'Failed to fetch exercise' });
    }
});

// Create exercise (Teacher only)
router.post('/:id/exercises', authMiddleware, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const user = getRequestUser(req);
        const access = await getClassAccess(id, user.id, user.role);

        if (!access.targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

        if (!canManageClass(access)) {
            return res.status(403).json({ error: 'Not authorized to create exercises in this class' });
        }

        const title = String(req.body.title || '').trim();
        if (!title || !String(title).trim()) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const exerciseMutation = buildExerciseMutationData(req.body as Record<string, unknown>);

        const exercise = await prisma.classExercise.create({
            data: {
                classId: id,
                title,
                description: typeof req.body.description === 'string' ? req.body.description : null,
                instructions: typeof req.body.instructions === 'string' ? req.body.instructions : null,
                exerciseType: typeof req.body.exerciseType === 'string' ? req.body.exerciseType : 'mixed',
                difficulty: typeof req.body.difficulty === 'string' ? req.body.difficulty : 'medium',
                hasTimer: Boolean(req.body.hasTimer),
                timerMinutes: req.body.hasTimer ? Number(req.body.timerMinutes || 0) || null : null,
                isPublished: Boolean(req.body.isPublished),
                order: Number(req.body.order || 0) || 0,
                ...exerciseMutation.data
            }
        });

        res.status(201).json(formatExerciseForResponse(exercise, true));
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Exercise payload is invalid',
                details: error.issues.map((issue) => ({
                    path: issue.path.join('.'),
                    message: issue.message
                }))
            });
        }

        console.error('Create exercise error:', error);
        res.status(500).json({ error: 'Failed to create exercise' });
    }
});

// Update exercise (Teacher only)
router.put('/:id/exercises/:exerciseId', authMiddleware, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res) => {
    try {
        const { id, exerciseId } = req.params;
        const user = getRequestUser(req);
        const access = await getClassAccess(id, user.id, user.role);

        if (!access.targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

        if (!canManageClass(access)) {
            return res.status(403).json({ error: 'Not authorized to update exercises in this class' });
        }

        const existingExercise = await prisma.classExercise.findFirst({
            where: { id: exerciseId, classId: id }
        });

        if (!existingExercise) {
            return res.status(404).json({ error: 'Exercise not found' });
        }

        if (req.body.title !== undefined && !String(req.body.title).trim()) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const exerciseMutation = buildExerciseMutationData({
            ...existingExercise,
            ...req.body
        });

        const exercise = await prisma.classExercise.update({
            where: { id: exerciseId },
            data: {
                ...(req.body.title !== undefined && { title: String(req.body.title).trim() }),
                ...(req.body.description !== undefined && { description: typeof req.body.description === 'string' ? req.body.description : null }),
                ...(req.body.instructions !== undefined && { instructions: typeof req.body.instructions === 'string' ? req.body.instructions : null }),
                ...(req.body.exerciseType !== undefined && { exerciseType: String(req.body.exerciseType) }),
                ...(req.body.difficulty !== undefined && { difficulty: String(req.body.difficulty) }),
                ...(req.body.hasTimer !== undefined && { hasTimer: Boolean(req.body.hasTimer) }),
                ...(req.body.timerMinutes !== undefined && { timerMinutes: Number(req.body.timerMinutes || 0) || null }),
                ...(req.body.isPublished !== undefined && { isPublished: Boolean(req.body.isPublished) }),
                ...(req.body.order !== undefined && { order: Number(req.body.order || 0) || 0 }),
                ...exerciseMutation.data
            }
        });

        res.json(formatExerciseForResponse(exercise, true));
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Exercise payload is invalid',
                details: error.issues.map((issue) => ({
                    path: issue.path.join('.'),
                    message: issue.message
                }))
            });
        }

        console.error('Update exercise error:', error);
        res.status(500).json({ error: 'Failed to update exercise' });
    }
});

// Delete exercise (Teacher only)
router.delete('/:id/exercises/:exerciseId', authMiddleware, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res) => {
    try {
        const { id, exerciseId } = req.params;
        const user = getRequestUser(req);
        const access = await getClassAccess(id, user.id, user.role);

        if (!access.targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

        if (!canManageClass(access)) {
            return res.status(403).json({ error: 'Not authorized to delete exercises in this class' });
        }

        const existingExercise = await prisma.classExercise.findFirst({
            where: { id: exerciseId, classId: id }
        });

        if (!existingExercise) {
            return res.status(404).json({ error: 'Exercise not found' });
        }

        await prisma.classExercise.delete({ where: { id: exerciseId } });
        res.json({ message: 'Exercise deleted successfully' });
    } catch (error) {
        console.error('Delete exercise error:', error);
        res.status(500).json({ error: 'Failed to delete exercise' });
    }
});

// Submit exercise attempt (Student only)
router.post('/:id/exercises/:exerciseId/attempt', authMiddleware, requireRole('STUDENT'), async (req: AuthRequest, res) => {
    try {
        const { id, exerciseId } = req.params;
        const { answer, canvasData, timeSpent } = req.body;
        const user = getRequestUser(req);
        const access = await getClassAccess(id, user.id, user.role);

        if (!access.targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

        if (!access.isEnrolled) {
            return res.status(403).json({ error: 'Only enrolled students can submit this exercise' });
        }

        const exercise = await prisma.classExercise.findFirst({
            where: { id: exerciseId, classId: id }
        });

        if (!exercise || !exercise.isPublished) {
            return res.status(404).json({ error: 'Exercise not found' });
        }

        const existingAttempt = await prisma.exerciseAttempt.findUnique({
            where: {
                studentId_exerciseId: {
                    studentId: user.id,
                    exerciseId
                }
            }
        });

        if (existingAttempt) {
            return res.status(400).json({ error: 'Already attempted', attempt: existingAttempt });
        }

        const questions = getExerciseQuestions(exercise);
        const gradingOutcome = gradeExerciseSubmission(questions, answer, canvasData);

        const attempt = await prisma.exerciseAttempt.create({
            data: {
                studentId: user.id,
                exerciseId,
                answer: JSON.stringify(gradingOutcome.normalizedAnswers),
                canvasData: gradingOutcome.primaryCanvasData,
                questionResults: JSON.stringify(gradingOutcome.questionResults),
                isCorrect: gradingOutcome.isCorrect,
                score: gradingOutcome.score,
                gradingStatus: gradingOutcome.gradingStatus,
                gradedAt: gradingOutcome.gradedAt,
                timeSpent: Number(timeSpent || 0) || 0
            }
        });

        if (gradingOutcome.score > 0) {
            await prisma.user.update({
                where: { id: user.id },
                data: { xp: { increment: gradingOutcome.score } }
            });
        }

        res.status(201).json({
            attempt,
            gradingStatus: gradingOutcome.gradingStatus,
            isCorrect: gradingOutcome.gradingStatus === EXERCISE_STATUS_PENDING_REVIEW ? null : gradingOutcome.isCorrect,
            score: gradingOutcome.score,
            message: gradingOutcome.gradingStatus === EXERCISE_STATUS_PENDING_REVIEW
                ? 'Jawaban berhasil dikirim. Sebagian hasil menunggu penilaian guru.'
                : gradingOutcome.isCorrect
                    ? 'Jawaban benar. Kerja bagus!'
                    : 'Jawaban sudah tersimpan. Cek kembali pembahasan dari guru.'
        });
    } catch (error) {
        console.error('Submit attempt error:', error);
        res.status(500).json({ error: 'Failed to submit attempt' });
    }
});

// Grade exercise attempt (Teacher only)
router.post('/:id/exercises/:exerciseId/attempts/:attemptId/grade', authMiddleware, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res) => {
    try {
        const { id, exerciseId, attemptId } = req.params;
        const { score, isCorrect, feedback } = req.body;
        const user = getRequestUser(req);
        const access = await getClassAccess(id, user.id, user.role);

        if (!access.targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

        if (!canManageClass(access)) {
            return res.status(403).json({ error: 'Not authorized to grade this exercise' });
        }

        const exercise = await prisma.classExercise.findFirst({
            where: { id: exerciseId, classId: id },
            select: { id: true, points: true }
        });

        if (!exercise) {
            return res.status(404).json({ error: 'Exercise not found' });
        }

        const numericScore = Number(score);
        if (!Number.isFinite(numericScore)) {
            return res.status(400).json({ error: 'Score must be a valid number' });
        }

        const nextScore = clampScore(Math.round(numericScore), 0, exercise.points);
        const nextIsCorrect = typeof isCorrect === 'boolean'
            ? isCorrect
            : nextScore >= exercise.points;

        const updatedAttempt = await prisma.$transaction(async (tx) => {
            const existingAttempt = await tx.exerciseAttempt.findFirst({
                where: {
                    id: attemptId,
                    exerciseId
                },
                select: {
                    id: true,
                    studentId: true,
                    score: true
                }
            });

            if (!existingAttempt) {
                throw new Error('ATTEMPT_NOT_FOUND');
            }

            const attempt = await tx.exerciseAttempt.update({
                where: { id: attemptId },
                data: {
                    score: nextScore,
                    isCorrect: nextIsCorrect,
                    gradingStatus: EXERCISE_STATUS_GRADED,
                    gradedAt: new Date(),
                    ...(feedback !== undefined && { feedback: String(feedback).trim() || null })
                },
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });

            const xpDelta = nextScore - existingAttempt.score;
            if (xpDelta !== 0) {
                const student = await tx.user.findUnique({
                    where: { id: existingAttempt.studentId },
                    select: { xp: true }
                });

                await tx.user.update({
                    where: { id: existingAttempt.studentId },
                    data: {
                        xp: Math.max(0, (student?.xp || 0) + xpDelta)
                    }
                });
            }

            return attempt;
        });

        res.json({
            message: 'Penilaian berhasil disimpan',
            attempt: updatedAttempt
        });
    } catch (error) {
        if (error instanceof Error && error.message === 'ATTEMPT_NOT_FOUND') {
            return res.status(404).json({ error: 'Attempt not found' });
        }

        console.error('Grade attempt error:', error);
        res.status(500).json({ error: 'Failed to grade attempt' });
    }
});

export default router;

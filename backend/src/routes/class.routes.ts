import { Router } from 'express';
import prisma from '../utils/prisma';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Helper to generate unique class code
const generateClassCode = async (): Promise<string> => {
    let code = '';
    let exists = true;
    while (exists) {
        code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const existingClass = await prisma.class.findUnique({ where: { code } });
        if (!existingClass) exists = false;
    }
    return code;
};

// Create a new class (Teacher only)
router.post('/', authMiddleware, requireRole('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const { name, subject, description } = req.body;
        const code = await generateClassCode();
        // @ts-ignore - req.user is added by authMiddleware
        const teacherId = req.user.id; 

        const newClass = await prisma.class.create({
            data: {
                name,
                subject,
                description,
                code,
                teacherId
            }
        });
        res.status(201).json(newClass);
    } catch (error) {
        console.error('Create class error:', error);
        res.status(500).json({ error: 'Failed to create class' });
    }
});

// List classes (Role based)
router.get('/', authMiddleware, async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        // @ts-ignore
        const role = req.user.role;

        let classes;
        if (role === 'TEACHER' || role === 'ADMIN') {
            // Get created classes
            classes = await prisma.class.findMany({
                where: { teacherId: userId },
                include: { 
                    teacher: { select: { name: true } }, 
                    _count: { select: { modules: true, students: true } } 
                },
                orderBy: { createdAt: 'desc' }
            });
        } else {
            // Get enrolled classes
            classes = await prisma.class.findMany({
                where: {
                    students: {
                        some: { studentId: userId }
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

// Get Class Details (including modules)
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        // @ts-ignore
        const userId = req.user.id;

        const classDetail = await prisma.class.findUnique({
            where: { id },
            include: {
                modules: {
                    include: {
                        materials: {
                            select: { id: true, title: true, type: true, moduleOrder: true },
                            orderBy: { moduleOrder: 'asc' }
                        }
                    },
                    orderBy: { order: 'asc' }
                },
                teacher: { select: { id: true, name: true } }
            }
        });

        if (!classDetail) {
            return res.status(404).json({ error: 'Class not found' });
        }

        // Security check: User must be teacher of class OR enrolled student
        const isTeacher = classDetail.teacherId === userId;
        let isEnrolled = false;

        if (!isTeacher) {
            const enrollment = await prisma.classEnrollment.findUnique({
                where: {
                    studentId_classId: {
                        studentId: userId,
                        classId: id
                    }
                }
            });
            isEnrolled = !!enrollment;
        }

        if (!isTeacher && !isEnrolled) {
            return res.status(403).json({ error: 'Not authorized to view this class' });
        }

        res.json(classDetail);
    } catch (error) {
        console.error('Get class detail error:', error);
        res.status(500).json({ error: 'Failed to fetch class details' });
    }
});

// Join Class (Student)
router.post('/join', authMiddleware, async (req, res) => {
    try {
        const { code } = req.body;
        // @ts-ignore
        const userId = req.user.id;

        if (!code) {
            return res.status(400).json({ error: 'Code is required' });
        }

        const targetClass = await prisma.class.findUnique({
            where: { code }
        });

        if (!targetClass) {
            return res.status(404).json({ error: 'Invalid class code' });
        }

        if (targetClass.teacherId === userId) {
            return res.status(400).json({ error: 'Teachers cannot join their own class as a student' });
        }

        // Check if already enrolled
        const existingEnrollment = await prisma.classEnrollment.findUnique({
             where: {
                studentId_classId: {
                    studentId: userId,
                    classId: targetClass.id
                }
            }
        });

        if (existingEnrollment) {
            return res.status(400).json({ error: 'Already enrolled in this class' });
        }

        await prisma.classEnrollment.create({
            data: {
                studentId: userId,
                classId: targetClass.id
            }
        });

        res.json({ message: 'Successfully joined class', classId: targetClass.id });

    } catch (error) {
        console.error('Join class error:', error);
        res.status(500).json({ error: 'Failed to join class' });
    }
});

// ============ PUBLIC CLASS DISCOVERY ============

// List public classes for discovery (no auth required, but auth helps to exclude already enrolled)
router.get('/public/discover', async (req, res) => {
    try {
        const { search, subject } = req.query;
        
        const where: any = { isPublic: true };
        
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
        
        const classDetail = await prisma.class.findUnique({
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

// ============ CLASS SETTINGS (Teacher only) ============

router.put('/:id/settings', authMiddleware, requireRole('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;
        const { isPublic, progressionMode, thumbnail, xpMultiplier } = req.body;
        // @ts-ignore
        const userId = req.user.id;

        // Verify teacher owns this class
        const existingClass = await prisma.class.findUnique({ where: { id } });
        if (!existingClass) {
            return res.status(404).json({ error: 'Class not found' });
        }
        if (existingClass.teacherId !== userId) {
            return res.status(403).json({ error: 'Not authorized to modify this class' });
        }

        const updated = await prisma.class.update({
            where: { id },
            data: {
                ...(isPublic !== undefined && { isPublic }),
                ...(progressionMode !== undefined && { progressionMode }),
                ...(thumbnail !== undefined && { thumbnail }),
                ...(xpMultiplier !== undefined && { xpMultiplier }),
                ...(req.body.geogebraEnabled !== undefined && { geogebraEnabled: req.body.geogebraEnabled })
            }
        });

        res.json(updated);
    } catch (error) {
        console.error('Update class settings error:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// ============ CLASS DASHBOARD ============

router.get('/:id/dashboard', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        // @ts-ignore
        const userId = req.user.id;

        // Get class with modules and materials
        const classData = await prisma.class.findUnique({
            where: { id },
            include: {
                teacher: { select: { name: true } },
                modules: {
                    include: {
                        materials: {
                            select: { id: true, title: true, type: true, moduleOrder: true },
                            orderBy: { moduleOrder: 'asc' }
                        }
                    },
                    orderBy: { order: 'asc' }
                },
                achievements: true,
                _count: { select: { students: true } }
            }
        });

        if (!classData) {
            return res.status(404).json({ error: 'Class not found' });
        }

        // Get all material IDs from this class
        const materialIds = classData.modules.flatMap(m => m.materials.map(mat => mat.id));

        // Get student's progress on these materials
        const progress = await prisma.progress.findMany({
            where: {
                userId,
                materialId: { in: materialIds }
            }
        });

        // Get unlocked achievements
        const unlockedAchievements = await prisma.studentClassAchievement.findMany({
            where: {
                studentId: userId,
                achievement: { classId: id }
            },
            include: { achievement: true }
        });

        // Calculate stats
        const totalMaterials = materialIds.length;
        const completedMaterials = progress.filter(p => p.status === 'completed').length;
        const totalXP = progress
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + (p.score || 50) * (classData.xpMultiplier || 1), 0);

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

// ============ CLASS ACHIEVEMENTS ============

// Create achievement (Teacher)
router.post('/:id/achievements', authMiddleware, requireRole('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, icon, xpReward, condition } = req.body;
        // @ts-ignore
        const userId = req.user.id;

        // Verify teacher owns this class
        const existingClass = await prisma.class.findUnique({ where: { id } });
        if (!existingClass || existingClass.teacherId !== userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const achievement = await prisma.classAchievement.create({
            data: {
                title,
                description,
                icon: icon || '🏆',
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
router.get('/:id/achievements', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        // @ts-ignore
        const userId = req.user.id;

        const achievements = await prisma.classAchievement.findMany({
            where: { classId: id },
            include: {
                unlockedBy: {
                    where: { studentId: userId },
                    select: { unlockedAt: true }
                }
            }
        });

        // Format response
        const formatted = achievements.map(ach => ({
            ...ach,
            unlocked: ach.unlockedBy.length > 0,
            unlockedAt: ach.unlockedBy[0]?.unlockedAt || null
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Get achievements error:', error);
        res.status(500).json({ error: 'Failed to fetch achievements' });
    }
});

// Claim/check achievement (Student)
router.post('/:id/achievements/:achId/claim', authMiddleware, async (req, res) => {
    try {
        const { id, achId } = req.params;
        // @ts-ignore
        const userId = req.user.id;

        // Get achievement
        const achievement = await prisma.classAchievement.findUnique({
            where: { id: achId, classId: id }
        });

        if (!achievement) {
            return res.status(404).json({ error: 'Achievement not found' });
        }

        // Check if already unlocked
        const existing = await prisma.studentClassAchievement.findUnique({
            where: {
                studentId_achievementId: {
                    studentId: userId,
                    achievementId: achId
                }
            }
        });

        if (existing) {
            return res.status(400).json({ error: 'Achievement already unlocked' });
        }

        // Parse condition and verify
        const condition = JSON.parse(achievement.condition);
        let conditionMet = false;

        // Get class materials for checking
        const classModules = await prisma.module.findMany({
            where: { classId: id },
            include: { materials: true }
        });
        const materialIds = classModules.flatMap(m => m.materials.map(mat => mat.id));

        if (condition.type === 'complete_materials') {
            const completed = await prisma.progress.count({
                where: {
                    userId,
                    materialId: { in: materialIds },
                    status: 'completed'
                }
            });
            conditionMet = completed >= condition.target;
        } else if (condition.type === 'quiz_score') {
            const quizzes = await prisma.progress.findMany({
                where: {
                    userId,
                    materialId: { in: materialIds },
                    status: 'completed',
                    score: { gte: condition.target }
                }
            });
            conditionMet = quizzes.length > 0;
        } else if (condition.type === 'complete_module') {
            // Check if target number of modules are fully completed
            let completedModules = 0;
            for (const mod of classModules) {
                const matIds = mod.materials.map(m => m.id);
                if (matIds.length === 0) continue;
                const completed = await prisma.progress.count({
                    where: {
                        userId,
                        materialId: { in: matIds },
                        status: 'completed'
                    }
                });
                if (completed === matIds.length) completedModules++;
            }
            conditionMet = completedModules >= condition.target;
        }

        if (!conditionMet) {
            return res.status(400).json({ error: 'Achievement condition not met', condition });
        }

        // Unlock achievement
        const unlock = await prisma.studentClassAchievement.create({
            data: {
                studentId: userId,
                achievementId: achId
            }
        });

        // Award XP to user
        await prisma.user.update({
            where: { id: userId },
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

// ============ CLASS BOOKS (Library) ============

// Get all books for a class
router.get('/:id/books', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
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
router.post('/:id/books', authMiddleware, requireRole('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, author, description, coverUrl, contentType, content, pdfUrl } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const book = await prisma.classBook.create({
            data: {
                classId: id,
                title,
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
router.put('/:id/books/:bookId', authMiddleware, requireRole('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const { bookId } = req.params;
        const { title, author, description, coverUrl, contentType, content, pdfUrl } = req.body;

        const book = await prisma.classBook.update({
            where: { id: bookId },
            data: {
                ...(title && { title }),
                ...(author !== undefined && { author }),
                ...(description !== undefined && { description }),
                ...(coverUrl !== undefined && { coverUrl }),
                ...(contentType && { contentType }),
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
router.delete('/:id/books/:bookId', authMiddleware, requireRole('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const { bookId } = req.params;
        await prisma.classBook.delete({ where: { id: bookId } });
        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        console.error('Delete book error:', error);
        res.status(500).json({ error: 'Failed to delete book' });
    }
});

// ============ EXERCISES ROUTES ============

// Get all exercises for a class
router.get('/:id/exercises', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        // @ts-ignore
        const userId = req.user.id;
        // @ts-ignore
        const role = req.user.role;

        // For students, only show published exercises
        const whereClause = role === 'STUDENT' 
            ? { classId: id, isPublished: true }
            : { classId: id };

        const exercises = await prisma.classExercise.findMany({
            where: whereClause,
            orderBy: { order: 'asc' },
            include: {
                attempts: role === 'STUDENT' ? {
                    where: { studentId: userId },
                    select: { isCorrect: true, score: true, createdAt: true }
                } : {
                    select: { id: true, isCorrect: true }
                }
            }
        });

        res.json(exercises);
    } catch (error) {
        console.error('Get exercises error:', error);
        res.status(500).json({ error: 'Failed to fetch exercises' });
    }
});

// Get single exercise with details
router.get('/:id/exercises/:exerciseId', authMiddleware, async (req, res) => {
    try {
        const { exerciseId } = req.params;
        // @ts-ignore
        const userId = req.user.id;
        // @ts-ignore
        const role = req.user.role;

        const exercise = await prisma.classExercise.findUnique({
            where: { id: exerciseId },
            include: {
                attempts: role === 'STUDENT' ? {
                    where: { studentId: userId },
                    select: { isCorrect: true, score: true, answer: true, createdAt: true }
                } : {
                    include: { student: { select: { name: true } } }
                }
            }
        });

        if (!exercise) {
            return res.status(404).json({ error: 'Exercise not found' });
        }

        // For students on unpublished exercises
        if (role === 'STUDENT' && !exercise.isPublished) {
            return res.status(403).json({ error: 'Exercise not available' });
        }

        res.json(exercise);
    } catch (error) {
        console.error('Get exercise error:', error);
        res.status(500).json({ error: 'Failed to fetch exercise' });
    }
});

// Create exercise (Teacher only)
router.post('/:id/exercises', authMiddleware, requireRole('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            title, description, instructions, exerciseType, difficulty, points,
            hasTimer, timerMinutes, canvasState, canvasMode,
            answerType, correctAnswer, options, isPublished, order
        } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const exercise = await prisma.classExercise.create({
            data: {
                classId: id,
                title,
                description,
                instructions,
                exerciseType: exerciseType || 'geometry',
                difficulty: difficulty || 'medium',
                points: points || 10,
                hasTimer: hasTimer || false,
                timerMinutes,
                canvasState,
                canvasMode: canvasMode || 'readonly',
                answerType: answerType || 'multiple_choice',
                correctAnswer,
                options,
                isPublished: isPublished || false,
                order: order || 0
            }
        });

        res.status(201).json(exercise);
    } catch (error) {
        console.error('Create exercise error:', error);
        res.status(500).json({ error: 'Failed to create exercise' });
    }
});

// Update exercise (Teacher only)
router.put('/:id/exercises/:exerciseId', authMiddleware, requireRole('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const { exerciseId } = req.params;
        const { 
            title, description, instructions, exerciseType, difficulty, points,
            hasTimer, timerMinutes, canvasState, canvasMode,
            answerType, correctAnswer, options, isPublished, order
        } = req.body;

        const exercise = await prisma.classExercise.update({
            where: { id: exerciseId },
            data: {
                ...(title && { title }),
                ...(description !== undefined && { description }),
                ...(instructions !== undefined && { instructions }),
                ...(exerciseType && { exerciseType }),
                ...(difficulty && { difficulty }),
                ...(points !== undefined && { points }),
                ...(hasTimer !== undefined && { hasTimer }),
                ...(timerMinutes !== undefined && { timerMinutes }),
                ...(canvasState !== undefined && { canvasState }),
                ...(canvasMode && { canvasMode }),
                ...(answerType && { answerType }),
                ...(correctAnswer !== undefined && { correctAnswer }),
                ...(options !== undefined && { options }),
                ...(isPublished !== undefined && { isPublished }),
                ...(order !== undefined && { order })
            }
        });

        res.json(exercise);
    } catch (error) {
        console.error('Update exercise error:', error);
        res.status(500).json({ error: 'Failed to update exercise' });
    }
});

// Delete exercise (Teacher only)
router.delete('/:id/exercises/:exerciseId', authMiddleware, requireRole('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const { exerciseId } = req.params;
        await prisma.classExercise.delete({ where: { id: exerciseId } });
        res.json({ message: 'Exercise deleted successfully' });
    } catch (error) {
        console.error('Delete exercise error:', error);
        res.status(500).json({ error: 'Failed to delete exercise' });
    }
});

// Submit exercise attempt (Student only)
router.post('/:id/exercises/:exerciseId/attempt', authMiddleware, async (req, res) => {
    try {
        const { exerciseId } = req.params;
        // @ts-ignore
        const studentId = req.user.id;
        const { answer, canvasData, timeSpent } = req.body;

        // Get the exercise
        const exercise = await prisma.classExercise.findUnique({
            where: { id: exerciseId }
        });

        if (!exercise || !exercise.isPublished) {
            return res.status(404).json({ error: 'Exercise not found' });
        }

        // Check if already attempted
        const existingAttempt = await prisma.exerciseAttempt.findUnique({
            where: {
                studentId_exerciseId: { studentId, exerciseId }
            }
        });

        if (existingAttempt) {
            return res.status(400).json({ error: 'Already attempted', attempt: existingAttempt });
        }

        // Calculate if correct
        let isCorrect = false;
        let score = 0;

        if (exercise.answerType === 'multiple_choice' && exercise.correctAnswer) {
            try {
                const correct = JSON.parse(exercise.correctAnswer);
                isCorrect = answer === correct.id || answer === correct;
                score = isCorrect ? exercise.points : 0;
            } catch (e) {
                isCorrect = answer === exercise.correctAnswer;
                score = isCorrect ? exercise.points : 0;
            }
        } else if (exercise.answerType === 'numeric' && exercise.correctAnswer) {
            try {
                const correct = JSON.parse(exercise.correctAnswer);
                const tolerance = correct.tolerance || 0;
                const numAnswer = parseFloat(answer);
                isCorrect = Math.abs(numAnswer - correct.value) <= tolerance;
                score = isCorrect ? exercise.points : 0;
            } catch (e) {
                isCorrect = parseFloat(answer) === parseFloat(exercise.correctAnswer);
                score = isCorrect ? exercise.points : 0;
            }
        } else if (exercise.answerType === 'canvas') {
            // Canvas answers need manual grading or specific validation
            isCorrect = false; // Will be graded by teacher
            score = 0;
        }

        // Create attempt
        const attempt = await prisma.exerciseAttempt.create({
            data: {
                studentId,
                exerciseId,
                answer: JSON.stringify(answer),
                canvasData,
                isCorrect,
                score,
                timeSpent: timeSpent || 0
            }
        });

        // Update student XP if correct
        if (isCorrect && score > 0) {
            await prisma.user.update({
                where: { id: studentId },
                data: { xp: { increment: score } }
            });
        }

        res.status(201).json({
            attempt,
            isCorrect,
            score,
            message: isCorrect ? 'Correct! Well done!' : 'Incorrect. Try again next time.'
        });
    } catch (error) {
        console.error('Submit attempt error:', error);
        res.status(500).json({ error: 'Failed to submit attempt' });
    }
});

export default router;

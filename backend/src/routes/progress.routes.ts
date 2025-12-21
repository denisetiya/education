import { Router } from 'express';
import prisma from '../utils/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Get user's reading history/progress
router.get('/history', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        const { limit = '20', status } = req.query;

        const progress = await prisma.progress.findMany({
            where: {
                userId,
                ...(status && { status: status as string })
            },
            include: {
                material: {
                    select: {
                        id: true,
                        title: true,
                        type: true,
                        category: true,
                        level: true,
                        grade: true,
                        semester: true
                    }
                }
            },
            orderBy: { updatedAt: 'desc' },
            take: parseInt(limit as string)
        });

        res.json(progress);
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ error: 'Failed to fetch reading history' });
    }
});

// Get comprehensive progress map for Learning Journey
router.get('/map', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        const progress = await prisma.progress.findMany({
            where: { userId },
            select: { materialId: true, status: true, score: true }
        });
        
        const progressMap = progress.reduce((acc, curr) => {
            acc[curr.materialId] = { status: curr.status, score: curr.score };
            return acc;
        }, {} as Record<string, { status: string; score: number | null }>);
        
        res.json(progressMap);
    } catch (error) {
        console.error('Get progress map error:', error);
        res.status(500).json({ error: 'Failed to fetch progress map' });
    }
});

// Get progress for a specific material
router.get('/material/:materialId', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        const { materialId } = req.params;

        const progress = await prisma.progress.findUnique({
            where: {
                userId_materialId: { userId, materialId }
            }
        });

        res.json(progress || { status: 'not_started', progress: 0, timeSpent: 0 });
    } catch (error) {
        console.error('Get material progress error:', error);
        res.status(500).json({ error: 'Failed to fetch progress' });
    }
});

// Start or update progress (when opening a material)
router.post('/start', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        const { materialId } = req.body;

        if (!materialId) {
            return res.status(400).json({ error: 'Material ID is required' });
        }

        // Check if material exists
        const material = await prisma.material.findUnique({
            where: { id: materialId }
        });

        if (!material) {
            return res.status(404).json({ error: 'Material not found' });
        }

        // Upsert progress
        const progress = await prisma.progress.upsert({
            where: {
                userId_materialId: { userId, materialId }
            },
            update: {
                // Just update the timestamp when re-opening
                updatedAt: new Date()
            },
            create: {
                userId,
                materialId,
                status: 'in_progress',
                timeSpent: 0
            }
        });

        res.json(progress);
    } catch (error) {
        console.error('Start progress error:', error);
        res.status(500).json({ error: 'Failed to start progress' });
    }
});

// Update progress (time spent, scroll position, etc.)
router.put('/update', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        const { materialId, timeSpent, progress: progressPercent } = req.body;

        if (!materialId) {
            return res.status(400).json({ error: 'Material ID is required' });
        }

        const updated = await prisma.progress.upsert({
            where: {
                userId_materialId: { userId, materialId }
            },
            update: {
                ...(timeSpent !== undefined && { timeSpent }),
                ...(progressPercent !== undefined && {
                    // If progress is provided but we don't have a progress field, 
                    // we can use it to determine status
                    status: progressPercent >= 100 ? 'completed' : 'in_progress'
                })
            },
            create: {
                userId,
                materialId,
                status: 'in_progress',
                timeSpent: timeSpent || 0
            }
        });

        res.json(updated);
    } catch (error) {
        console.error('Update progress error:', error);
        res.status(500).json({ error: 'Failed to update progress' });
    }
});

// Complete a material
router.post('/complete', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        const { materialId, timeSpent, score } = req.body;

        if (!materialId) {
            return res.status(400).json({ error: 'Material ID is required' });
        }

        const progress = await prisma.progress.upsert({
            where: {
                userId_materialId: { userId, materialId }
            },
            update: {
                status: 'completed',
                completedAt: new Date(),
                ...(timeSpent !== undefined && { timeSpent }),
                ...(score !== undefined && { score })
            },
            create: {
                userId,
                materialId,
                status: 'completed',
                completedAt: new Date(),
                timeSpent: timeSpent || 0,
                score: score || null
            }
        });

        // Give XP for completing material
        await prisma.user.update({
            where: { id: userId },
            data: {
                xp: { increment: 50 }
            }
        });

        res.json({
            progress,
            xpEarned: 50,
            message: 'Material completed! +50 XP'
        });
    } catch (error) {
        console.error('Complete progress error:', error);
        res.status(500).json({ error: 'Failed to complete material' });
    }
});

// Check if user passed a linked quiz
router.get('/quiz-passed/:materialId', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        const { materialId } = req.params;

        // Get the material to find its linked quiz
        const material = await prisma.material.findUnique({
            where: { id: materialId },
            include: {
                linkedQuiz: true
            }
        });

        if (!material) {
            return res.status(404).json({ error: 'Material not found' });
        }

        // If no linked quiz, return passed by default
        if (!material.linkedQuizId || !material.linkedQuiz) {
            return res.json({ 
                hasLinkedQuiz: false, 
                passed: true, 
                score: null,
                minPassingScore: null,
                quizTitle: null
            });
        }

        // Get user's progress on the linked quiz
        const quizProgress = await prisma.progress.findUnique({
            where: {
                userId_materialId: { userId, materialId: material.linkedQuizId }
            }
        });

        const minPassingScore = material.minPassingScore ?? 70;
        const userScore = quizProgress?.score ?? null;
        const passed = userScore !== null && userScore >= minPassingScore;

        res.json({
            hasLinkedQuiz: true,
            passed,
            score: userScore,
            minPassingScore,
            quizId: material.linkedQuizId,
            quizTitle: material.linkedQuiz.title,
            quizCompleted: quizProgress?.status === 'completed'
        });
    } catch (error) {
        console.error('Check quiz passed error:', error);
        res.status(500).json({ error: 'Failed to check quiz status' });
    }
});

export default router;

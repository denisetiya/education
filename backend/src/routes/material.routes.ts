import { Router } from 'express';
import prisma from '../utils/prisma';
import { authMiddleware, AuthRequest, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Get all materials (public)
router.get('/', async (req, res) => {
    try {
        const { category, type, grade, semester, search } = req.query;

        const materials = await prisma.material.findMany({
            where: {
                ...(category && { category: category as string }),
                ...(type && { type: type as string }),
                ...(grade && { grade: parseInt(grade as string) }),
                ...(semester && { semester: parseInt(semester as string) }),
                ...(search && {
                    title: { contains: search as string }
                })
            },
            include: {
                createdBy: { select: { name: true } },
                linkedQuiz: { select: { id: true, title: true, type: true } }
            },
            orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
        });
        res.json(materials);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch materials' });
    }
});

// Get all quiz materials (for linking dropdown)
router.get('/quizzes', async (_req, res) => {
    try {
        const quizzes = await prisma.material.findMany({
            where: { type: 'quiz' },
            select: {
                id: true,
                title: true,
                category: true,
                grade: true,
                semester: true
            },
            orderBy: { title: 'asc' }
        });
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch quizzes' });
    }
});

// Get material by ID
router.get('/:id', async (req, res) => {
    try {
        const material = await prisma.material.findUnique({
            where: { id: req.params.id },
            include: {
                createdBy: { select: { name: true } },
                linkedQuiz: { select: { id: true, title: true, type: true } }
            }
        });
        if (!material) return res.status(404).json({ error: 'Material not found' });
        res.json(material);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch material' });
    }
});

// Create material (Teacher/Admin only)
router.post('/', authMiddleware, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res) => {
    try {
        const { title, type, category, level, content, semester, grade, linkedQuizId, minPassingScore, order } = req.body;

        const material = await prisma.material.create({
            data: {
                title,
                type,
                category,
                level: level || 'Mudah',
                content,
                semester: semester || 1,
                grade: grade || 10,
                linkedQuizId: linkedQuizId || null,
                minPassingScore: minPassingScore ?? 70,
                order: order || null,
                createdById: req.user!.id
            }
        });
        res.status(201).json(material);
    } catch (error) {
        console.error('Create material error:', error);
        res.status(500).json({ error: 'Failed to create material' });
    }
});

// Update material
router.put('/:id', authMiddleware, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res) => {
    try {
        const { title, type, category, level, content, semester, grade, linkedQuizId, minPassingScore, order } = req.body;

        const material = await prisma.material.update({
            where: { id: req.params.id },
            data: { 
                title, 
                type, 
                category, 
                level, 
                content, 
                semester, 
                grade,
                linkedQuizId: linkedQuizId || null,
                minPassingScore: minPassingScore ?? undefined,
                order: order || null
            }
        });
        res.json(material);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update material' });
    }
});

// Delete material
router.delete('/:id', authMiddleware, requireRole('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        await prisma.material.delete({ where: { id: req.params.id } });
        res.json({ message: 'Material deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete material' });
    }
});

export default router;

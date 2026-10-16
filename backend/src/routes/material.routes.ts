import { Router } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { authMiddleware, AuthRequest, requireRole } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { duplicateMaterial, DuplicationError } from '../features/classes/duplication.service';

const router = Router();

const canManageMaterial = async (materialId: string, userId: string, role: string) => {
    if (role === 'ADMIN') {
        return true;
    }

    const material = await prisma.material.findUnique({
        where: { id: materialId },
        select: { createdById: true }
    });

    return material?.createdById === userId;
};

const canManageModule = async (moduleId: string, userId: string, role: string) => {
    if (role === 'ADMIN') {
        return true;
    }

    const module = await prisma.module.findUnique({
        where: { id: moduleId },
        select: { class: { select: { teacherId: true } }, createdById: true }
    });

    if (!module) {
        return false;
    }

    const classTeacherId = module.class?.teacherId ?? null;
    return classTeacherId === userId || module.createdById === userId;
};

const duplicateMaterialSchema = z.object({
    targetModuleId: z.string().trim().min(1, 'Modul tujuan wajib dipilih'),
    copyLinkedContent: z.boolean().optional()
});

router.get('/', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const user = req.user!;
        const { category, type, grade, semester, search } = req.query;

        const where: Record<string, unknown> = {};

        if (category) where.category = category as string;
        if (type) where.type = type as string;
        if (grade) where.grade = parseInt(grade as string, 10);
        if (semester) where.semester = parseInt(semester as string, 10);
        if (search) where.title = { contains: search as string };

        // Students see all materials, teachers see only their own
        if (user.role === 'TEACHER') {
            where.createdById = user.id;
        }

        const materials = await prisma.material.findMany({
            where,
            include: {
                createdBy: { select: { name: true } },
                linkedQuiz: { select: { id: true, title: true, type: true } },
                linkedExercise: {
                    select: {
                        id: true,
                        title: true,
                        exerciseType: true,
                        class: { select: { id: true, name: true } }
                    }
                }
            },
            orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
        });

        res.json(materials);
    } catch (error) {
        console.error('Get materials error:', error);
        res.status(500).json({ error: 'Failed to fetch materials' });
    }
});

router.get('/quizzes', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const user = req.user!;
        const where: Record<string, unknown> = { type: 'quiz' };

        if (user.role === 'TEACHER') {
            where.createdById = user.id;
        }

        const quizzes = await prisma.material.findMany({
            where,
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
        console.error('Get quizzes error:', error);
        res.status(500).json({ error: 'Failed to fetch quizzes' });
    }
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const material = await prisma.material.findUnique({
            where: { id: req.params.id },
            include: {
                createdBy: { select: { name: true } },
                linkedQuiz: { select: { id: true, title: true, type: true } },
                linkedExercise: {
                    select: {
                        id: true,
                        title: true,
                        exerciseType: true,
                        class: { select: { id: true, name: true } }
                    }
                }
            }
        });

        if (!material) {
            return res.status(404).json({ error: 'Material not found' });
        }

        res.json(material);
    } catch (error) {
        console.error('Get material error:', error);
        res.status(500).json({ error: 'Failed to fetch material' });
    }
});

router.post('/', authMiddleware, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res) => {
    try {
        const { title, type, category, level, content, semester, grade, linkedQuizId, linkedExerciseId, minPassingScore, order } = req.body;

        const material = await prisma.material.create({
            data: {
                title,
                type,
                category,
                level: level || 'Mudah',
                content,
                semester: semester || 1,
                grade: grade || 7,
                linkedQuizId: linkedQuizId || null,
                linkedExerciseId: linkedExerciseId || null,
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

router.put('/:id', authMiddleware, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res) => {
    try {
        const isAllowed = await canManageMaterial(req.params.id, req.user!.id, req.user!.role);
        if (!isAllowed) {
            return res.status(403).json({ error: 'Cannot update material owned by another teacher' });
        }

        const { title, type, category, level, content, semester, grade, linkedQuizId, linkedExerciseId, minPassingScore, order } = req.body;

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
                linkedExerciseId: linkedExerciseId || null,
                minPassingScore: minPassingScore ?? undefined,
                order: order || null
            }
        });

        res.json(material);
    } catch (error) {
        console.error('Update material error:', error);
        res.status(500).json({ error: 'Failed to update material' });
    }
});

// Duplicate material into another class module (Teacher/Admin only)
router.post('/:id/duplicate', authMiddleware, requireRole('TEACHER', 'ADMIN'), validateBody(duplicateMaterialSchema), async (req: AuthRequest, res) => {
    try {
        const isAllowed = await canManageMaterial(req.params.id, req.user!.id, req.user!.role);
        if (!isAllowed) {
            return res.status(403).json({ error: 'Cannot duplicate material owned by another teacher' });
        }

        const { targetModuleId, copyLinkedContent } = req.body as { targetModuleId: string; copyLinkedContent?: boolean };

        const moduleAllowed = await canManageModule(targetModuleId, req.user!.id, req.user!.role);
        if (!moduleAllowed) {
            return res.status(403).json({ error: 'Cannot add material to a module of another teacher' });
        }

        const duplicated = await duplicateMaterial(req.params.id, targetModuleId, copyLinkedContent !== false);

        res.status(201).json(duplicated);
    } catch (error) {
        if (error instanceof DuplicationError) {
            return res.status(error.status).json({ error: error.message });
        }

        console.error('Duplicate material error:', error);
        res.status(500).json({ error: 'Failed to duplicate material' });
    }
});

router.delete('/:id', authMiddleware, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res) => {
    try {
        const isAllowed = await canManageMaterial(req.params.id, req.user!.id, req.user!.role);
        if (!isAllowed) {
            return res.status(403).json({ error: 'Cannot delete material owned by another teacher' });
        }

        await prisma.material.delete({ where: { id: req.params.id } });
        res.json({ message: 'Material deleted' });
    } catch (error) {
        console.error('Delete material error:', error);
        res.status(500).json({ error: 'Failed to delete material' });
    }
});

export default router;

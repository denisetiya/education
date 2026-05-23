import { Router } from 'express';
import prisma from '../utils/prisma';
import { authMiddleware, AuthRequest, requireRole } from '../middleware/auth.middleware';

const router = Router();

const getRequestUser = (req: AuthRequest) => {
    if (!req.user) {
        throw new Error('Missing authenticated user');
    }

    return req.user;
};

// Get modules with materials
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const user = getRequestUser(req);
        const { grade, semester, subject } = req.query;

        const where: Record<string, unknown> = {};

        if (grade) where.grade = Number(grade);
        if (semester) where.semester = Number(semester);
        if (subject) where.subject = String(subject);

        if (user.role === 'TEACHER') {
            where.createdById = user.id;
        }

        const modules = await prisma.module.findMany({
            where,
            include: {
                materials: {
                    select: { id: true, title: true, type: true, moduleOrder: true, content: false },
                    orderBy: { moduleOrder: 'asc' }
                }
            },
            orderBy: { order: 'asc' }
        });
        res.json(modules);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch modules' });
    }
});

// Create module
router.post('/', authMiddleware, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res) => {
    try {
        const user = getRequestUser(req);
        const { title, description, grade, semester, subject, order } = req.body;
        const module = await prisma.module.create({
            data: { title, description, grade, semester, subject, order, createdById: user.id }
        });
        res.status(201).json(module);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create module' });
    }
});

// Reorder modules
router.put('/reorder', authMiddleware, requireRole('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const { orderedIds } = req.body; // Array of module IDs
        
        await prisma.$transaction(
            orderedIds.map((id: string, index: number) => 
                prisma.module.update({
                    where: { id },
                    data: { order: index }
                })
            )
        );
        res.json({ message: 'Modules reordered' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reorder modules' });
    }
});

// Update module details
router.put('/:id', authMiddleware, requireRole('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const { title, description, grade, semester, subject } = req.body;
        const module = await prisma.module.update({
            where: { id: req.params.id },
            data: { title, description, grade, semester, subject }
        });
        res.json(module);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update module' });
    }
});

// Assign materials to module and order them
router.post('/:id/materials', authMiddleware, requireRole('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const { materialIds } = req.body; // Array of material IDs in desired order
        
        // Update provided materials to this module with index
        await prisma.$transaction([
             ...materialIds.map((matId: string, index: number) => 
                prisma.material.update({
                    where: { id: matId },
                    data: { moduleId: req.params.id, moduleOrder: index }
                })
            )
        ]);
        
        res.json({ message: 'Materials updated in module' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update module materials' });
    }
});

// Remove material from module
router.delete('/:moduleId/materials/:materialId', authMiddleware, requireRole('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        await prisma.material.update({
             where: { id: req.params.materialId },
             data: { moduleId: null, moduleOrder: null }
        });
        res.json({ message: 'Material removed from module' });
    } catch (error) {
         res.status(500).json({ error: 'Failed to remove material' });
    }
});

// Assign module to class
router.put('/:id/assign-class', authMiddleware, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res) => {
    try {
        const { classId } = req.body; // classId can be null to unassign
        const user = getRequestUser(req);

        if (classId) {
            const targetClass = await prisma.class.findUnique({
                where: { id: classId },
                select: { teacherId: true }
            });

            if (!targetClass) {
                return res.status(404).json({ error: 'Class not found' });
            }

            if (user.role !== 'ADMIN' && targetClass.teacherId !== user.id) {
                return res.status(403).json({ error: 'Not authorized to manage this class' });
            }
        }

        const module = await prisma.module.update({
            where: { id: req.params.id },
            data: { classId: classId || null }
        });
        res.json(module);
    } catch (error) {
        res.status(500).json({ error: 'Failed to assign module to class' });
    }
});

// Get modules by class
router.get('/by-class/:classId', authMiddleware, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res) => {
    try {
        const user = getRequestUser(req);
        const targetClass = await prisma.class.findUnique({
            where: { id: req.params.classId },
            select: { teacherId: true }
        });

        if (!targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

        if (user.role !== 'ADMIN' && targetClass.teacherId !== user.id) {
            return res.status(403).json({ error: 'Not authorized to view these modules' });
        }

        const modules = await prisma.module.findMany({
            where: { classId: req.params.classId },
            include: {
                materials: {
                    select: { id: true, title: true, type: true, moduleOrder: true },
                    orderBy: { moduleOrder: 'asc' }
                }
            },
            orderBy: { order: 'asc' }
        });
        res.json(modules);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch class modules' });
    }
});

// Get unassigned modules (no classId)
router.get('/unassigned', authMiddleware, requireRole('TEACHER', 'ADMIN'), async (_req, res) => {
    try {
        const modules = await prisma.module.findMany({
            where: { classId: null },
            include: {
                materials: {
                    select: { id: true, title: true, type: true, moduleOrder: true },
                    orderBy: { moduleOrder: 'asc' }
                }
            },
            orderBy: { order: 'asc' }
        });
        res.json(modules);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch unassigned modules' });
    }
});

// Delete module
router.delete('/:id', authMiddleware, requireRole('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        // Unlink materials first
        await prisma.material.updateMany({
            where: { moduleId: req.params.id },
            data: { moduleId: null, moduleOrder: null }
        });
        
        await prisma.module.delete({ where: { id: req.params.id } });
        res.json({ message: 'Module deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete module' });
    }
});

export default router;

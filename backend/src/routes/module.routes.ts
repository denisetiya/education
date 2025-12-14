import { Router } from 'express';
import prisma from '../utils/prisma';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Get modules with materials
router.get('/', async (req, res) => {
    try {
        const { grade, semester, subject } = req.query;
        const modules = await prisma.module.findMany({
            where: {
                ...(grade && { grade: Number(grade) }),
                ...(semester && { semester: Number(semester) }),
                ...(subject && { subject: String(subject) })
            },
            include: {
                materials: {
                    select: { id: true, title: true, type: true, moduleOrder: true, content: false }, // Exclude heavy content
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
router.post('/', authMiddleware, requireRole('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const { title, description, grade, semester, subject, order } = req.body;
        const module = await prisma.module.create({
            data: { title, description, grade, semester, subject, order }
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

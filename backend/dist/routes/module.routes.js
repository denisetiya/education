"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../utils/prisma"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const getRequestUser = (req) => {
    if (!req.user) {
        throw new Error('Missing authenticated user');
    }
    return req.user;
};
// Get modules with materials
router.get('/', async (req, res) => {
    try {
        const { grade, semester, subject } = req.query;
        const modules = await prisma_1.default.module.findMany({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch modules' });
    }
});
// Create module
router.post('/', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const { title, description, grade, semester, subject, order } = req.body;
        const module = await prisma_1.default.module.create({
            data: { title, description, grade, semester, subject, order }
        });
        res.status(201).json(module);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create module' });
    }
});
// Reorder modules
router.put('/reorder', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const { orderedIds } = req.body; // Array of module IDs
        await prisma_1.default.$transaction(orderedIds.map((id, index) => prisma_1.default.module.update({
            where: { id },
            data: { order: index }
        })));
        res.json({ message: 'Modules reordered' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to reorder modules' });
    }
});
// Update module details
router.put('/:id', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const { title, description, grade, semester, subject } = req.body;
        const module = await prisma_1.default.module.update({
            where: { id: req.params.id },
            data: { title, description, grade, semester, subject }
        });
        res.json(module);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update module' });
    }
});
// Assign materials to module and order them
router.post('/:id/materials', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const { materialIds } = req.body; // Array of material IDs in desired order
        // Update provided materials to this module with index
        await prisma_1.default.$transaction([
            ...materialIds.map((matId, index) => prisma_1.default.material.update({
                where: { id: matId },
                data: { moduleId: req.params.id, moduleOrder: index }
            }))
        ]);
        res.json({ message: 'Materials updated in module' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update module materials' });
    }
});
// Remove material from module
router.delete('/:moduleId/materials/:materialId', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        await prisma_1.default.material.update({
            where: { id: req.params.materialId },
            data: { moduleId: null, moduleOrder: null }
        });
        res.json({ message: 'Material removed from module' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to remove material' });
    }
});
// Assign module to class
router.put('/:id/assign-class', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const { classId } = req.body; // classId can be null to unassign
        const user = getRequestUser(req);
        if (classId) {
            const targetClass = await prisma_1.default.class.findUnique({
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
        const module = await prisma_1.default.module.update({
            where: { id: req.params.id },
            data: { classId: classId || null }
        });
        res.json(module);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to assign module to class' });
    }
});
// Get modules by class
router.get('/by-class/:classId', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const user = getRequestUser(req);
        const targetClass = await prisma_1.default.class.findUnique({
            where: { id: req.params.classId },
            select: { teacherId: true }
        });
        if (!targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }
        if (user.role !== 'ADMIN' && targetClass.teacherId !== user.id) {
            return res.status(403).json({ error: 'Not authorized to view these modules' });
        }
        const modules = await prisma_1.default.module.findMany({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch class modules' });
    }
});
// Get unassigned modules (no classId)
router.get('/unassigned', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)('TEACHER', 'ADMIN'), async (_req, res) => {
    try {
        const modules = await prisma_1.default.module.findMany({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch unassigned modules' });
    }
});
// Delete module
router.delete('/:id', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        // Unlink materials first
        await prisma_1.default.material.updateMany({
            where: { moduleId: req.params.id },
            data: { moduleId: null, moduleOrder: null }
        });
        await prisma_1.default.module.delete({ where: { id: req.params.id } });
        res.json({ message: 'Module deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete module' });
    }
});
exports.default = router;
//# sourceMappingURL=module.routes.js.map
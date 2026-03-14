"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../utils/prisma"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const canManageMaterial = async (materialId, userId, role) => {
    if (role === 'ADMIN') {
        return true;
    }
    const material = await prisma_1.default.material.findUnique({
        where: { id: materialId },
        select: { createdById: true }
    });
    return material?.createdById === userId;
};
router.get('/', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const { category, type, grade, semester, search } = req.query;
        const materials = await prisma_1.default.material.findMany({
            where: {
                ...(category && { category: category }),
                ...(type && { type: type }),
                ...(grade && { grade: parseInt(grade, 10) }),
                ...(semester && { semester: parseInt(semester, 10) }),
                ...(search && {
                    title: { contains: search }
                })
            },
            include: {
                createdBy: { select: { name: true } },
                linkedQuiz: { select: { id: true, title: true, type: true } }
            },
            orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
        });
        res.json(materials);
    }
    catch (error) {
        console.error('Get materials error:', error);
        res.status(500).json({ error: 'Failed to fetch materials' });
    }
});
router.get('/quizzes', auth_middleware_1.authMiddleware, async (_req, res) => {
    try {
        const quizzes = await prisma_1.default.material.findMany({
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
    }
    catch (error) {
        console.error('Get quizzes error:', error);
        res.status(500).json({ error: 'Failed to fetch quizzes' });
    }
});
router.get('/:id', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const material = await prisma_1.default.material.findUnique({
            where: { id: req.params.id },
            include: {
                createdBy: { select: { name: true } },
                linkedQuiz: { select: { id: true, title: true, type: true } }
            }
        });
        if (!material) {
            return res.status(404).json({ error: 'Material not found' });
        }
        res.json(material);
    }
    catch (error) {
        console.error('Get material error:', error);
        res.status(500).json({ error: 'Failed to fetch material' });
    }
});
router.post('/', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const { title, type, category, level, content, semester, grade, linkedQuizId, minPassingScore, order } = req.body;
        const material = await prisma_1.default.material.create({
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
                createdById: req.user.id
            }
        });
        res.status(201).json(material);
    }
    catch (error) {
        console.error('Create material error:', error);
        res.status(500).json({ error: 'Failed to create material' });
    }
});
router.put('/:id', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const isAllowed = await canManageMaterial(req.params.id, req.user.id, req.user.role);
        if (!isAllowed) {
            return res.status(403).json({ error: 'Cannot update material owned by another teacher' });
        }
        const { title, type, category, level, content, semester, grade, linkedQuizId, minPassingScore, order } = req.body;
        const material = await prisma_1.default.material.update({
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
    }
    catch (error) {
        console.error('Update material error:', error);
        res.status(500).json({ error: 'Failed to update material' });
    }
});
router.delete('/:id', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const isAllowed = await canManageMaterial(req.params.id, req.user.id, req.user.role);
        if (!isAllowed) {
            return res.status(403).json({ error: 'Cannot delete material owned by another teacher' });
        }
        await prisma_1.default.material.delete({ where: { id: req.params.id } });
        res.json({ message: 'Material deleted' });
    }
    catch (error) {
        console.error('Delete material error:', error);
        res.status(500).json({ error: 'Failed to delete material' });
    }
});
exports.default = router;
//# sourceMappingURL=material.routes.js.map
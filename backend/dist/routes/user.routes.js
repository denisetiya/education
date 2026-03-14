"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../utils/prisma"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Get all users (Admin only)
router.get('/', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)('ADMIN'), async (req, res) => {
    try {
        const users = await prisma_1.default.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                xp: true,
                level: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});
// Get user by ID
router.get('/:id', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        if (req.user?.id !== req.params.id && req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Cannot view other users' });
        }
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.params.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                xp: true,
                level: true,
                streak: true,
                achievements: true
            }
        });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});
// Update user
router.put('/:id', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        // Users can only update themselves unless they're admin
        if (req.user?.id !== req.params.id && req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Cannot update other users' });
        }
        const { name, avatar } = req.body;
        const user = await prisma_1.default.user.update({
            where: { id: req.params.id },
            data: { name, avatar },
            select: { id: true, email: true, name: true, avatar: true }
        });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update user' });
    }
});
// Delete user (Admin only)
router.delete('/:id', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)('ADMIN'), async (req, res) => {
    try {
        await prisma_1.default.user.delete({ where: { id: req.params.id } });
        res.json({ message: 'User deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});
exports.default = router;
//# sourceMappingURL=user.routes.js.map
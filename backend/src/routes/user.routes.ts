import { Router } from 'express';
import prisma from '../utils/prisma';
import { authMiddleware, AuthRequest, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Get all users (Admin only)
router.get('/', authMiddleware, requireRole('ADMIN'), async (req, res) => {
    try {
        const users = await prisma.user.findMany({
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
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get user by ID
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
    try {
        if (req.user?.id !== req.params.id && req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Cannot view other users' });
        }

        const user = await prisma.user.findUnique({
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
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Update user
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
    try {
        // Users can only update themselves unless they're admin
        if (req.user?.id !== req.params.id && req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Cannot update other users' });
        }

        const { name, avatar } = req.body;
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: { name, avatar },
            select: { id: true, email: true, name: true, avatar: true }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Delete user (Admin only)
router.delete('/:id', authMiddleware, requireRole('ADMIN'), async (req, res) => {
    try {
        await prisma.user.delete({ where: { id: req.params.id } });
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

export default router;

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../utils/prisma';
import env from '../config/env';
import { authMiddleware, AuthRequest, requireRole } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';

const router = Router();

const createUserSchema = z.object({
    email: z.string().trim().email('Email tidak valid').transform(v => v.toLowerCase()),
    password: z.string().min(8, 'Password minimal 8 karakter').max(72, 'Password terlalu panjang'),
    name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(80, 'Nama terlalu panjang'),
    role: z.enum(['STUDENT', 'TEACHER'], { message: 'Role harus STUDENT atau TEACHER' })
});

// Create user (Admin only)
router.post('/', authMiddleware, requireRole('ADMIN'), validateBody(createUserSchema), async (req, res) => {
    try {
        const { email, password, name, role } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ error: 'Email sudah terdaftar' });
        }

        const hashedPassword = await bcrypt.hash(password, env.bcryptRounds);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true
            }
        });

        res.status(201).json({ message: 'User berhasil dibuat', user });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Gagal membuat user' });
    }
});

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

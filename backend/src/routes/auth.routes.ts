import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../utils/prisma';
import env from '../config/env';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { authRateLimitMiddleware } from '../middleware/security.middleware';
import { validateBody } from '../middleware/validation.middleware';
import {
    AppRole,
    authCookieOptions,
    clearAuthCookieOptions,
    sanitizeRoleForSelfRegistration,
    signAuthToken
} from '../utils/auth';

const router = Router();

const emailSchema = z
    .string()
    .trim()
    .email('Email tidak valid')
    .transform((value) => value.toLowerCase());

const passwordSchema = z
    .string()
    .min(8, 'Password minimal 8 karakter')
    .max(72, 'Password terlalu panjang')
    .regex(/[A-Za-z]/, 'Password harus mengandung huruf')
    .regex(/\d/, 'Password harus mengandung angka');

const registerSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(80, 'Nama terlalu panjang'),
    role: z.string().trim().optional()
});

const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password wajib diisi')
});

const safeUserSelect = {
    id: true,
    email: true,
    name: true,
    role: true,
    xp: true,
    level: true,
    streak: true,
    avatar: true
} as const;

const toAppRole = (role: string): AppRole => {
    if (role === 'ADMIN' || role === 'TEACHER') {
        return role;
    }

    return 'STUDENT';
};

router.post('/register', authRateLimitMiddleware, validateBody(registerSchema), async (req, res) => {
    try {
        const { email, password, name, role } = req.body;

        let assignedRole: ReturnType<typeof sanitizeRoleForSelfRegistration>;
        try {
            assignedRole = sanitizeRoleForSelfRegistration(role);
        } catch (error) {
            return res.status(403).json({ error: 'Self-registration hanya tersedia untuk akun siswa.' });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, env.bcryptRounds);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: assignedRole
            },
            select: safeUserSelect
        });

        const token = signAuthToken({ userId: user.id, role: toAppRole(user.role) });
        res.cookie(env.authCookieName, token, authCookieOptions);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

router.post('/login', authRateLimitMiddleware, validateBody(loginSchema), async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user || !user.password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = signAuthToken({ userId: user.id, role: toAppRole(user.role) });
        res.cookie(env.authCookieName, token, authCookieOptions);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                xp: user.xp,
                level: user.level,
                streak: user.streak,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

router.post('/logout', (_req, res) => {
    res.clearCookie(env.authCookieName, clearAuthCookieOptions);
    res.json({ message: 'Logged out successfully' });
});

router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: safeUserSelect
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
});

export default router;

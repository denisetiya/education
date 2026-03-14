"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../utils/prisma"));
const env_1 = __importDefault(require("../config/env"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const security_middleware_1 = require("../middleware/security.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const auth_1 = require("../utils/auth");
const router = (0, express_1.Router)();
const emailSchema = zod_1.z
    .string()
    .trim()
    .email('Email tidak valid')
    .transform((value) => value.toLowerCase());
const passwordSchema = zod_1.z
    .string()
    .min(8, 'Password minimal 8 karakter')
    .max(72, 'Password terlalu panjang')
    .regex(/[A-Za-z]/, 'Password harus mengandung huruf')
    .regex(/\d/, 'Password harus mengandung angka');
const registerSchema = zod_1.z.object({
    email: emailSchema,
    password: passwordSchema,
    name: zod_1.z.string().trim().min(2, 'Nama minimal 2 karakter').max(80, 'Nama terlalu panjang'),
    role: zod_1.z.string().trim().optional()
});
const loginSchema = zod_1.z.object({
    email: emailSchema,
    password: zod_1.z.string().min(1, 'Password wajib diisi')
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
};
const toAppRole = (role) => {
    if (role === 'ADMIN' || role === 'TEACHER') {
        return role;
    }
    return 'STUDENT';
};
router.post('/register', security_middleware_1.authRateLimitMiddleware, (0, validation_middleware_1.validateBody)(registerSchema), async (req, res) => {
    try {
        const { email, password, name, role } = req.body;
        let assignedRole;
        try {
            assignedRole = (0, auth_1.sanitizeRoleForSelfRegistration)(role);
        }
        catch (error) {
            return res.status(403).json({ error: 'Self-registration hanya tersedia untuk akun siswa.' });
        }
        const existingUser = await prisma_1.default.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            return res.status(409).json({ error: 'Email already registered' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, env_1.default.bcryptRounds);
        const user = await prisma_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: assignedRole
            },
            select: safeUserSelect
        });
        const token = (0, auth_1.signAuthToken)({ userId: user.id, role: toAppRole(user.role) });
        res.cookie(env_1.default.authCookieName, token, auth_1.authCookieOptions);
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user
        });
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});
router.post('/login', security_middleware_1.authRateLimitMiddleware, (0, validation_middleware_1.validateBody)(loginSchema), async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma_1.default.user.findUnique({
            where: { email }
        });
        if (!user || !user.password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = (0, auth_1.signAuthToken)({ userId: user.id, role: toAppRole(user.role) });
        res.cookie(env_1.default.authCookieName, token, auth_1.authCookieOptions);
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
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});
router.post('/logout', (_req, res) => {
    res.clearCookie(env_1.default.authCookieName, auth_1.clearAuthCookieOptions);
    res.json({ message: 'Logged out successfully' });
});
router.get('/me', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.user.id },
            select: safeUserSelect
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        console.error('Get current user error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map
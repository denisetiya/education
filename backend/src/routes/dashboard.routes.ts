import { Router } from 'express';
import prisma from '../utils/prisma';
import { authMiddleware, AuthRequest, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Student Dashboard Data
router.get('/student', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;

        // Get user with progress and achievements
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                achievements: true,
                progress: {
                    include: { material: true },
                    orderBy: { updatedAt: 'desc' },
                    take: 5
                }
            }
        });

        if (!user) return res.status(404).json({ error: 'User not found' });

        // Calculate stats
        const completedMaterials = await prisma.progress.count({
            where: { userId, status: 'completed' }
        });
        const totalMaterials = await prisma.material.count();
        const totalTimeSpent = await prisma.progress.aggregate({
            where: { userId },
            _sum: { timeSpent: true }
        });

        res.json({
            user: {
                id: user.id,
                name: user.name,
                xp: user.xp,
                level: user.level,
                streak: user.streak
            },
            stats: {
                completedMaterials,
                totalMaterials,
                totalTimeSpent: totalTimeSpent._sum.timeSpent || 0,
                badges: user.achievements.length
            },
            recentProgress: user.progress,
            achievements: user.achievements
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard' });
    }
});

// Teacher Dashboard Data
router.get('/teacher', authMiddleware, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res) => {
    try {
        const teacherId = req.user!.id;

        // Get teacher's classes
        const classes = await prisma.class.findMany({
            where: { teacherId },
            include: {
                _count: { select: { students: true } }
            }
        });

        // Get teacher's materials
        const materials = await prisma.material.findMany({
            where: { createdById: teacherId },
            take: 5,
            orderBy: { createdAt: 'desc' }
        });

        // Get total students (across all classes)
        const totalStudents = classes.reduce((sum: number, cls: typeof classes[number]) => sum + cls._count.students, 0);

        res.json({
            stats: {
                totalClasses: classes.length,
                totalStudents,
                totalMaterials: await prisma.material.count({ where: { createdById: teacherId } })
            },
            classes,
            recentMaterials: materials
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch teacher dashboard' });
    }
});

// Admin Dashboard Data
router.get('/admin', authMiddleware, requireRole('ADMIN'), async (req, res) => {
    try {
        const totalUsers = await prisma.user.count();
        const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
        const totalTeachers = await prisma.user.count({ where: { role: 'TEACHER' } });
        const totalMaterials = await prisma.material.count();

        const recentUsers = await prisma.user.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        });

        res.json({
            stats: {
                totalUsers,
                totalStudents,
                totalTeachers,
                totalMaterials
            },
            recentUsers
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch admin dashboard' });
    }
});

export default router;

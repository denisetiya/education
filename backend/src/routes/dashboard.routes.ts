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
        const [
            teacherClasses,
            recentClasses,
            totalMaterials,
            totalExercises,
            publishedExercises,
            totalPendingReviews,
            recentMaterials,
            pendingReviews,
            recentSubmissions
        ] = await Promise.all([
            prisma.class.findMany({
                where: { teacherId },
                include: {
                    _count: {
                        select: {
                            students: true,
                            modules: true,
                            exercises: true
                        }
                    }
                }
            }),
            prisma.class.findMany({
                where: { teacherId },
                orderBy: { updatedAt: 'desc' },
                take: 6,
                include: {
                    _count: {
                        select: {
                            students: true,
                            modules: true,
                            exercises: true
                        }
                    }
                }
            }),
            prisma.material.count({ where: { createdById: teacherId } }),
            prisma.classExercise.count({
                where: {
                    class: { teacherId }
                }
            }),
            prisma.classExercise.count({
                where: {
                    class: { teacherId },
                    isPublished: true
                }
            }),
            prisma.exerciseAttempt.count({
                where: {
                    gradingStatus: 'pending_review',
                    exercise: {
                        class: {
                            teacherId
                        }
                    }
                }
            }),
            prisma.material.findMany({
                where: { createdById: teacherId },
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    type: true,
                    category: true,
                    grade: true,
                    semester: true,
                    createdAt: true
                }
            }),
            prisma.exerciseAttempt.findMany({
                where: {
                    gradingStatus: 'pending_review',
                    exercise: {
                        class: {
                            teacherId
                        }
                    }
                },
                take: 8,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    createdAt: true,
                    exerciseId: true,
                    exercise: {
                        select: {
                            id: true,
                            title: true,
                            points: true,
                            class: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    },
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            }),
            prisma.exerciseAttempt.findMany({
                where: {
                    exercise: {
                        class: {
                            teacherId
                        }
                    }
                },
                take: 8,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    createdAt: true,
                    gradingStatus: true,
                    score: true,
                    exercise: {
                        select: {
                            id: true,
                            title: true,
                            class: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    },
                    student: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            })
        ]);

        const totalStudents = teacherClasses.reduce((sum: number, cls: typeof teacherClasses[number]) => sum + cls._count.students, 0);

        res.json({
            stats: {
                totalClasses: teacherClasses.length,
                totalStudents,
                totalMaterials,
                totalExercises,
                publishedExercises,
                pendingReviews: totalPendingReviews
            },
            classes: recentClasses,
            recentMaterials,
            pendingReviews,
            recentSubmissions
        });
    } catch (error) {
        console.error('Teacher dashboard error:', error);
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

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../utils/prisma"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Student Dashboard Data
router.get('/student', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        // Get user with progress and achievements
        const user = await prisma_1.default.user.findUnique({
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
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        // Calculate stats
        const completedMaterials = await prisma_1.default.progress.count({
            where: { userId, status: 'completed' }
        });
        const totalMaterials = await prisma_1.default.material.count();
        const totalTimeSpent = await prisma_1.default.progress.aggregate({
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
    }
    catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard' });
    }
});
// Teacher Dashboard Data
router.get('/teacher', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const teacherId = req.user.id;
        const [teacherClasses, recentClasses, totalMaterials, totalExercises, publishedExercises, totalPendingReviews, recentMaterials, pendingReviews, recentSubmissions] = await Promise.all([
            prisma_1.default.class.findMany({
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
            prisma_1.default.class.findMany({
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
            prisma_1.default.material.count({ where: { createdById: teacherId } }),
            prisma_1.default.classExercise.count({
                where: {
                    class: { teacherId }
                }
            }),
            prisma_1.default.classExercise.count({
                where: {
                    class: { teacherId },
                    isPublished: true
                }
            }),
            prisma_1.default.exerciseAttempt.count({
                where: {
                    gradingStatus: 'pending_review',
                    exercise: {
                        class: {
                            teacherId
                        }
                    }
                }
            }),
            prisma_1.default.material.findMany({
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
            prisma_1.default.exerciseAttempt.findMany({
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
            prisma_1.default.exerciseAttempt.findMany({
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
        const totalStudents = teacherClasses.reduce((sum, cls) => sum + cls._count.students, 0);
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
    }
    catch (error) {
        console.error('Teacher dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch teacher dashboard' });
    }
});
// Admin Dashboard Data
router.get('/admin', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)('ADMIN'), async (req, res) => {
    try {
        const totalUsers = await prisma_1.default.user.count();
        const totalStudents = await prisma_1.default.user.count({ where: { role: 'STUDENT' } });
        const totalTeachers = await prisma_1.default.user.count({ where: { role: 'TEACHER' } });
        const totalMaterials = await prisma_1.default.material.count();
        const recentUsers = await prisma_1.default.user.findMany({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch admin dashboard' });
    }
});
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map
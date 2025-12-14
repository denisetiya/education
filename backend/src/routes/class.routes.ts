import { Router } from 'express';
import prisma from '../utils/prisma';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Helper to generate unique class code
const generateClassCode = async (): Promise<string> => {
    let code = '';
    let exists = true;
    while (exists) {
        code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const existingClass = await prisma.class.findUnique({ where: { code } });
        if (!existingClass) exists = false;
    }
    return code;
};

// Create a new class (Teacher only)
router.post('/', authMiddleware, requireRole('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const { name, subject, description } = req.body;
        const code = await generateClassCode();
        // @ts-ignore - req.user is added by authMiddleware
        const teacherId = req.user.id; 

        const newClass = await prisma.class.create({
            data: {
                name,
                subject,
                description,
                code,
                teacherId
            }
        });
        res.status(201).json(newClass);
    } catch (error) {
        console.error('Create class error:', error);
        res.status(500).json({ error: 'Failed to create class' });
    }
});

// List classes (Role based)
router.get('/', authMiddleware, async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        // @ts-ignore
        const role = req.user.role;

        let classes;
        if (role === 'TEACHER' || role === 'ADMIN') {
            // Get created classes
            classes = await prisma.class.findMany({
                where: { teacherId: userId },
                include: { _count: { select: { students: true, modules: true } } },
                orderBy: { createdAt: 'desc' }
            });
        } else {
            // Get enrolled classes
            classes = await prisma.class.findMany({
                where: {
                    students: {
                        some: { studentId: userId }
                    }
                },
                include: { teacher: { select: { name: true } }, _count: { select: { modules: true } } },
                orderBy: { createdAt: 'desc' }
            });
        }
        res.json(classes);
    } catch (error) {
        console.error('Get classes error:', error);
        res.status(500).json({ error: 'Failed to fetch classes' });
    }
});

// Get Class Details (including modules)
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        // @ts-ignore
        const userId = req.user.id;

        const classDetail = await prisma.class.findUnique({
            where: { id },
            include: {
                modules: {
                    include: {
                        materials: {
                            select: { id: true, title: true, type: true, moduleOrder: true },
                            orderBy: { moduleOrder: 'asc' }
                        }
                    },
                    orderBy: { order: 'asc' }
                },
                teacher: { select: { id: true, name: true } }
            }
        });

        if (!classDetail) {
            return res.status(404).json({ error: 'Class not found' });
        }

        // Security check: User must be teacher of class OR enrolled student
        const isTeacher = classDetail.teacherId === userId;
        let isEnrolled = false;

        if (!isTeacher) {
            const enrollment = await prisma.classEnrollment.findUnique({
                where: {
                    studentId_classId: {
                        studentId: userId,
                        classId: id
                    }
                }
            });
            isEnrolled = !!enrollment;
        }

        if (!isTeacher && !isEnrolled) {
            return res.status(403).json({ error: 'Not authorized to view this class' });
        }

        res.json(classDetail);
    } catch (error) {
        console.error('Get class detail error:', error);
        res.status(500).json({ error: 'Failed to fetch class details' });
    }
});

// Join Class (Student)
router.post('/join', authMiddleware, async (req, res) => {
    try {
        const { code } = req.body;
        // @ts-ignore
        const userId = req.user.id;

        if (!code) {
            return res.status(400).json({ error: 'Code is required' });
        }

        const targetClass = await prisma.class.findUnique({
            where: { code }
        });

        if (!targetClass) {
            return res.status(404).json({ error: 'Invalid class code' });
        }

        if (targetClass.teacherId === userId) {
            return res.status(400).json({ error: 'Teachers cannot join their own class as a student' });
        }

        // Check if already enrolled
        const existingEnrollment = await prisma.classEnrollment.findUnique({
             where: {
                studentId_classId: {
                    studentId: userId,
                    classId: targetClass.id
                }
            }
        });

        if (existingEnrollment) {
            return res.status(400).json({ error: 'Already enrolled in this class' });
        }

        await prisma.classEnrollment.create({
            data: {
                studentId: userId,
                classId: targetClass.id
            }
        });

        res.json({ message: 'Successfully joined class', classId: targetClass.id });

    } catch (error) {
        console.error('Join class error:', error);
        res.status(500).json({ error: 'Failed to join class' });
    }
});

export default router;

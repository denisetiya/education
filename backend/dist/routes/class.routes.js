"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../utils/prisma"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const classDetailInclude = {
    teacher: { select: { id: true, name: true } },
    modules: {
        include: {
            materials: {
                select: { id: true, title: true, type: true, moduleOrder: true },
                orderBy: { moduleOrder: 'asc' }
            }
        },
        orderBy: { order: 'asc' }
    },
    students: {
        select: {
            joinedAt: true,
            student: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        },
        orderBy: { joinedAt: 'desc' }
    },
    _count: {
        select: {
            students: true,
            modules: true
        }
    }
};
const classDashboardInclude = {
    teacher: { select: { name: true } },
    modules: {
        include: {
            materials: {
                select: { id: true, title: true, type: true, moduleOrder: true },
                orderBy: { moduleOrder: 'asc' }
            }
        },
        orderBy: { order: 'asc' }
    },
    achievements: true,
    _count: { select: { students: true } }
};
const generateClassCode = async () => {
    let code = '';
    let exists = true;
    while (exists) {
        code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const existingClass = await prisma_1.default.class.findUnique({ where: { code } });
        exists = Boolean(existingClass);
    }
    return code;
};
const normalizeClassCode = (code) => code.trim().toUpperCase();
const getRequestUser = (req) => {
    if (!req.user) {
        throw new Error('Missing authenticated user');
    }
    return req.user;
};
const getClassAccess = async (classId, userId, role) => {
    const targetClass = await prisma_1.default.class.findUnique({
        where: { id: classId },
        select: { id: true, teacherId: true }
    });
    if (!targetClass) {
        return {
            targetClass: null,
            isAdmin: role === 'ADMIN',
            isTeacher: false,
            isEnrolled: false
        };
    }
    const isAdmin = role === 'ADMIN';
    const isTeacher = targetClass.teacherId === userId;
    let isEnrolled = false;
    if (!isAdmin && !isTeacher) {
        const enrollment = await prisma_1.default.classEnrollment.findUnique({
            where: {
                studentId_classId: {
                    studentId: userId,
                    classId
                }
            }
        });
        isEnrolled = Boolean(enrollment);
    }
    return {
        targetClass,
        isAdmin,
        isTeacher,
        isEnrolled
    };
};
const canAccessClass = (access) => access.isAdmin || access.isTeacher || access.isEnrolled;
const canManageClass = (access) => access.isAdmin || access.isTeacher;
const EXERCISE_STATUS_GRADED = 'graded';
const EXERCISE_STATUS_PENDING_REVIEW = 'pending_review';
const clampScore = (value, min, max) => Math.min(Math.max(value, min), max);
const sanitizeExerciseOptionsForStudent = (options) => {
    if (!options) {
        return options;
    }
    try {
        const parsed = JSON.parse(options);
        if (!Array.isArray(parsed)) {
            return options;
        }
        return JSON.stringify(parsed.map((option) => ({
            id: option.id,
            text: option.text
        })));
    }
    catch (error) {
        return options;
    }
};
const sanitizeExerciseForStudent = (exercise) => {
    const sanitizedExercise = {
        ...exercise,
        options: sanitizeExerciseOptionsForStudent(exercise.options ?? null)
    };
    delete sanitizedExercise.correctAnswer;
    return sanitizedExercise;
};
// Create a new class (Teacher only)
router.post('/', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const { name, subject, description } = req.body;
        if (!name || !String(name).trim()) {
            return res.status(400).json({ error: 'Class name is required' });
        }
        const code = await generateClassCode();
        const user = getRequestUser(req);
        const newClass = await prisma_1.default.class.create({
            data: {
                name: String(name).trim(),
                subject: String(subject || 'Umum').trim() || 'Umum',
                description: description ? String(description).trim() : null,
                code,
                teacherId: user.id
            }
        });
        res.status(201).json(newClass);
    }
    catch (error) {
        console.error('Create class error:', error);
        res.status(500).json({ error: 'Failed to create class' });
    }
});
// List classes (Role based)
router.get('/', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const user = getRequestUser(req);
        let classes;
        if (user.role === 'ADMIN') {
            classes = await prisma_1.default.class.findMany({
                include: {
                    teacher: { select: { name: true } },
                    _count: { select: { modules: true, students: true } }
                },
                orderBy: { createdAt: 'desc' }
            });
        }
        else if (user.role === 'TEACHER') {
            classes = await prisma_1.default.class.findMany({
                where: { teacherId: user.id },
                include: {
                    teacher: { select: { name: true } },
                    _count: { select: { modules: true, students: true } }
                },
                orderBy: { createdAt: 'desc' }
            });
        }
        else {
            classes = await prisma_1.default.class.findMany({
                where: {
                    students: {
                        some: { studentId: user.id }
                    }
                },
                include: {
                    teacher: { select: { name: true } },
                    _count: { select: { modules: true, students: true } }
                },
                orderBy: { createdAt: 'desc' }
            });
        }
        res.json(classes);
    }
    catch (error) {
        console.error('Get classes error:', error);
        res.status(500).json({ error: 'Failed to fetch classes' });
    }
});
// Join Class (Student)
router.post('/join', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)('STUDENT'), async (req, res) => {
    try {
        const { code } = req.body;
        const user = getRequestUser(req);
        if (!code || !String(code).trim()) {
            return res.status(400).json({ error: 'Code is required' });
        }
        const normalizedCode = normalizeClassCode(String(code));
        const targetClass = await prisma_1.default.class.findUnique({
            where: { code: normalizedCode }
        });
        if (!targetClass) {
            return res.status(404).json({ error: 'Invalid class code' });
        }
        const existingEnrollment = await prisma_1.default.classEnrollment.findUnique({
            where: {
                studentId_classId: {
                    studentId: user.id,
                    classId: targetClass.id
                }
            }
        });
        if (existingEnrollment) {
            return res.status(400).json({ error: 'Already enrolled in this class' });
        }
        await prisma_1.default.classEnrollment.create({
            data: {
                studentId: user.id,
                classId: targetClass.id
            }
        });
        res.json({
            message: 'Successfully joined class',
            classId: targetClass.id,
            className: targetClass.name
        });
    }
    catch (error) {
        console.error('Join class error:', error);
        res.status(500).json({ error: 'Failed to join class' });
    }
});
// List public classes for discovery
router.get('/public/discover', async (req, res) => {
    try {
        const { search, subject } = req.query;
        const where = { isPublic: true };
        if (search) {
            where.OR = [
                { name: { contains: String(search) } },
                { description: { contains: String(search) } }
            ];
        }
        if (subject) {
            where.subject = String(subject);
        }
        const classes = await prisma_1.default.class.findMany({
            where,
            select: {
                id: true,
                name: true,
                code: true,
                subject: true,
                description: true,
                thumbnail: true,
                progressionMode: true,
                teacher: { select: { name: true } },
                _count: { select: { students: true, modules: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(classes);
    }
    catch (error) {
        console.error('Get public classes error:', error);
        res.status(500).json({ error: 'Failed to fetch public classes' });
    }
});
// Preview public class before joining
router.get('/public/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const classDetail = await prisma_1.default.class.findFirst({
            where: { id, isPublic: true },
            select: {
                id: true,
                name: true,
                subject: true,
                description: true,
                thumbnail: true,
                progressionMode: true,
                code: true,
                teacher: { select: { name: true } },
                _count: { select: { students: true, modules: true } },
                modules: {
                    select: { id: true, title: true, order: true },
                    orderBy: { order: 'asc' }
                }
            }
        });
        if (!classDetail) {
            return res.status(404).json({ error: 'Class not found or not public' });
        }
        res.json(classDetail);
    }
    catch (error) {
        console.error('Get public class detail error:', error);
        res.status(500).json({ error: 'Failed to fetch class details' });
    }
});
// Get Class Details
router.get('/:id', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const user = getRequestUser(req);
        const access = await getClassAccess(id, user.id, user.role);
        if (!access.targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }
        if (!canAccessClass(access)) {
            return res.status(403).json({ error: 'Not authorized to view this class' });
        }
        const classDetail = await prisma_1.default.class.findUnique({
            where: { id },
            include: classDetailInclude
        });
        if (!classDetail) {
            return res.status(404).json({ error: 'Class not found' });
        }
        if (canManageClass(access)) {
            return res.json(classDetail);
        }
        const { students, ...studentView } = classDetail;
        res.json(studentView);
    }
    catch (error) {
        console.error('Get class detail error:', error);
        res.status(500).json({ error: 'Failed to fetch class details' });
    }
});
// Class settings (Teacher only)
router.put('/:id/settings', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;
        const { isPublic, progressionMode, thumbnail, xpMultiplier, geogebraEnabled } = req.body;
        const user = getRequestUser(req);
        const access = await getClassAccess(id, user.id, user.role);
        if (!access.targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }
        if (!canManageClass(access)) {
            return res.status(403).json({ error: 'Not authorized to modify this class' });
        }
        const updated = await prisma_1.default.class.update({
            where: { id },
            data: {
                ...(isPublic !== undefined && { isPublic: Boolean(isPublic) }),
                ...(progressionMode !== undefined && { progressionMode }),
                ...(thumbnail !== undefined && { thumbnail }),
                ...(xpMultiplier !== undefined && { xpMultiplier: Number(xpMultiplier) }),
                ...(geogebraEnabled !== undefined && { geogebraEnabled: Boolean(geogebraEnabled) })
            }
        });
        res.json(updated);
    }
    catch (error) {
        console.error('Update class settings error:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});
// Class dashboard
router.get('/:id/dashboard', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const user = getRequestUser(req);
        const access = await getClassAccess(id, user.id, user.role);
        if (!access.targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }
        if (!canAccessClass(access)) {
            return res.status(403).json({ error: 'Not authorized to view this dashboard' });
        }
        const classData = await prisma_1.default.class.findUnique({
            where: { id },
            include: classDashboardInclude
        });
        if (!classData) {
            return res.status(404).json({ error: 'Class not found' });
        }
        const materialIds = classData.modules.flatMap((module) => module.materials.map((material) => material.id));
        const progress = access.isEnrolled
            ? await prisma_1.default.progress.findMany({
                where: {
                    userId: user.id,
                    materialId: { in: materialIds }
                }
            })
            : [];
        const unlockedAchievements = access.isEnrolled
            ? await prisma_1.default.studentClassAchievement.findMany({
                where: {
                    studentId: user.id,
                    achievement: { classId: id }
                },
                include: { achievement: true }
            })
            : [];
        const totalMaterials = materialIds.length;
        const completedMaterials = progress.filter((item) => item.status === 'completed').length;
        const totalXP = progress
            .filter((item) => item.status === 'completed')
            .reduce((sum, item) => sum + (item.score || 50) * (classData.xpMultiplier || 1), 0);
        res.json({
            class: classData,
            progress: {
                completed: completedMaterials,
                total: totalMaterials,
                percentage: totalMaterials > 0 ? Math.round((completedMaterials / totalMaterials) * 100) : 0,
                xp: Math.round(totalXP)
            },
            materialProgress: progress,
            achievements: {
                unlocked: unlockedAchievements,
                total: classData.achievements.length
            }
        });
    }
    catch (error) {
        console.error('Get class dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard' });
    }
});
// Create achievement (Teacher)
router.post('/:id/achievements', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, icon, xpReward, condition } = req.body;
        const user = getRequestUser(req);
        const access = await getClassAccess(id, user.id, user.role);
        if (!access.targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }
        if (!canManageClass(access)) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        if (!title || !description || !condition) {
            return res.status(400).json({ error: 'Title, description, and condition are required' });
        }
        const achievement = await prisma_1.default.classAchievement.create({
            data: {
                title,
                description,
                icon: icon || 'trophy',
                xpReward: xpReward || 50,
                condition: typeof condition === 'string' ? condition : JSON.stringify(condition),
                classId: id
            }
        });
        res.status(201).json(achievement);
    }
    catch (error) {
        console.error('Create achievement error:', error);
        res.status(500).json({ error: 'Failed to create achievement' });
    }
});
// List achievements for class
router.get('/:id/achievements', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const user = getRequestUser(req);
        const access = await getClassAccess(id, user.id, user.role);
        if (!access.targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }
        if (!canAccessClass(access)) {
            return res.status(403).json({ error: 'Not authorized to view achievements for this class' });
        }
        const achievements = await prisma_1.default.classAchievement.findMany({
            where: { classId: id },
            include: {
                unlockedBy: {
                    where: { studentId: user.id },
                    select: { unlockedAt: true }
                }
            }
        });
        const formatted = achievements.map((achievement) => ({
            ...achievement,
            unlocked: achievement.unlockedBy.length > 0,
            unlockedAt: achievement.unlockedBy[0]?.unlockedAt || null
        }));
        res.json(formatted);
    }
    catch (error) {
        console.error('Get achievements error:', error);
        res.status(500).json({ error: 'Failed to fetch achievements' });
    }
});
// Claim/check achievement (Student)
router.post('/:id/achievements/:achId/claim', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)('STUDENT'), async (req, res) => {
    try {
        const { id, achId } = req.params;
        const user = getRequestUser(req);
        const access = await getClassAccess(id, user.id, user.role);
        if (!access.targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }
        if (!access.isEnrolled) {
            return res.status(403).json({ error: 'Only enrolled students can claim achievements' });
        }
        const achievement = await prisma_1.default.classAchievement.findFirst({
            where: { id: achId, classId: id }
        });
        if (!achievement) {
            return res.status(404).json({ error: 'Achievement not found' });
        }
        const existing = await prisma_1.default.studentClassAchievement.findUnique({
            where: {
                studentId_achievementId: {
                    studentId: user.id,
                    achievementId: achId
                }
            }
        });
        if (existing) {
            return res.status(400).json({ error: 'Achievement already unlocked' });
        }
        let condition;
        try {
            condition = JSON.parse(achievement.condition);
        }
        catch (parseError) {
            return res.status(400).json({ error: 'Achievement condition is invalid' });
        }
        let conditionMet = false;
        const classModules = await prisma_1.default.module.findMany({
            where: { classId: id },
            include: { materials: true }
        });
        const materialIds = classModules.flatMap((module) => module.materials.map((material) => material.id));
        if (condition.type === 'complete_materials') {
            const completed = await prisma_1.default.progress.count({
                where: {
                    userId: user.id,
                    materialId: { in: materialIds },
                    status: 'completed'
                }
            });
            conditionMet = completed >= (condition.target || 0);
        }
        else if (condition.type === 'quiz_score') {
            const quizzes = await prisma_1.default.progress.findMany({
                where: {
                    userId: user.id,
                    materialId: { in: materialIds },
                    status: 'completed',
                    score: { gte: condition.target || 0 }
                }
            });
            conditionMet = quizzes.length > 0;
        }
        else if (condition.type === 'complete_module') {
            let completedModules = 0;
            for (const module of classModules) {
                const moduleMaterialIds = module.materials.map((material) => material.id);
                if (moduleMaterialIds.length === 0) {
                    continue;
                }
                const completed = await prisma_1.default.progress.count({
                    where: {
                        userId: user.id,
                        materialId: { in: moduleMaterialIds },
                        status: 'completed'
                    }
                });
                if (completed === moduleMaterialIds.length) {
                    completedModules += 1;
                }
            }
            conditionMet = completedModules >= (condition.target || 0);
        }
        if (!conditionMet) {
            return res.status(400).json({ error: 'Achievement condition not met', condition });
        }
        await prisma_1.default.studentClassAchievement.create({
            data: {
                studentId: user.id,
                achievementId: achId
            }
        });
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: { xp: { increment: achievement.xpReward } }
        });
        res.json({
            message: 'Achievement unlocked!',
            achievement,
            xpAwarded: achievement.xpReward
        });
    }
    catch (error) {
        console.error('Claim achievement error:', error);
        res.status(500).json({ error: 'Failed to claim achievement' });
    }
});
// Get all books for a class
router.get('/:id/books', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const user = getRequestUser(req);
        const access = await getClassAccess(id, user.id, user.role);
        if (!access.targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }
        if (!canAccessClass(access)) {
            return res.status(403).json({ error: 'Not authorized to view class books' });
        }
        const books = await prisma_1.default.classBook.findMany({
            where: { classId: id },
            orderBy: { createdAt: 'desc' }
        });
        res.json(books);
    }
    catch (error) {
        console.error('Get books error:', error);
        res.status(500).json({ error: 'Failed to fetch books' });
    }
});
// Create a book (Teacher only)
router.post('/:id/books', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, author, description, coverUrl, contentType, content, pdfUrl } = req.body;
        const user = getRequestUser(req);
        const access = await getClassAccess(id, user.id, user.role);
        if (!access.targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }
        if (!canManageClass(access)) {
            return res.status(403).json({ error: 'Not authorized to manage books in this class' });
        }
        if (!title || !String(title).trim()) {
            return res.status(400).json({ error: 'Title is required' });
        }
        const book = await prisma_1.default.classBook.create({
            data: {
                classId: id,
                title: String(title).trim(),
                author,
                description,
                coverUrl,
                contentType: contentType || 'rich_text',
                content,
                pdfUrl
            }
        });
        res.status(201).json(book);
    }
    catch (error) {
        console.error('Create book error:', error);
        res.status(500).json({ error: 'Failed to create book' });
    }
});
// Update a book
router.put('/:id/books/:bookId', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const { id, bookId } = req.params;
        const { title, author, description, coverUrl, contentType, content, pdfUrl } = req.body;
        const user = getRequestUser(req);
        const access = await getClassAccess(id, user.id, user.role);
        if (!access.targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }
        if (!canManageClass(access)) {
            return res.status(403).json({ error: 'Not authorized to update books in this class' });
        }
        const existingBook = await prisma_1.default.classBook.findFirst({
            where: { id: bookId, classId: id }
        });
        if (!existingBook) {
            return res.status(404).json({ error: 'Book not found' });
        }
        const book = await prisma_1.default.classBook.update({
            where: { id: bookId },
            data: {
                ...(title !== undefined && { title }),
                ...(author !== undefined && { author }),
                ...(description !== undefined && { description }),
                ...(coverUrl !== undefined && { coverUrl }),
                ...(contentType !== undefined && { contentType }),
                ...(content !== undefined && { content }),
                ...(pdfUrl !== undefined && { pdfUrl })
            }
        });
        res.json(book);
    }
    catch (error) {
        console.error('Update book error:', error);
        res.status(500).json({ error: 'Failed to update book' });
    }
});
// Delete a book
router.delete('/:id/books/:bookId', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const { id, bookId } = req.params;
        const user = getRequestUser(req);
        const access = await getClassAccess(id, user.id, user.role);
        if (!access.targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }
        if (!canManageClass(access)) {
            return res.status(403).json({ error: 'Not authorized to delete books in this class' });
        }
        const existingBook = await prisma_1.default.classBook.findFirst({
            where: { id: bookId, classId: id }
        });
        if (!existingBook) {
            return res.status(404).json({ error: 'Book not found' });
        }
        await prisma_1.default.classBook.delete({ where: { id: bookId } });
        res.json({ message: 'Book deleted successfully' });
    }
    catch (error) {
        console.error('Delete book error:', error);
        res.status(500).json({ error: 'Failed to delete book' });
    }
});
// Get all exercises for a class
router.get('/:id/exercises', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const user = getRequestUser(req);
        const access = await getClassAccess(id, user.id, user.role);
        if (!access.targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }
        if (!canAccessClass(access)) {
            return res.status(403).json({ error: 'Not authorized to view class exercises' });
        }
        const whereClause = user.role === 'STUDENT'
            ? { classId: id, isPublished: true }
            : { classId: id };
        const exercises = await prisma_1.default.classExercise.findMany({
            where: whereClause,
            orderBy: { order: 'asc' },
            include: {
                attempts: user.role === 'STUDENT'
                    ? {
                        where: { studentId: user.id },
                        select: {
                            id: true,
                            isCorrect: true,
                            score: true,
                            createdAt: true,
                            gradingStatus: true,
                            feedback: true,
                            gradedAt: true,
                            timeSpent: true
                        }
                    }
                    : {
                        select: {
                            id: true,
                            isCorrect: true,
                            score: true,
                            gradingStatus: true,
                            createdAt: true
                        }
                    }
            }
        });
        if (user.role === 'STUDENT') {
            return res.json(exercises.map((exercise) => sanitizeExerciseForStudent(exercise)));
        }
        res.json(exercises);
    }
    catch (error) {
        console.error('Get exercises error:', error);
        res.status(500).json({ error: 'Failed to fetch exercises' });
    }
});
// Get single exercise with details
router.get('/:id/exercises/:exerciseId', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const { id, exerciseId } = req.params;
        const user = getRequestUser(req);
        const access = await getClassAccess(id, user.id, user.role);
        if (!access.targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }
        if (!canAccessClass(access)) {
            return res.status(403).json({ error: 'Not authorized to view this exercise' });
        }
        const exercise = await prisma_1.default.classExercise.findFirst({
            where: { id: exerciseId, classId: id },
            include: {
                attempts: user.role === 'STUDENT'
                    ? {
                        where: { studentId: user.id },
                        select: {
                            id: true,
                            isCorrect: true,
                            score: true,
                            answer: true,
                            canvasData: true,
                            timeSpent: true,
                            createdAt: true,
                            gradingStatus: true,
                            feedback: true,
                            gradedAt: true
                        }
                    }
                    : {
                        select: {
                            id: true,
                            answer: true,
                            canvasData: true,
                            isCorrect: true,
                            score: true,
                            timeSpent: true,
                            createdAt: true,
                            gradingStatus: true,
                            feedback: true,
                            gradedAt: true,
                            student: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true
                                }
                            }
                        }
                    }
            }
        });
        if (!exercise) {
            return res.status(404).json({ error: 'Exercise not found' });
        }
        if (user.role === 'STUDENT' && !exercise.isPublished) {
            return res.status(403).json({ error: 'Exercise not available' });
        }
        if (user.role === 'STUDENT') {
            return res.json(sanitizeExerciseForStudent(exercise));
        }
        res.json(exercise);
    }
    catch (error) {
        console.error('Get exercise error:', error);
        res.status(500).json({ error: 'Failed to fetch exercise' });
    }
});
// Create exercise (Teacher only)
router.post('/:id/exercises', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, instructions, exerciseType, difficulty, points, hasTimer, timerMinutes, canvasState, canvasMode, answerType, correctAnswer, options, isPublished, order } = req.body;
        const user = getRequestUser(req);
        const access = await getClassAccess(id, user.id, user.role);
        if (!access.targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }
        if (!canManageClass(access)) {
            return res.status(403).json({ error: 'Not authorized to create exercises in this class' });
        }
        if (!title || !String(title).trim()) {
            return res.status(400).json({ error: 'Title is required' });
        }
        const exercise = await prisma_1.default.classExercise.create({
            data: {
                classId: id,
                title: String(title).trim(),
                description,
                instructions,
                exerciseType: exerciseType || 'geometry',
                difficulty: difficulty || 'medium',
                points: points || 10,
                hasTimer: Boolean(hasTimer),
                timerMinutes,
                canvasState,
                canvasMode: canvasMode || 'readonly',
                answerType: answerType || 'multiple_choice',
                correctAnswer,
                options,
                isPublished: Boolean(isPublished),
                order: order || 0
            }
        });
        res.status(201).json(exercise);
    }
    catch (error) {
        console.error('Create exercise error:', error);
        res.status(500).json({ error: 'Failed to create exercise' });
    }
});
// Update exercise (Teacher only)
router.put('/:id/exercises/:exerciseId', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const { id, exerciseId } = req.params;
        const { title, description, instructions, exerciseType, difficulty, points, hasTimer, timerMinutes, canvasState, canvasMode, answerType, correctAnswer, options, isPublished, order } = req.body;
        const user = getRequestUser(req);
        const access = await getClassAccess(id, user.id, user.role);
        if (!access.targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }
        if (!canManageClass(access)) {
            return res.status(403).json({ error: 'Not authorized to update exercises in this class' });
        }
        const existingExercise = await prisma_1.default.classExercise.findFirst({
            where: { id: exerciseId, classId: id }
        });
        if (!existingExercise) {
            return res.status(404).json({ error: 'Exercise not found' });
        }
        const exercise = await prisma_1.default.classExercise.update({
            where: { id: exerciseId },
            data: {
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description }),
                ...(instructions !== undefined && { instructions }),
                ...(exerciseType !== undefined && { exerciseType }),
                ...(difficulty !== undefined && { difficulty }),
                ...(points !== undefined && { points }),
                ...(hasTimer !== undefined && { hasTimer: Boolean(hasTimer) }),
                ...(timerMinutes !== undefined && { timerMinutes }),
                ...(canvasState !== undefined && { canvasState }),
                ...(canvasMode !== undefined && { canvasMode }),
                ...(answerType !== undefined && { answerType }),
                ...(correctAnswer !== undefined && { correctAnswer }),
                ...(options !== undefined && { options }),
                ...(isPublished !== undefined && { isPublished: Boolean(isPublished) }),
                ...(order !== undefined && { order })
            }
        });
        res.json(exercise);
    }
    catch (error) {
        console.error('Update exercise error:', error);
        res.status(500).json({ error: 'Failed to update exercise' });
    }
});
// Delete exercise (Teacher only)
router.delete('/:id/exercises/:exerciseId', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const { id, exerciseId } = req.params;
        const user = getRequestUser(req);
        const access = await getClassAccess(id, user.id, user.role);
        if (!access.targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }
        if (!canManageClass(access)) {
            return res.status(403).json({ error: 'Not authorized to delete exercises in this class' });
        }
        const existingExercise = await prisma_1.default.classExercise.findFirst({
            where: { id: exerciseId, classId: id }
        });
        if (!existingExercise) {
            return res.status(404).json({ error: 'Exercise not found' });
        }
        await prisma_1.default.classExercise.delete({ where: { id: exerciseId } });
        res.json({ message: 'Exercise deleted successfully' });
    }
    catch (error) {
        console.error('Delete exercise error:', error);
        res.status(500).json({ error: 'Failed to delete exercise' });
    }
});
// Submit exercise attempt (Student only)
router.post('/:id/exercises/:exerciseId/attempt', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)('STUDENT'), async (req, res) => {
    try {
        const { id, exerciseId } = req.params;
        const { answer, canvasData, timeSpent } = req.body;
        const user = getRequestUser(req);
        const access = await getClassAccess(id, user.id, user.role);
        if (!access.targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }
        if (!access.isEnrolled) {
            return res.status(403).json({ error: 'Only enrolled students can submit this exercise' });
        }
        const exercise = await prisma_1.default.classExercise.findFirst({
            where: { id: exerciseId, classId: id }
        });
        if (!exercise || !exercise.isPublished) {
            return res.status(404).json({ error: 'Exercise not found' });
        }
        const existingAttempt = await prisma_1.default.exerciseAttempt.findUnique({
            where: {
                studentId_exerciseId: {
                    studentId: user.id,
                    exerciseId
                }
            }
        });
        if (existingAttempt) {
            return res.status(400).json({ error: 'Already attempted', attempt: existingAttempt });
        }
        let isCorrect = false;
        let score = 0;
        let gradingStatus = EXERCISE_STATUS_GRADED;
        let gradedAt = new Date();
        if (exercise.answerType === 'multiple_choice' && exercise.correctAnswer) {
            try {
                const correct = JSON.parse(exercise.correctAnswer);
                isCorrect = answer === correct.id || answer === correct;
            }
            catch (parseError) {
                isCorrect = answer === exercise.correctAnswer;
            }
            score = isCorrect ? exercise.points : 0;
        }
        else if (exercise.answerType === 'numeric' && exercise.correctAnswer) {
            try {
                const correct = JSON.parse(exercise.correctAnswer);
                const tolerance = correct.tolerance || 0;
                const numericAnswer = parseFloat(answer);
                isCorrect = Math.abs(numericAnswer - correct.value) <= tolerance;
            }
            catch (parseError) {
                isCorrect = parseFloat(answer) === parseFloat(exercise.correctAnswer);
            }
            score = isCorrect ? exercise.points : 0;
        }
        else if (exercise.answerType === 'canvas') {
            gradingStatus = EXERCISE_STATUS_PENDING_REVIEW;
            score = 0;
            gradedAt = null;
        }
        const attempt = await prisma_1.default.exerciseAttempt.create({
            data: {
                studentId: user.id,
                exerciseId,
                answer: JSON.stringify(answer ?? null),
                canvasData,
                isCorrect,
                score,
                gradingStatus,
                gradedAt,
                timeSpent: timeSpent || 0
            }
        });
        if (gradingStatus === EXERCISE_STATUS_GRADED && score > 0) {
            await prisma_1.default.user.update({
                where: { id: user.id },
                data: { xp: { increment: score } }
            });
        }
        res.status(201).json({
            attempt,
            gradingStatus,
            isCorrect: gradingStatus === EXERCISE_STATUS_PENDING_REVIEW ? null : isCorrect,
            score,
            message: gradingStatus === EXERCISE_STATUS_PENDING_REVIEW
                ? 'Jawaban berhasil dikirim dan sedang menunggu penilaian guru.'
                : isCorrect
                    ? 'Jawaban benar. Kerja bagus!'
                    : 'Jawaban sudah tersimpan. Cek kembali pembahasan dari guru.'
        });
    }
    catch (error) {
        console.error('Submit attempt error:', error);
        res.status(500).json({ error: 'Failed to submit attempt' });
    }
});
// Grade exercise attempt (Teacher only)
router.post('/:id/exercises/:exerciseId/attempts/:attemptId/grade', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)('TEACHER', 'ADMIN'), async (req, res) => {
    try {
        const { id, exerciseId, attemptId } = req.params;
        const { score, isCorrect, feedback } = req.body;
        const user = getRequestUser(req);
        const access = await getClassAccess(id, user.id, user.role);
        if (!access.targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }
        if (!canManageClass(access)) {
            return res.status(403).json({ error: 'Not authorized to grade this exercise' });
        }
        const exercise = await prisma_1.default.classExercise.findFirst({
            where: { id: exerciseId, classId: id },
            select: { id: true, points: true }
        });
        if (!exercise) {
            return res.status(404).json({ error: 'Exercise not found' });
        }
        const numericScore = Number(score);
        if (!Number.isFinite(numericScore)) {
            return res.status(400).json({ error: 'Score must be a valid number' });
        }
        const nextScore = clampScore(Math.round(numericScore), 0, exercise.points);
        const nextIsCorrect = typeof isCorrect === 'boolean'
            ? isCorrect
            : nextScore >= exercise.points;
        const updatedAttempt = await prisma_1.default.$transaction(async (tx) => {
            const existingAttempt = await tx.exerciseAttempt.findFirst({
                where: {
                    id: attemptId,
                    exerciseId
                },
                select: {
                    id: true,
                    studentId: true,
                    score: true
                }
            });
            if (!existingAttempt) {
                throw new Error('ATTEMPT_NOT_FOUND');
            }
            const attempt = await tx.exerciseAttempt.update({
                where: { id: attemptId },
                data: {
                    score: nextScore,
                    isCorrect: nextIsCorrect,
                    gradingStatus: EXERCISE_STATUS_GRADED,
                    gradedAt: new Date(),
                    ...(feedback !== undefined && { feedback: String(feedback).trim() || null })
                },
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });
            const xpDelta = nextScore - existingAttempt.score;
            if (xpDelta !== 0) {
                const student = await tx.user.findUnique({
                    where: { id: existingAttempt.studentId },
                    select: { xp: true }
                });
                await tx.user.update({
                    where: { id: existingAttempt.studentId },
                    data: {
                        xp: Math.max(0, (student?.xp || 0) + xpDelta)
                    }
                });
            }
            return attempt;
        });
        res.json({
            message: 'Penilaian berhasil disimpan',
            attempt: updatedAttempt
        });
    }
    catch (error) {
        if (error instanceof Error && error.message === 'ATTEMPT_NOT_FOUND') {
            return res.status(404).json({ error: 'Attempt not found' });
        }
        console.error('Grade attempt error:', error);
        res.status(500).json({ error: 'Failed to grade attempt' });
    }
});
exports.default = router;
//# sourceMappingURL=class.routes.js.map
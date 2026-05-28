import { Router } from 'express';
import prisma from '../utils/prisma';
import { authMiddleware, AuthRequest, requireRole } from '../middleware/auth.middleware';

const router = Router();

const getDateRange = (query: { startDate?: string | string[]; endDate?: string | string[] }) => {
    const endStr = Array.isArray(query.endDate) ? query.endDate[0] : query.endDate;
    const startStr = Array.isArray(query.startDate) ? query.startDate[0] : query.startDate;

    const endDate = endStr ? new Date(endStr) : new Date();
    endDate.setHours(23, 59, 59, 999);

    const startDate = startStr
        ? new Date(startStr)
        : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    startDate.setHours(0, 0, 0, 0);

    return { startDate, endDate };
};

// Get class statistics
router.get('/class/:classId', authMiddleware, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res) => {
    try {
        const classId = req.params.classId as string;
        const userId = req.user!.id;
        const role = req.user!.role;
        const { startDate, endDate } = getDateRange(req.query as any);

        // Verify access
        const targetClass = await prisma.class.findUnique({ where: { id: classId } });
        if (!targetClass) return res.status(404).json({ error: 'Kelas tidak ditemukan' });
        if (role !== 'ADMIN' && targetClass.teacherId !== userId) {
            return res.status(403).json({ error: 'Tidak punya akses ke kelas ini' });
        }

        // Get enrolled students
        const enrollments = await prisma.classEnrollment.findMany({
            where: { classId },
            include: { student: true }
        });
        const studentIds = enrollments.map(e => e.studentId);

        // Get module materials for this class (full include)
        const classModules = await prisma.module.findMany({
            where: { classId },
            include: {
                materials: {
                    orderBy: { moduleOrder: 'asc' }
                }
            },
            orderBy: { order: 'asc' }
        });
        const allMaterials = classModules.flatMap(m => m.materials);
        const allMaterialIds = allMaterials.map(mat => mat.id);
        const totalMaterials = allMaterials.length;

        // Get exercises for this class
        const exercises = await prisma.classExercise.findMany({
            where: { classId }
        });
        const exerciseIds = exercises.map(e => e.id);

        // === PROGRESS STORED (within date range) ===
        const progressRecords = await prisma.progress.findMany({
            where: {
                materialId: { in: allMaterialIds },
                userId: { in: studentIds },
                updatedAt: { gte: startDate, lte: endDate }
            },
            include: {
                material: { select: { id: true, title: true, type: true } },
                user: { select: { id: true, name: true } }
            }
        });

        // === OVERVIEW STATS ===
        const completedCount = progressRecords.filter(p => p.status === 'completed').length;
        const scoredRecords = progressRecords.filter(p => p.score !== null && p.score !== undefined);
        const avgScore = scoredRecords.length > 0
            ? Math.round(scoredRecords.reduce((s, r) => s + (r.score || 0), 0) / scoredRecords.length)
            : 0;
        const avgTimeSpent = progressRecords.length > 0
            ? Math.round(progressRecords.reduce((s, r) => s + r.timeSpent, 0) / progressRecords.length)
            : 0;

        const activeStudentIds = [...new Set(progressRecords.map(p => p.userId))];

        const studentMaterialCompletions = new Map<string, number>();
        progressRecords.filter(p => p.status === 'completed').forEach(p => {
            studentMaterialCompletions.set(p.userId, (studentMaterialCompletions.get(p.userId) || 0) + 1);
        });
        const fullyCompletedStudents = totalMaterials > 0
            ? [...studentMaterialCompletions.entries()].filter(([, count]) => count >= totalMaterials).length
            : 0;

        const completionRate = studentIds.length > 0
            ? Math.round((fullyCompletedStudents / studentIds.length) * 100)
            : 0;

        // === STUDENT PROGRESS ===
        const studentProgress = enrollments.map(enrollment => {
            const studentRecords = progressRecords.filter(p => p.userId === enrollment.studentId);
            const completed = studentRecords.filter(p => p.status === 'completed').length;
            const scored = studentRecords.filter(p => p.score !== null);
            const totalTime = studentRecords.reduce((s, r) => s + r.timeSpent, 0);

            const quizRecords = studentRecords.filter(p => p.material?.type === 'quiz');
            const quizCompleted = quizRecords.filter(p => p.status === 'completed').length;
            const quizTotal = allMaterials.filter(m => m.type === 'quiz').length;
            const quizPassed = quizRecords.filter(p => p.status === 'completed' && (p.score || 0) >= 70).length;

            return {
                studentId: enrollment.studentId,
                name: enrollment.student.name,
                email: enrollment.student.email,
                level: enrollment.student.level,
                xp: enrollment.student.xp,
                completedMaterials: completed,
                totalMaterials,
                completionPercent: totalMaterials > 0 ? Math.round((completed / totalMaterials) * 100) : 0,
                avgScore: scored.length > 0 ? Math.round(scored.reduce((s, r) => s + (r.score || 0), 0) / scored.length) : 0,
                totalTimeSpent: totalTime,
                quizPassed,
                quizTotal,
                quizPassPercent: quizTotal > 0 ? Math.round((quizPassed / quizTotal) * 100) : 0,
                isActive: activeStudentIds.includes(enrollment.studentId)
            };
        }).sort((a, b) => b.completionPercent - a.completionPercent);

        // === MATERIAL ACTIVITY ===
        const materialActivity = allMaterials.map(material => {
            const records = progressRecords.filter(p => p.materialId === material.id);
            const completed = records.filter(p => p.status === 'completed').length;
            const uniqueStudents = new Set(records.map(r => r.userId)).size;

            return {
                materialId: material.id,
                title: material.title,
                type: material.type,
                accessCount: records.length,
                uniqueStudents,
                avgTimeSpent: records.length > 0
                    ? Math.round(records.reduce((s, r) => s + r.timeSpent, 0) / records.length) : 0,
                completionRate: records.length > 0 ? Math.round((completed / records.length) * 100) : 0
            };
        }).sort((a, b) => b.accessCount - a.accessCount);

        // === DAILY ACTIVITY ===
        const dailyMap = new Map<string, {
            accessCount: number; quizAttempts: number; exerciseAttempts: number;
            discussions: number; totalActions: number;
        }>();

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const key = d.toISOString().split('T')[0];
            dailyMap.set(key, { accessCount: 0, quizAttempts: 0, exerciseAttempts: 0, discussions: 0, totalActions: 0 });
        }

        progressRecords.forEach(p => {
            const key = p.updatedAt.toISOString().split('T')[0];
            const entry = dailyMap.get(key);
            if (entry) {
                entry.accessCount++;
                entry.totalActions++;
                if (p.material?.type === 'quiz') entry.quizAttempts++;
            }
        });

        // Exercise attempts
        const exerciseAttempts = await prisma.exerciseAttempt.findMany({
            where: {
                exerciseId: { in: exerciseIds },
                studentId: { in: studentIds },
                createdAt: { gte: startDate, lte: endDate }
            }
        });
        exerciseAttempts.forEach(a => {
            const key = a.createdAt.toISOString().split('T')[0];
            const entry = dailyMap.get(key);
            if (entry) {
                entry.exerciseAttempts++;
                entry.totalActions++;
            }
        });

        // Discussions
        const discussionReplies = await prisma.classDiscussionReply.findMany({
            where: {
                thread: { classId },
                createdAt: { gte: startDate, lte: endDate }
            }
        });
        discussionReplies.forEach(disc => {
            const key = disc.createdAt.toISOString().split('T')[0];
            const entry = dailyMap.get(key);
            if (entry) {
                entry.discussions++;
                entry.totalActions++;
            }
        });

        const dailyActivity = [...dailyMap.entries()]
            .map(([date, data]) => ({ date, ...data }))
            .sort((a, b) => a.date.localeCompare(b.date));

        // === QUIZ PERFORMANCE ===
        const quizMaterials = allMaterials.filter(m => m.type === 'quiz');
        const quizPerformance = quizMaterials.map(quiz => {
            const records = progressRecords.filter(p => p.materialId === quiz.id);
            const completed = records.filter(p => p.status === 'completed');
            const passed = completed.filter(p => (p.score || 0) >= 70);

            return {
                materialId: quiz.id,
                title: quiz.title,
                attemptCount: records.length,
                passCount: passed.length,
                passRate: completed.length > 0 ? Math.round((passed.length / completed.length) * 100) : 0,
                avgScore: completed.length > 0 ? Math.round(completed.reduce((s, r) => s + (r.score || 0), 0) / completed.length) : 0,
                avgTimeSpent: completed.length > 0 ? Math.round(completed.reduce((s, r) => s + r.timeSpent, 0) / completed.length) : 0
            };
        });

        // === EXERCISE PERFORMANCE ===
        const exercisePerformance = exercises.filter(e => e.isPublished).map(ex => {
            const attempts = exerciseAttempts.filter(a => a.exerciseId === ex.id);
            const scoredAttempts = attempts.filter(a => a.gradingStatus === 'graded');
            return {
                exerciseId: ex.id,
                title: ex.title,
                points: ex.points,
                type: ex.exerciseType,
                difficulty: ex.difficulty,
                attemptCount: attempts.length,
                uniqueStudents: new Set(attempts.map(a => a.studentId)).size,
                avgScore: scoredAttempts.length > 0 ? Math.round(scoredAttempts.reduce((s, a) => s + a.score, 0) / scoredAttempts.length) : 0,
                maxScore: scoredAttempts.length > 0 ? Math.max(...scoredAttempts.map(a => a.score)) : 0,
                passRate: scoredAttempts.length > 0 ? Math.round((scoredAttempts.filter(a => a.score >= ex.points * 0.6).length / scoredAttempts.length) * 100) : 0
            };
        });

        // === BEHAVIOR OVERVIEW ===
        const behaviorOverview = {
            totalAccesses: progressRecords.length,
            totalQuizAttempts: progressRecords.filter(p => p.material?.type === 'quiz').length,
            totalExerciseAttempts: exerciseAttempts.length,
            totalDiscussions: discussionReplies.length,
            avgSessionDuration: avgTimeSpent,
            peakActivityDay: dailyActivity.length > 0
                ? dailyActivity.sort((a, b) => b.totalActions - a.totalActions)[0]?.date || ''
                : '',
            mostActiveStudent: studentProgress.length > 0
                ? { name: studentProgress[0].name, completedMaterials: studentProgress[0].completedMaterials }
                : null,
            leastActiveStudent: studentProgress.length > 0
                ? [...studentProgress].reverse().find(s => s.isActive) || null
                : null
        };

        res.json({
            classInfo: {
                id: targetClass.id,
                name: targetClass.name,
                subject: targetClass.subject,
                studentCount: studentIds.length,
                moduleCount: classModules.length,
                materialCount: totalMaterials,
                exerciseCount: exercises.length
            },
            timeFilter: {
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            },
            overview: {
                completionRate,
                avgScore,
                avgTimeSpent,
                activeStudents: activeStudentIds.length,
                totalAccessCount: progressRecords.length,
                totalExerciseAttempts: exerciseAttempts.length,
                totalDiscussions: discussionReplies.length
            },
            studentProgress,
            materialActivity,
            dailyActivity,
            quizPerformance,
            exercisePerformance,
            behaviorOverview
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: 'Gagal mengambil data statistik' });
    }
});

// Export class statistics as CSV
router.get('/class/:classId/export/csv', authMiddleware, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res) => {
    try {
        const classId = req.params.classId as string;
        const userId = req.user!.id;
        const role = req.user!.role;
        const { startDate, endDate } = getDateRange(req.query as any);

        const targetClass = await prisma.class.findUnique({ where: { id: classId } });
        if (!targetClass) return res.status(404).json({ error: 'Kelas tidak ditemukan' });
        if (role !== 'ADMIN' && targetClass.teacherId !== userId) {
            return res.status(403).json({ error: 'Tidak punya akses ke kelas ini' });
        }

        const enrollments = await prisma.classEnrollment.findMany({
            where: { classId },
            include: { student: true }
        });
        const studentIds = enrollments.map(e => e.studentId);

        const classModules = await prisma.module.findMany({
            where: { classId },
            include: { materials: true }
        });
        const allMaterials = classModules.flatMap(m => m.materials);
        const allMaterialIds = allMaterials.map(mat => mat.id);
        const totalMaterials = allMaterials.length;

        const progressRecords = await prisma.progress.findMany({
            where: {
                materialId: { in: allMaterialIds },
                userId: { in: studentIds },
                updatedAt: { gte: startDate, lte: endDate }
            },
            include: {
                material: { select: { id: true, title: true, type: true } }
            }
        });

        const escapeCsv = (value: any) => {
            const str = String(value ?? '');
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const rows: string[] = [];
        rows.push('Nama,Email,Level,XP,Materi Selesai,Total Materi,Progress (%),Rata-rata Nilai,Waktu Total (menit),Quiz Lulus/Total,Quiz Lulus (%)');

        enrollments.forEach(enrollment => {
            const studentRecords = progressRecords.filter(p => p.userId === enrollment.studentId);
            const completed = studentRecords.filter(p => p.status === 'completed').length;
            const scored = studentRecords.filter(p => p.score !== null);
            const totalTime = studentRecords.reduce((s, r) => s + r.timeSpent, 0);
            const quizRecords = studentRecords.filter(p => p.material?.type === 'quiz' && p.status === 'completed');
            const quizPassed = quizRecords.filter(p => (p.score || 0) >= 70).length;
            const quizTotal = allMaterials.filter(m => m.type === 'quiz').length;
            const avgScore = scored.length > 0 ? Math.round(scored.reduce((s, r) => s + (r.score || 0), 0) / scored.length) : 0;
            const completionPercent = totalMaterials > 0 ? Math.round((completed / totalMaterials) * 100) : 0;

            rows.push([
                escapeCsv(enrollment.student.name),
                escapeCsv(enrollment.student.email),
                enrollment.student.level,
                enrollment.student.xp,
                completed,
                totalMaterials,
                `${completionPercent}%`,
                avgScore,
                Math.round(totalTime / 60),
                `${quizPassed}/${quizTotal}`,
                quizTotal > 0 ? `${Math.round((quizPassed / quizTotal) * 100)}%` : 'N/A'
            ].join(','));
        });

        const filename = `laporan_statistik_${targetClass.name.replace(/\s+/g, '_')}_${startDate.toISOString().split('T')[0]}.csv`;

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
        res.send('\uFEFF' + rows.join('\n'));
    } catch (error) {
        console.error('CSV export error:', error);
        res.status(500).json({ error: 'Gagal mengexport data' });
    }
});

export default router;

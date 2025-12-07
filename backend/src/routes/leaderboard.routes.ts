import { Router } from 'express';
import prisma from '../utils/prisma';

const router = Router();

// Get leaderboard
router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;

        const users = await prisma.user.findMany({
            where: { role: 'STUDENT' },
            select: {
                id: true,
                name: true,
                xp: true,
                level: true,
                avatar: true
            },
            orderBy: { xp: 'desc' },
            take: limit
        });

        // Add rank
        const leaderboard = users.map((user: typeof users[number], index: number) => ({
            rank: index + 1,
            ...user
        }));

        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

export default router;

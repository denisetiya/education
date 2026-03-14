"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../utils/prisma"));
const router = (0, express_1.Router)();
// Get leaderboard
router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const users = await prisma_1.default.user.findMany({
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
        const leaderboard = users.map((user, index) => ({
            rank: index + 1,
            ...user
        }));
        res.json(leaderboard);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});
exports.default = router;
//# sourceMappingURL=leaderboard.routes.js.map
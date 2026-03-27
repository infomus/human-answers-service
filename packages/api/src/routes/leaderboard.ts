import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();

// GET /api/leaderboard
router.get("/", async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        credits: true,
        _count: { select: { votes: true } },
      },
      orderBy: { credits: "desc" },
      take: 50,
    });

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

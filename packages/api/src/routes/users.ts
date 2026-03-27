import { Router } from "express";
import prisma from "../lib/prisma";
import { authenticateUser, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/users/me — get current user profile
router.get("/me", authenticateUser, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        credits: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const answerCount = await prisma.answer.count({
      where: { userId: req.userId! },
    });

    const bestAnswerCount = await prisma.answer.count({
      where: { userId: req.userId!, isBest: true },
    });

    res.json({ ...user, answerCount, bestAnswerCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/users/me/answers — get user's answers
router.get("/me/answers", authenticateUser, async (req: AuthRequest, res) => {
  try {
    const answers = await prisma.answer.findMany({
      where: { userId: req.userId! },
      include: {
        question: { select: { id: true, title: true, category: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(answers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();

// GET /api/stats — platform statistics
router.get("/", async (_req, res) => {
  try {
    const [totalQuestions, totalAnswers, agentNames, categories] =
      await Promise.all([
        prisma.question.count(),
        prisma.answer.count(),
        prisma.question.findMany({
          select: { agentName: true },
          distinct: ["agentName"],
        }),
        prisma.question.groupBy({
          by: ["category"],
          _count: { id: true },
          orderBy: { _count: { id: "desc" } },
        }),
      ]);

    res.json({
      totalQuestions,
      totalAnswers,
      activeAgents: agentNames.length,
      agentNames: agentNames.map((a: { agentName: string }) => a.agentName),
      topCategories: categories.map(
        (c: { category: string; _count: { id: number } }) => ({
          name: c.category,
          count: c._count.id,
        })
      ),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

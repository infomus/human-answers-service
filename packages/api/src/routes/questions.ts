import { Router } from "express";
import prisma from "../lib/prisma";
import { authenticateUser, AuthRequest } from "../middleware/auth";
import { z } from "zod";

const router = Router();

// GET /api/questions — list questions
router.get("/", async (req, res) => {
  try {
    const {
      category,
      status,
      demographic,
      search,
      sort,
      page = "1",
      limit = "20",
    } = req.query;

    const where: Record<string, unknown> = {};
    if (category && typeof category === "string") where.category = category;
    if (status && typeof status === "string") where.status = status;
    if (demographic && typeof demographic === "string")
      where.demographic = demographic;
    if (search && typeof search === "string") {
      where.OR = [
        { title: { contains: search } },
        { body: { contains: search } },
      ];
    }

    let orderBy: Record<string, string> = { createdAt: "desc" };
    if (sort === "trending") {
      // Sort by answer count (most active) — approximated by updatedAt
      orderBy = { updatedAt: "desc" };
    } else if (sort === "oldest") {
      orderBy = { createdAt: "asc" };
    }

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        include: { _count: { select: { answers: true } } },
        orderBy,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.question.count({ where }),
    ]);

    res.json({
      questions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/questions/:id — get question with answers
router.get("/:id", async (req, res) => {
  try {
    const question = await prisma.question.findUnique({
      where: { id: req.params.id },
      include: {
        answers: {
          include: { _count: { select: { votes: true } } },
          orderBy: [{ isBest: "desc" }, { upvotes: "desc" }, { createdAt: "asc" }],
        },
      },
    });

    if (!question) {
      res.status(404).json({ error: "Question not found" });
      return;
    }

    res.json(question);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const answerSchema = z.object({
  body: z.string().min(10).max(10000),
});

// POST /api/questions/:id/answers — submit answer
router.post(
  "/:id/answers",
  authenticateUser,
  async (req: AuthRequest, res) => {
    try {
      const { body } = answerSchema.parse(req.body);

      const question = await prisma.question.findUnique({
        where: { id: req.params.id },
      });
      if (!question) {
        res.status(404).json({ error: "Question not found" });
        return;
      }
      if (question.status === "closed") {
        res.status(400).json({ error: "Question is closed" });
        return;
      }

      const answer = await prisma.answer.create({
        data: {
          questionId: question.id,
          body,
          userId: req.userId!,
          userName: req.userName!,
        },
      });

      // Update question status if first answer
      if (question.status === "open") {
        await prisma.question.update({
          where: { id: question.id },
          data: { status: "answered" },
        });
      }

      // Award credits
      await prisma.user.update({
        where: { id: req.userId! },
        data: { credits: { increment: 10 } },
      });

      res.status(201).json(answer);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: err.errors });
        return;
      }
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;

import { Router } from "express";
import prisma from "../lib/prisma";
import { authenticateAgent, AgentRequest } from "../middleware/auth";
import { z } from "zod";

const router = Router();

const questionSchema = z.object({
  title: z.string().min(5).max(200),
  body: z.string().min(10).max(5000),
  category: z.string().min(1).max(50),
  demographic: z.string().default("general"),
});

// POST /api/agent/questions — agent asks a question
router.post(
  "/questions",
  authenticateAgent,
  async (req: AgentRequest, res) => {
    try {
      const data = questionSchema.parse(req.body);

      const question = await prisma.question.create({
        data: {
          ...data,
          agentId: req.agentId!,
          agentName: req.agentName!,
        },
      });

      res.status(201).json(question);
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

// GET /api/agent/questions/:id — agent checks for answers
router.get(
  "/questions/:id",
  authenticateAgent,
  async (_req: AgentRequest, res) => {
    try {
      const question = await prisma.question.findUnique({
        where: { id: _req.params.id },
        include: {
          answers: {
            orderBy: [{ isBest: "desc" }, { upvotes: "desc" }],
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
  }
);

// POST /api/agent/questions/:id/accept — agent marks best answer
router.post(
  "/questions/:id/accept",
  authenticateAgent,
  async (req: AgentRequest, res) => {
    try {
      const { answerId } = z
        .object({ answerId: z.string() })
        .parse(req.body);

      const question = await prisma.question.findUnique({
        where: { id: req.params.id },
      });
      if (!question) {
        res.status(404).json({ error: "Question not found" });
        return;
      }

      const answer = await prisma.answer.findFirst({
        where: { id: answerId, questionId: question.id },
      });
      if (!answer) {
        res.status(404).json({ error: "Answer not found for this question" });
        return;
      }

      // Unmark any existing best answer
      await prisma.answer.updateMany({
        where: { questionId: question.id, isBest: true },
        data: { isBest: false },
      });

      // Mark new best answer
      await prisma.answer.update({
        where: { id: answerId },
        data: { isBest: true },
      });

      // Close question
      await prisma.question.update({
        where: { id: question.id },
        data: { status: "closed" },
      });

      // Bonus credits for best answer
      await prisma.user.update({
        where: { id: answer.userId },
        data: { credits: { increment: 50 } },
      });

      res.json({ message: "Best answer accepted", answerId });
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

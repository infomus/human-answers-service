import { Router } from "express";
import prisma from "../lib/prisma";
import { authenticateUser, AuthRequest } from "../middleware/auth";
import { z } from "zod";

const router = Router();

const voteSchema = z.object({
  type: z.enum(["up", "down"]),
});

// POST /api/answers/:id/vote
router.post("/:id/vote", authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { type } = voteSchema.parse(req.body);

    const answer = await prisma.answer.findUnique({
      where: { id: req.params.id },
    });
    if (!answer) {
      res.status(404).json({ error: "Answer not found" });
      return;
    }

    // Check if user already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        answerId_userId: {
          answerId: answer.id,
          userId: req.userId!,
        },
      },
    });

    if (existingVote) {
      if (existingVote.type === type) {
        // Remove vote (toggle off)
        await prisma.vote.delete({ where: { id: existingVote.id } });
        await prisma.answer.update({
          where: { id: answer.id },
          data:
            type === "up"
              ? { upvotes: { decrement: 1 } }
              : { downvotes: { decrement: 1 } },
        });
        res.json({ message: "Vote removed" });
        return;
      } else {
        // Change vote direction
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { type },
        });
        await prisma.answer.update({
          where: { id: answer.id },
          data:
            type === "up"
              ? { upvotes: { increment: 1 }, downvotes: { decrement: 1 } }
              : { upvotes: { decrement: 1 }, downvotes: { increment: 1 } },
        });
        res.json({ message: "Vote changed" });
        return;
      }
    }

    // New vote
    await prisma.vote.create({
      data: {
        answerId: answer.id,
        userId: req.userId!,
        type,
      },
    });

    await prisma.answer.update({
      where: { id: answer.id },
      data:
        type === "up"
          ? { upvotes: { increment: 1 } }
          : { downvotes: { increment: 1 } },
    });

    res.json({ message: "Vote recorded" });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

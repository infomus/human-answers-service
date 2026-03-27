import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import questionRoutes from "./routes/questions";
import answerRoutes from "./routes/answers";
import agentRoutes from "./routes/agent";
import leaderboardRoutes from "./routes/leaderboard";
import userRoutes from "./routes/users";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Agent Layer discovery endpoint
app.get("/.well-known/agent.json", (_req, res) => {
  res.json({
    schema_version: "1.0",
    name: "Human Answers Service",
    description:
      "A service where AI agents can ask questions and get answers from real humans. Like Quora, but for agents.",
    url: `http://localhost:${PORT}`,
    authentication: {
      type: "api_key",
      header: "x-agent-key",
      description: "API key for agent authentication",
    },
    capabilities: [
      {
        name: "ask_question",
        description:
          "Post a question for humans to answer. Specify a category and target demographic.",
        endpoint: "/api/agent/questions",
        method: "POST",
        parameters: {
          title: {
            type: "string",
            required: true,
            description: "Short question title",
          },
          body: {
            type: "string",
            required: true,
            description: "Detailed question body",
          },
          category: {
            type: "string",
            required: true,
            description:
              "Question category (e.g., science, philosophy, culture, technology, humor)",
          },
          demographic: {
            type: "string",
            required: false,
            description: "Target audience (default: general)",
          },
        },
      },
      {
        name: "get_answers",
        description:
          "Check for human answers to a previously asked question.",
        endpoint: "/api/agent/questions/{questionId}",
        method: "GET",
        parameters: {
          questionId: {
            type: "string",
            required: true,
            description: "The question ID returned when asking",
          },
        },
      },
      {
        name: "accept_answer",
        description:
          "Mark a specific answer as the best answer, closing the question.",
        endpoint: "/api/agent/questions/{questionId}/accept",
        method: "POST",
        parameters: {
          answerId: {
            type: "string",
            required: true,
            description: "The answer ID to accept as best",
          },
        },
      },
    ],
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/answers", answerRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/users", userRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "human-answers-service" });
});

app.listen(PORT, () => {
  console.log(`🚀 HAS API running on http://localhost:${PORT}`);
  console.log(
    `📋 Agent discovery: http://localhost:${PORT}/.well-known/agent.json`
  );
});

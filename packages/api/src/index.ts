import express from "express";
import cors from "cors";
import { agentLayer } from "@agent-layer/express";
import authRoutes from "./routes/auth";
import questionRoutes from "./routes/questions";
import answerRoutes from "./routes/answers";
import agentRoutes from "./routes/agent";
import leaderboardRoutes from "./routes/leaderboard";
import userRoutes from "./routes/users";
import statsRoutes from "./routes/stats";
import prisma from "./lib/prisma";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Agent Layer middleware (replaces hand-rolled /.well-known/agent.json)
const agentLayerRouter = agentLayer({
    discovery: {
      manifest: {
        name: "Human Answers Service",
        description:
          "AI agents ask questions, real humans provide answers. Quora for agents.",
        openapi_url: "/openapi.json",
        llms_txt_url: "/llms.txt",
      },
      openApiSpec: {
        openapi: "3.0.3",
        info: {
          title: "Human Answers Service API",
          version: "1.0.0",
          description:
            "REST API for AI agents to ask questions and retrieve human answers.",
        },
        servers: [{ url: `http://localhost:${PORT}` }],
        paths: {
          "/api/agent/questions": {
            post: {
              summary: "Ask a question",
              description:
                "Submit a question with title, body, category, and target demographic. Returns question ID.",
              requestBody: {
                required: true,
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      required: ["title", "body", "category"],
                      properties: {
                        title: {
                          type: "string",
                          description: "Short question title",
                        },
                        body: {
                          type: "string",
                          description: "Detailed question body",
                        },
                        category: {
                          type: "string",
                          description: "Question category",
                        },
                        demographic: {
                          type: "string",
                          description: "Target audience (default: general)",
                        },
                      },
                    },
                  },
                },
              },
              responses: {
                "201": { description: "Question created" },
              },
            },
          },
          "/api/agent/questions/{id}": {
            get: {
              summary: "Get answers to a question",
              description:
                "Retrieve a question and all human answers, sorted by votes.",
              parameters: [
                {
                  name: "id",
                  in: "path",
                  required: true,
                  schema: { type: "string" },
                },
              ],
              responses: {
                "200": { description: "Question with answers" },
              },
            },
          },
          "/api/agent/questions/{id}/accept": {
            post: {
              summary: "Accept best answer",
              description:
                "Mark an answer as the best, awarding credits to the answerer.",
              parameters: [
                {
                  name: "id",
                  in: "path",
                  required: true,
                  schema: { type: "string" },
                },
              ],
              requestBody: {
                required: true,
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      required: ["answerId"],
                      properties: {
                        answerId: {
                          type: "string",
                          description: "The answer ID to accept",
                        },
                      },
                    },
                  },
                },
              },
              responses: {
                "200": { description: "Answer accepted" },
              },
            },
          },
          "/api/questions": {
            get: {
              summary: "List questions",
              description: "Browse questions with optional filters.",
              parameters: [
                {
                  name: "category",
                  in: "query",
                  schema: { type: "string" },
                },
                { name: "status", in: "query", schema: { type: "string" } },
                { name: "page", in: "query", schema: { type: "integer" } },
                { name: "limit", in: "query", schema: { type: "integer" } },
                { name: "search", in: "query", schema: { type: "string" } },
                { name: "sort", in: "query", schema: { type: "string" } },
              ],
              responses: {
                "200": { description: "Paginated question list" },
              },
            },
          },
          "/api/stats": {
            get: {
              summary: "Platform statistics",
              description:
                "Returns total questions, answers, active agents, and top categories.",
              responses: {
                "200": { description: "Stats object" },
              },
            },
          },
        },
      },
    },
    llmsTxt: {
      title: "Human Answers Service API",
      description:
        "REST API for agents to ask questions and retrieve human answers",
      sections: [
        {
          title: "Ask a Question",
          content:
            "POST /api/agent/questions — Submit a question with title, body, category, and target demographic. Returns question ID.",
        },
        {
          title: "Get Answers",
          content:
            "GET /api/agent/questions/:id — Retrieve a question and all human answers, sorted by votes.",
        },
        {
          title: "Accept Best Answer",
          content:
            "POST /api/agent/questions/:id/accept — Mark an answer as the best, awarding credits to the answerer.",
        },
      ],
    },
    a2a: {
      card: {
        protocolVersion: "1.0.0",
        name: "Human Answers Service",
        description: "Get real human answers to your questions",
        url: `http://localhost:${PORT}`,
        version: "1.0.0",
        capabilities: {
          streaming: false,
          pushNotifications: false,
        },
        skills: [
          {
            id: "ask-question",
            name: "Ask a Question",
            description: "Post a question for humans to answer",
          },
          {
            id: "get-answers",
            name: "Get Answers",
            description:
              "Retrieve human answers to a previously asked question",
          },
          {
            id: "accept-answer",
            name: "Accept Answer",
            description: "Mark the best answer and award credits",
          },
        ],
      },
    },
    rateLimit: {
      max: 100,
      windowMs: 60000,
    },
    agentsTxt: {
      rules: [
        { agent: "*", allow: ["/api/agent/*"], deny: ["/api/auth/*"] },
      ],
    },
    securityHeaders: {
      csp: false, // disable CSP to avoid blocking API JSON responses
      frameOptions: "DENY",
    },
    errors: false, // we handle errors in our own routes
  });
app.use(agentLayerRouter as unknown as express.RequestHandler);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/answers", answerRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/stats", statsRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "human-answers-service" });
});

app.listen(PORT, () => {
  console.log(`HAS API running on http://localhost:${PORT}`);
  console.log(
    `Agent discovery: http://localhost:${PORT}/.well-known/agent.json`
  );
  console.log(`LLMs.txt: http://localhost:${PORT}/llms.txt`);
  console.log(`OpenAPI: http://localhost:${PORT}/openapi.json`);
});

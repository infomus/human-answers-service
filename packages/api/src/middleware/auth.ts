import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "has-poc-secret-key-change-in-prod";

export interface AuthRequest extends Request {
  userId?: string;
  userName?: string;
}

export function authenticateUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      name: string;
    };
    req.userId = decoded.userId;
    req.userName = decoded.name;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

export function optionalAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        name: string;
      };
      req.userId = decoded.userId;
      req.userName = decoded.name;
    } catch {
      // ignore invalid tokens for optional auth
    }
  }
  next();
}

const AGENT_API_KEY =
  process.env.AGENT_API_KEY || "has-agent-key-change-in-prod";

export interface AgentRequest extends Request {
  agentId?: string;
  agentName?: string;
}

export function authenticateAgent(
  req: AgentRequest,
  res: Response,
  next: NextFunction
): void {
  const apiKey = req.headers["x-agent-key"] as string;
  if (!apiKey || apiKey !== AGENT_API_KEY) {
    res.status(401).json({ error: "Invalid agent API key" });
    return;
  }

  req.agentId = (req.headers["x-agent-id"] as string) || "unknown-agent";
  req.agentName =
    (req.headers["x-agent-name"] as string) || "Anonymous Agent";
  next();
}

export function signToken(userId: string, name: string): string {
  return jwt.sign({ userId, name }, JWT_SECRET, { expiresIn: "7d" });
}

export { JWT_SECRET };

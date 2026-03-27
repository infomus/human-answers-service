const API_BASE = "/api";

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("has_token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Request failed");
  }

  return res.json();
}

export interface Question {
  id: string;
  title: string;
  body: string;
  category: string;
  demographic: string;
  status: string;
  agentId: string;
  agentName: string;
  createdAt: string;
  updatedAt: string;
  _count?: { answers: number };
  answers?: Answer[];
}

export interface Answer {
  id: string;
  questionId: string;
  body: string;
  userId: string;
  userName: string;
  upvotes: number;
  downvotes: number;
  isBest: boolean;
  createdAt: string;
  question?: { id: string; title: string; category: string };
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  credits: number;
  createdAt?: string;
  answerCount?: number;
  bestAnswerCount?: number;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatarUrl: string | null;
  credits: number;
  _count: { votes: number };
}

export interface QuestionsResponse {
  questions: Question[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface StatsResponse {
  totalQuestions: number;
  totalAnswers: number;
  activeAgents: number;
  agentNames: string[];
  topCategories: { name: string; count: number }[];
}

export const api = {
  questions: {
    list: (params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return fetcher<QuestionsResponse>(`/questions${qs}`);
    },
    get: (id: string) => fetcher<Question>(`/questions/${id}`),
    answer: (id: string, body: string) =>
      fetcher<Answer>(`/questions/${id}/answers`, {
        method: "POST",
        body: JSON.stringify({ body }),
      }),
  },
  answers: {
    vote: (id: string, type: "up" | "down") =>
      fetcher<{ message: string }>(`/answers/${id}/vote`, {
        method: "POST",
        body: JSON.stringify({ type }),
      }),
  },
  auth: {
    register: (email: string, name: string, password: string) =>
      fetcher<{ token: string; user: User }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, name, password }),
      }),
    login: (email: string, password: string) =>
      fetcher<{ token: string; user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
  },
  users: {
    me: () => fetcher<User>("/users/me"),
    myAnswers: () => fetcher<Answer[]>("/users/me/answers"),
  },
  leaderboard: () => fetcher<LeaderboardUser[]>("/leaderboard"),
  stats: () => fetcher<StatsResponse>("/stats"),
};

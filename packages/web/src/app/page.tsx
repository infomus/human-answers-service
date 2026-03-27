"use client";

import { useEffect, useState } from "react";
import { QuestionCard } from "@/components/question-card";
import { Button } from "@/components/ui/button";
import { api, type Question } from "@/lib/api";
import { Bot, Loader2 } from "lucide-react";

const CATEGORIES = [
  "all",
  "philosophy",
  "culture",
  "humor",
  "science",
  "psychology",
  "technology",
];

export default function HomePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        if (category !== "all") params.category = category;
        if (status !== "all") params.status = status;
        const data = await api.questions.list(params);
        setQuestions(data.questions);
      } catch (err) {
        console.error("Failed to load questions:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [category, status]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-3">
          <Bot className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Human Answers Service</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          AI agents have questions. You have answers. Earn credits for helping
          machines understand humanity.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={category === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory(cat)}
              className="capitalize"
            >
              {cat}
            </Button>
          ))}
        </div>
        <div className="flex gap-1 ml-auto">
          {["all", "open", "answered", "closed"].map((s) => (
            <Button
              key={s}
              variant={status === s ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setStatus(s)}
              className="capitalize"
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      {/* Question List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No questions found. Check back soon!
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <QuestionCard key={q.id} question={q} />
          ))}
        </div>
      )}
    </div>
  );
}

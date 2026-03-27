"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { AnswerCard } from "@/components/answer-card";
import {
  timeAgo,
  getAgentAvatar,
  getCategoryColor,
  getStatusColor,
} from "@/lib/utils";
import { api, type Question } from "@/lib/api";
import { ArrowLeft, Bot, Loader2, Send } from "lucide-react";

export default function QuestionPage() {
  const params = useParams();
  const router = useRouter();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [answerBody, setAnswerBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const id = params.id as string;

  useEffect(() => {
    async function load() {
      try {
        const data = await api.questions.get(id);
        setQuestion(data);
      } catch {
        setQuestion(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("has_token");
    if (!token) {
      setError("Please sign in to answer questions");
      return;
    }
    if (answerBody.length < 10) {
      setError("Answer must be at least 10 characters");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await api.questions.answer(id, answerBody);
      setAnswerBody("");
      // Reload question
      const data = await api.questions.get(id);
      setQuestion(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit answer");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-semibold mb-2">Question not found</h2>
        <Button variant="outline" onClick={() => router.push("/")}>
          Back to questions
        </Button>
      </div>
    );
  }

  const answers = question.answers || [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back
      </Button>

      {/* Question */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${getAgentAvatar(question.agentName)}`}
            >
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="font-medium">{question.agentName}</div>
              <div className="text-xs text-muted-foreground">
                Asked {timeAgo(question.createdAt)}
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-3">{question.title}</h1>
          <p className="text-muted-foreground leading-relaxed mb-4 whitespace-pre-wrap">
            {question.body}
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(question.category)}`}
            >
              {question.category}
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(question.status)}`}
            >
              {question.status}
            </span>
            {question.demographic !== "general" && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground">
                @{question.demographic}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Answers */}
      <h2 className="text-lg font-semibold mb-4">
        {answers.length} {answers.length === 1 ? "Answer" : "Answers"}
      </h2>

      <div className="space-y-4 mb-8">
        {answers.map((answer) => (
          <AnswerCard key={answer.id} answer={answer} />
        ))}
        {answers.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No answers yet. Be the first to help this agent understand!
          </p>
        )}
      </div>

      {/* Answer form */}
      {question.status !== "closed" && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">Your Answer</h3>
            <form onSubmit={handleSubmitAnswer}>
              <Textarea
                placeholder="Share your human perspective... (min 10 characters)"
                className="mb-3 min-h-[120px]"
                value={answerBody}
                onChange={(e) => setAnswerBody(e.target.value)}
              />
              {error && (
                <p className="text-sm text-destructive mb-3">{error}</p>
              )}
              <Button type="submit" disabled={submitting} className="gap-2">
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {submitting ? "Submitting..." : "Submit Answer"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

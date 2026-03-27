"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { AnswerCard } from "@/components/answer-card";
import {
  timeAgo,
  getAgentAvatar,
  getAgentInitials,
  getCategoryColor,
  getCategoryDot,
  getStatusColor,
  getBountyAmount,
} from "@/lib/utils";
import { api, type Question, type Answer } from "@/lib/api";
import {
  ArrowLeft,
  Loader2,
  Send,
  Share2,
  Coins,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";

type SortOption = "best" | "newest" | "oldest";

export default function QuestionPage() {
  const params = useParams();
  const router = useRouter();
  const [question, setQuestion] = useState<Question | null>(null);
  const [related, setRelated] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [answerBody, setAnswerBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [answerSort, setAnswerSort] = useState<SortOption>("best");

  const id = params.id as string;

  useEffect(() => {
    async function load() {
      try {
        const data = await api.questions.get(id);
        setQuestion(data);
        // Load related questions (same category)
        const relatedData = await api.questions.list({
          category: data.category,
          limit: "5",
        });
        setRelated(
          relatedData.questions.filter((q) => q.id !== id).slice(0, 3)
        );
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
      const data = await api.questions.get(id);
      setQuestion(data);
      toast.success("Answer submitted! You earned 10 credits.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit answer"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(
      () => toast.success("Link copied to clipboard!"),
      () => toast.error("Failed to copy link")
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="skeleton h-6 w-16 rounded mb-4" />
        <div className="rounded-lg border p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="skeleton w-10 h-10 rounded-full" />
            <div className="space-y-2">
              <div className="skeleton h-4 w-24 rounded" />
              <div className="skeleton h-3 w-16 rounded" />
            </div>
          </div>
          <div className="skeleton h-7 w-3/4 rounded" />
          <div className="skeleton h-20 w-full rounded" />
          <div className="flex gap-2">
            <div className="skeleton h-5 w-20 rounded-full" />
            <div className="skeleton h-5 w-16 rounded-full" />
          </div>
        </div>
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
  const bounty = getBountyAmount(question.category);

  const sortedAnswers = [...answers].sort((a, b) => {
    if (answerSort === "newest")
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (answerSort === "oldest")
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    // best: isBest first, then by net votes
    if (a.isBest && !b.isBest) return -1;
    if (!a.isBest && b.isBest) return 1;
    return b.upvotes - b.downvotes - (a.upvotes - a.downvotes);
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content */}
        <div className="flex-1 min-w-0">
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
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${getAgentAvatar(question.agentName)}`}
                  >
                    {getAgentInitials(question.agentName)}
                  </div>
                  <div>
                    <div className="font-medium">{question.agentName}</div>
                    <div className="text-xs text-muted-foreground">
                      Asked {timeAgo(question.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                    <Coins className="h-3 w-3" />
                    {bounty} credits bounty
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="gap-1"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    Share
                  </Button>
                </div>
              </div>

              <h1 className="text-2xl font-bold mb-3">{question.title}</h1>
              <p className="text-muted-foreground leading-relaxed mb-4 whitespace-pre-wrap">
                {question.body}
              </p>

              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(question.category)}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${getCategoryDot(question.category)}`}
                  />
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

          {/* Answers header with sort */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {answers.length} {answers.length === 1 ? "Answer" : "Answers"}
            </h2>
            <div className="flex items-center gap-1">
              {(["best", "newest", "oldest"] as const).map((s) => (
                <Button
                  key={s}
                  variant={answerSort === s ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setAnswerSort(s)}
                  className="text-xs h-7 capitalize"
                >
                  {s === "best" ? "Most Voted" : s}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4 mb-8">
            {sortedAnswers.map((answer) => (
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
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="gap-2"
                  >
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

        {/* Sidebar: Related Questions */}
        {related.length > 0 && (
          <div className="lg:w-72 flex-shrink-0">
            <div className="sticky top-20">
              <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                Related Questions
              </h3>
              <div className="space-y-3">
                {related.map((q) => (
                  <Link
                    key={q.id}
                    href={`/questions/${q.id}`}
                    className="block"
                  >
                    <Card className="card-hover">
                      <CardContent className="p-3">
                        <div className="text-sm font-medium line-clamp-2 mb-1">
                          {q.title}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{q.agentName}</span>
                          <span className="flex items-center gap-0.5">
                            <MessageCircle className="h-3 w-3" />
                            {q._count?.answers ?? 0}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

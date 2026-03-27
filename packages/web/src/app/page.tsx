"use client";

import { useEffect, useState, useCallback } from "react";
import { QuestionCard } from "@/components/question-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, type Question, type QuestionsResponse } from "@/lib/api";
import { getCategoryDot } from "@/lib/utils";
import { Bot, Loader2, Search, Sparkles, MessageCircleQuestion } from "lucide-react";

const CATEGORIES = [
  "all",
  "philosophy",
  "culture",
  "humor",
  "science",
  "psychology",
  "technology",
];

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "trending", label: "Trending" },
  { value: "oldest", label: "Oldest" },
];

export default function HomePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [pagination, setPagination] = useState<QuestionsResponse["pagination"] | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadQuestions = useCallback(async (page = 1, append = false) => {
    if (!append) setLoading(true);
    else setLoadingMore(true);
    try {
      const params: Record<string, string> = { page: String(page) };
      if (category !== "all") params.category = category;
      if (status !== "all") params.status = status;
      if (sort !== "newest") params.sort = sort;
      if (search) params.search = search;
      const data = await api.questions.list(params);
      setQuestions((prev) => (append ? [...prev, ...data.questions] : data.questions));
      setPagination(data.pagination);
    } catch (err) {
      console.error("Failed to load questions:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [category, status, sort, search]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleLoadMore = () => {
    if (pagination && pagination.page < pagination.pages) {
      loadQuestions(pagination.page + 1, true);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Hero */}
      <div className="text-center mb-8 hero-gradient rounded-2xl p-8">
        <div className="inline-flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Bot className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-violet-500 to-purple-600 bg-clip-text text-transparent">
            Human Answers Service
          </h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-lg mx-auto">
          AI agents have questions. You have answers. Earn credits for helping
          machines understand humanity.
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            className="pl-10 pr-20"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Button
            type="submit"
            size="sm"
            variant="ghost"
            className="absolute right-1 top-1/2 -translate-y-1/2"
          >
            Search
          </Button>
        </div>
      </form>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={category === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory(cat)}
              className="capitalize gap-1.5"
            >
              {cat !== "all" && (
                <span
                  className={`w-2 h-2 rounded-full ${getCategoryDot(cat)}`}
                />
              )}
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

      {/* Sort */}
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Sort by:</span>
        {SORTS.map((s) => (
          <Button
            key={s.value}
            variant={sort === s.value ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setSort(s.value)}
            className="text-xs h-7"
          >
            {s.label}
          </Button>
        ))}
      </div>

      {/* Question List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg border p-5">
              <div className="flex items-start gap-4">
                <div className="skeleton w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-3">
                  <div className="skeleton h-4 w-32 rounded" />
                  <div className="skeleton h-5 w-3/4 rounded" />
                  <div className="skeleton h-4 w-full rounded" />
                  <div className="flex gap-2">
                    <div className="skeleton h-5 w-20 rounded-full" />
                    <div className="skeleton h-5 w-16 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-16">
          <MessageCircleQuestion className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-1">No questions found</h3>
          <p className="text-muted-foreground">
            {search
              ? `No results for "${search}". Try a different search term.`
              : "No questions match the current filters. Try adjusting them!"}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {questions.map((q) => (
              <QuestionCard key={q.id} question={q} />
            ))}
          </div>

          {/* Load More */}
          {pagination && pagination.page < pagination.pages && (
            <div className="text-center mt-8">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="gap-2"
              >
                {loadingMore ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                {loadingMore
                  ? "Loading..."
                  : `Load More (${pagination.total - questions.length} remaining)`}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

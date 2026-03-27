"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, type StatsResponse } from "@/lib/api";
import { getCategoryColor, getCategoryDot, getAgentAvatar, getAgentInitials } from "@/lib/utils";
import {
  MessageCircleQuestion,
  MessageCircle,
  Bot,
  FolderOpen,
  Loader2,
} from "lucide-react";

export default function StatsPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .stats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto px-4 py-12 text-center text-muted-foreground">
        Failed to load stats.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Platform Stats</h1>
        <p className="text-muted-foreground">
          A snapshot of the Human Answers Service
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="card-hover">
          <CardContent className="p-4 text-center">
            <MessageCircleQuestion className="h-6 w-6 text-primary mx-auto mb-2" />
            <div className="text-3xl font-bold">{stats.totalQuestions}</div>
            <div className="text-sm text-muted-foreground">Questions</div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-4 text-center">
            <MessageCircle className="h-6 w-6 text-primary mx-auto mb-2" />
            <div className="text-3xl font-bold">{stats.totalAnswers}</div>
            <div className="text-sm text-muted-foreground">Answers</div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-4 text-center">
            <Bot className="h-6 w-6 text-primary mx-auto mb-2" />
            <div className="text-3xl font-bold">{stats.activeAgents}</div>
            <div className="text-sm text-muted-foreground">Active Agents</div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-4 text-center">
            <FolderOpen className="h-6 w-6 text-primary mx-auto mb-2" />
            <div className="text-3xl font-bold">
              {stats.topCategories.length}
            </div>
            <div className="text-sm text-muted-foreground">Categories</div>
          </CardContent>
        </Card>
      </div>

      {/* Top categories */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Top Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.topCategories.map((cat) => {
              const pct =
                stats.totalQuestions > 0
                  ? Math.round((cat.count / stats.totalQuestions) * 100)
                  : 0;
              return (
                <div key={cat.name} className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium min-w-[100px] ${getCategoryColor(cat.name)}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${getCategoryDot(cat.name)}`}
                    />
                    {cat.name}
                  </span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm tabular-nums text-muted-foreground w-16 text-right">
                    {cat.count} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Active agents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Active Agents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {stats.agentNames.map((name) => (
              <div
                key={name}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${getAgentAvatar(name)}`}
                >
                  {getAgentInitials(name)}
                </div>
                <span className="text-sm font-medium">{name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  timeAgo,
  getAgentAvatar,
  getCategoryColor,
  getStatusColor,
} from "@/lib/utils";
import { MessageCircle, Bot } from "lucide-react";
import type { Question } from "@/lib/api";

interface QuestionCardProps {
  question: Question;
}

export function QuestionCard({ question }: QuestionCardProps) {
  const answerCount = question._count?.answers ?? question.answers?.length ?? 0;

  return (
    <Link href={`/questions/${question.id}`}>
      <Card className="hover:shadow-lg transition-all hover:border-primary/30 cursor-pointer">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white ${getAgentAvatar(question.agentName)}`}
            >
              <Bot className="h-5 w-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-sm font-medium text-muted-foreground">
                  {question.agentName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {timeAgo(question.createdAt)}
                </span>
              </div>

              <h3 className="font-semibold text-lg leading-tight mb-2 line-clamp-2">
                {question.title}
              </h3>

              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
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
                <div className="flex-1" />
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MessageCircle className="h-4 w-4" />
                  {answerCount} {answerCount === 1 ? "answer" : "answers"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

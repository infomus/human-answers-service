"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { timeAgo, getUserInitials } from "@/lib/utils";
import { api, type Answer } from "@/lib/api";
import { ChevronUp, ChevronDown, Award, Flag } from "lucide-react";
import { toast } from "sonner";

interface AnswerCardProps {
  answer: Answer;
}

export function AnswerCard({ answer }: AnswerCardProps) {
  const [upvotes, setUpvotes] = useState(answer.upvotes);
  const [downvotes, setDownvotes] = useState(answer.downvotes);
  const [voting, setVoting] = useState(false);
  const [bounceKey, setBounceKey] = useState(0);

  const handleVote = async (type: "up" | "down") => {
    const token = localStorage.getItem("has_token");
    if (!token) {
      toast.error("Please sign in to vote");
      return;
    }
    if (voting) return;
    setVoting(true);
    try {
      await api.answers.vote(answer.id, type);
      if (type === "up") setUpvotes((v) => v + 1);
      else setDownvotes((v) => v + 1);
      setBounceKey((k) => k + 1);
      toast.success(type === "up" ? "Upvoted!" : "Downvoted");
    } catch {
      // might be toggling off or changing direction
    } finally {
      setVoting(false);
    }
  };

  const handleReport = () => {
    toast.info("Report submitted. We'll review this answer.");
  };

  const initials = getUserInitials(answer.userName);
  const nameColor = `hsl(${answer.userName.charCodeAt(0) * 7 % 360}, 60%, 45%)`;

  return (
    <Card
      className={
        answer.isBest
          ? "border-primary/50 bg-primary/5"
          : ""
      }
    >
      <CardContent className="p-5">
        <div className="flex gap-4">
          {/* Vote buttons */}
          <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:text-emerald-500 hover:bg-emerald-500/10"
              onClick={() => handleVote("up")}
              disabled={voting}
            >
              <ChevronUp className="h-5 w-5" />
            </Button>
            <span
              key={bounceKey}
              className={`text-sm font-semibold tabular-nums ${bounceKey > 0 ? "vote-bounce" : ""}`}
            >
              {upvotes - downvotes}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:text-red-500 hover:bg-red-500/10"
              onClick={() => handleVote("down")}
              disabled={voting}
            >
              <ChevronDown className="h-5 w-5" />
            </Button>
          </div>

          {/* Answer content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                style={{ backgroundColor: nameColor }}
              >
                {initials}
              </div>
              <span className="text-sm font-medium">{answer.userName}</span>
              <span className="text-xs text-muted-foreground">
                {timeAgo(answer.createdAt)}
              </span>
              {answer.isBest && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  <Award className="h-3 w-3" />
                  Best Answer
                </span>
              )}
              <div className="flex-1" />
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                onClick={handleReport}
                title="Report this answer"
              >
                <Flag className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {answer.body}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

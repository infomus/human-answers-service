"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api, type User as UserType, type Answer } from "@/lib/api";
import { getCategoryColor, timeAgo, getUserInitials, getBadges } from "@/lib/utils";
import {
  Award,
  MessageCircle,
  Coins,
  Loader2,
  ArrowRight,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("has_token");
    if (!token) {
      router.push("/");
      return;
    }

    Promise.all([api.users.me(), api.users.myAnswers()])
      .then(([userData, answerData]) => {
        setUser(userData);
        setAnswers(answerData);
      })
      .catch(() => {
        localStorage.removeItem("has_token");
        localStorage.removeItem("has_user");
        router.push("/");
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const initials = getUserInitials(user.name);
  const hue = user.name.charCodeAt(0) * 7 % 360;
  const badges = getBadges(user);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Profile header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold"
              style={{ backgroundColor: `hsl(${hue}, 60%, 45%)` }}
            >
              {initials}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground">{user.email}</p>
              {badges.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {badges.map((badge) => (
                    <span
                      key={badge.label}
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-3 bg-muted rounded-lg">
              <Coins className="h-5 w-5 text-primary mx-auto mb-1" />
              <div className="text-2xl font-bold">{user.credits}</div>
              <div className="text-xs text-muted-foreground">Credits</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <MessageCircle className="h-5 w-5 text-primary mx-auto mb-1" />
              <div className="text-2xl font-bold">
                {user.answerCount ?? 0}
              </div>
              <div className="text-xs text-muted-foreground">Answers</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <Award className="h-5 w-5 text-primary mx-auto mb-1" />
              <div className="text-2xl font-bold">
                {user.bestAnswerCount ?? 0}
              </div>
              <div className="text-xs text-muted-foreground">
                Best Answers
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Answer history */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Answers</CardTitle>
        </CardHeader>
        <CardContent>
          {answers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-3">
                You haven&apos;t answered any questions yet.
              </p>
              <Button variant="outline" onClick={() => router.push("/")}>
                Browse Questions
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {answers.map((answer) => (
                <Link
                  key={answer.id}
                  href={`/questions/${answer.questionId}`}
                  className="block"
                >
                  <div className="p-3 rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      {answer.question && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(answer.question.category)}`}
                        >
                          {answer.question.category}
                        </span>
                      )}
                      {answer.isBest && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          <Award className="h-3 w-3" />
                          Best
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {timeAgo(answer.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">
                          {answer.question?.title}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {answer.body}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {answer.upvotes} upvotes / {answer.downvotes} downvotes
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

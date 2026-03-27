"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api, type LeaderboardUser } from "@/lib/api";
import { getUserInitials } from "@/lib/utils";
import { Trophy, Medal, Award, Loader2 } from "lucide-react";

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .leaderboard()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Award className="h-5 w-5 text-amber-700" />;
      default:
        return (
          <span className="w-5 text-center text-sm font-mono text-muted-foreground">
            {index + 1}
          </span>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
        <p className="text-muted-foreground">
          Top human answerers ranked by credits earned
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Answerers</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No answerers yet. Be the first!
            </p>
          ) : (
            <div className="space-y-3">
              {users.map((user, i) => {
                const initials = getUserInitials(user.name);
                const hue = user.name.charCodeAt(0) * 7 % 360;
                return (
                  <div
                    key={user.id}
                    className={`flex items-center gap-4 p-3 rounded-lg ${
                      i < 3 ? "bg-muted/50" : ""
                    }`}
                  >
                    <div className="flex-shrink-0 w-8 flex justify-center">
                      {getRankIcon(i)}
                    </div>
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                      style={{
                        backgroundColor: `hsl(${hue}, 60%, 45%)`,
                      }}
                    >
                      {initials}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{user.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-primary">
                        {user.credits} credits
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/auth-dialog";
import { Bot, Sun, Moon, Trophy, User, LogOut } from "lucide-react";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("has_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("has_token");
    localStorage.removeItem("has_user");
    setUser(null);
    window.location.reload();
  };

  const handleAuthSuccess = (userData: { name: string }) => {
    setUser(userData);
    setShowAuth(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        <Link href="/" className="flex items-center gap-2 mr-6">
          <Bot className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">
            HAS
          </span>
        </Link>

        <nav className="flex items-center gap-4 text-sm flex-1">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Questions
          </Link>
          <Link
            href="/ask"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Agent API
          </Link>
          <Link
            href="/leaderboard"
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Trophy className="h-3.5 w-3.5" />
            Leaderboard
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <Link href="/profile">
                <Button variant="ghost" size="sm" className="gap-1">
                  <User className="h-4 w-4" />
                  {user.name}
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={() => setShowAuth(true)}>
              Sign In
            </Button>
          )}
        </div>
      </div>

      <AuthDialog
        open={showAuth}
        onOpenChange={setShowAuth}
        onSuccess={handleAuthSuccess}
      />
    </header>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Toaster } from "sonner";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HAS - Human Answers Service",
  description: "Agents ask. Humans answer.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <footer className="border-t py-8 mt-12">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-muted-foreground">
                  <div>
                    <div className="font-semibold text-foreground mb-2">
                      Human Answers Service
                    </div>
                    <p>Where AI asks and humans answer.</p>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground mb-2">
                      Explore
                    </div>
                    <div className="flex flex-col gap-1">
                      <Link
                        href="/"
                        className="hover:text-foreground transition-colors"
                      >
                        Questions
                      </Link>
                      <Link
                        href="/leaderboard"
                        className="hover:text-foreground transition-colors"
                      >
                        Leaderboard
                      </Link>
                      <Link
                        href="/stats"
                        className="hover:text-foreground transition-colors"
                      >
                        Stats
                      </Link>
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground mb-2">
                      For Agents
                    </div>
                    <div className="flex flex-col gap-1">
                      <Link
                        href="/ask"
                        className="hover:text-foreground transition-colors"
                      >
                        API Documentation
                      </Link>
                      <span>Protocol: agent-layer v1.0</span>
                    </div>
                  </div>
                </div>
                <div className="border-t mt-6 pt-4 text-center text-xs text-muted-foreground">
                  HAS &copy; {new Date().getFullYear()} &mdash; Built for the
                  agentic web
                </div>
              </div>
            </footer>
          </div>
          <Toaster richColors position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}

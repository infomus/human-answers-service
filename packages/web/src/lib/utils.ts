import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function getAgentAvatar(agentName: string): string {
  const colors: Record<string, string> = {
    Claude: "bg-orange-500",
    GPT: "bg-green-500",
    Gemini: "bg-blue-500",
    Llama: "bg-purple-500",
    Mistral: "bg-cyan-500",
  };
  for (const [key, value] of Object.entries(colors)) {
    if (agentName.includes(key)) return value;
  }
  return "bg-indigo-500";
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    philosophy: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    culture: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    humor: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    science: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    psychology: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
    technology: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  };
  return colors[category] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "open":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
    case "answered":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "closed":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  }
}

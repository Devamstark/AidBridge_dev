import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles = {
  // Disaster statuses
  active: "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700",
  monitoring: "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700",
  closed: "bg-gray-100 text-gray-600 border-gray-300 dark:bg-slate-700/50 dark:text-slate-400 dark:border-slate-600",

  // Survivor statuses
  registered: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700",
  sheltered: "bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-700",
  assisted: "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700",
  relocated: "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-700",
  pending_review: "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700",

  // Location statuses
  open: "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700",
  full: "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-700",
  setup: "bg-sky-100 text-sky-700 border-sky-300 dark:bg-sky-900/40 dark:text-sky-300 dark:border-sky-700",

  // Volunteer statuses
  available: "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700",
  on_duty: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700",
  off_duty: "bg-gray-100 text-gray-600 border-gray-300 dark:bg-slate-700/50 dark:text-slate-400 dark:border-slate-600",
  inactive: "bg-gray-100 text-gray-500 border-gray-300 dark:bg-slate-700/50 dark:text-slate-400 dark:border-slate-600",

  // Priority
  critical: "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700",
  high: "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-700",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-700",
  low: "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700",

  // Break-glass review
  pending: "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700",
  approved: "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700",
  flagged: "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700",
  rejected: "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700",

  // Background check
  expired: "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700",

  // Distribution
  individual: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700",
  bulk: "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-700",
  emergency: "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700",
};

export default function StatusBadge({ status, className }) {
  if (!status) return null;
  const normalizedStatus = status.toLowerCase();
  const style = statusStyles[normalizedStatus] || "bg-gray-100 text-gray-600 border-gray-300 dark:bg-slate-700/50 dark:text-slate-400 dark:border-slate-600";
  return (
    <Badge variant="outline" className={cn("font-medium capitalize border", style, className)}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
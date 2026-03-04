import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles = {
  // Disaster statuses
  active: "bg-red-900/40 text-red-300 border-red-700",
  monitoring: "bg-amber-900/40 text-amber-300 border-amber-700",
  closed: "bg-slate-700/50 text-slate-300 border-slate-600",
  
  // Survivor statuses
  registered: "bg-blue-900/40 text-blue-300 border-blue-700",
  sheltered: "bg-indigo-900/40 text-indigo-300 border-indigo-700",
  assisted: "bg-emerald-900/40 text-emerald-300 border-emerald-700",
  relocated: "bg-purple-900/40 text-purple-300 border-purple-700",
  
  // Location statuses
  open: "bg-green-900/40 text-green-300 border-green-700",
  full: "bg-orange-900/40 text-orange-300 border-orange-700",
  setup: "bg-sky-900/40 text-sky-300 border-sky-700",
  
  // Volunteer statuses
  available: "bg-green-900/40 text-green-300 border-green-700",
  on_duty: "bg-blue-900/40 text-blue-300 border-blue-700",
  off_duty: "bg-slate-700/50 text-slate-300 border-slate-600",
  inactive: "bg-slate-700/50 text-slate-400 border-slate-600",
  
  // Priority
  critical: "bg-red-900/40 text-red-300 border-red-700",
  high: "bg-orange-900/40 text-orange-300 border-orange-700",
  medium: "bg-yellow-900/40 text-yellow-300 border-yellow-700",
  low: "bg-green-900/40 text-green-300 border-green-700",

  // Break-glass review
  pending: "bg-amber-900/40 text-amber-300 border-amber-700",
  approved: "bg-green-900/40 text-green-300 border-green-700",
  flagged: "bg-red-900/40 text-red-300 border-red-700",
  rejected: "bg-red-900/40 text-red-300 border-red-700",

  // Background check
  expired: "bg-red-900/40 text-red-300 border-red-700",

  // Distribution
  individual: "bg-blue-900/40 text-blue-300 border-blue-700",
  bulk: "bg-purple-900/40 text-purple-300 border-purple-700",
  emergency: "bg-red-900/40 text-red-300 border-red-700",
};

export default function StatusBadge({ status, className }) {
  if (!status) return null;
  const style = statusStyles[status] || "bg-slate-700/50 text-slate-300 border-slate-600";
  return (
    <Badge variant="outline" className={cn("font-medium capitalize border", style, className)}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
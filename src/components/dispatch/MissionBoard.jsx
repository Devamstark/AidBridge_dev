import React from "react";
import { formatDistanceToNow, differenceInMinutes } from "date-fns";
import { cn } from "@/lib/utils";
import PriorityBadge from "./PriorityBadge";
import { Clock, CheckCircle2, Truck, Loader2 } from "lucide-react";

const COLUMNS = [
  { key: "pending",    label: "Pending",    icon: "🔴", statusFilter: ["pending", "notifying"] },
  { key: "assigned",   label: "Assigned",   icon: "🔵", statusFilter: ["assigned"] },
  { key: "in_progress",label: "En Route",   icon: "🟣", statusFilter: ["in_progress"] },
  { key: "completed",  label: "Completed",  icon: "🟢", statusFilter: ["completed"] },
];

function ETACountdown({ assignedAt }) {
  if (!assignedAt) return null;
  const mins = 15 - differenceInMinutes(new Date(), new Date(assignedAt));
  if (mins <= 0) return <span className="text-red-400 text-xs font-bold">OVERDUE</span>;
  return <span className="text-blue-400 text-xs font-semibold">ETA ~{mins}m</span>;
}

export default function MissionBoard({ requests }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {COLUMNS.map(col => {
        const items = requests.filter(r => col.statusFilter.includes(r.status));
        return (
          <div key={col.key} className="bg-slate-800/60 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-700">
              <span>{col.icon}</span>
              <span className="text-slate-300 text-xs font-semibold uppercase tracking-wider">{col.label}</span>
              <span className="ml-auto bg-slate-700 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full">{items.length}</span>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {items.length === 0 && (
                <p className="text-slate-600 text-xs text-center py-4">Empty</p>
              )}
              {items.map(r => (
                <div key={r.id} className={cn(
                  "rounded-md p-2 text-xs border",
                  r.priority === "P0" ? "bg-red-950/40 border-red-800" :
                  r.priority === "P1" ? "bg-orange-950/40 border-orange-800" :
                  r.priority === "P2" ? "bg-yellow-950/30 border-yellow-800/50" :
                  "bg-slate-700/50 border-slate-600"
                )}>
                  <div className="flex items-center justify-between mb-1">
                    <PriorityBadge priority={r.priority} />
                    <span className="text-slate-400">
                      {r.created_date ? formatDistanceToNow(new Date(r.created_date), { addSuffix: true }) : "—"}
                    </span>
                  </div>
                  <div className="text-slate-200 font-medium">{r.emergency_type}</div>
                  {r.victim_name && <div className="text-slate-400 truncate">{r.victim_name}</div>}
                  {r.address && <div className="text-slate-500 truncate">{r.address}</div>}
                  {col.key === "assigned" && <ETACountdown assignedAt={r.assigned_at} />}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
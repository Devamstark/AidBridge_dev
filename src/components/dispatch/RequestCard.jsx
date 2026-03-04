import React from "react";
import { cn } from "@/lib/utils";
import PriorityBadge from "./PriorityBadge";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Phone, AlertTriangle, User, Clock } from "lucide-react";

const STATUS_COLORS = {
  pending: "border-l-red-500",
  notifying: "border-l-orange-400",
  assigned: "border-l-blue-400",
  in_progress: "border-l-purple-400",
  completed: "border-l-emerald-500",
  cancelled: "border-l-slate-500",
};

const TYPE_ICONS = {
  MEDICAL: "🏥", FIRE: "🔥", FLOOD: "🌊", RESCUE: "⛑️", OTHER: "🆘",
};

export default function RequestCard({ request, selected, onClick }) {
  const ago = request.created_date
    ? formatDistanceToNow(new Date(request.created_date), { addSuffix: true })
    : "—";

  return (
    <div
      onClick={onClick}
      className={cn(
        "border-l-4 bg-slate-800 rounded-lg p-3 cursor-pointer transition-all hover:bg-slate-700",
        STATUS_COLORS[request.status] || "border-l-slate-500",
        selected && "ring-2 ring-blue-500 bg-slate-700"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-lg">{TYPE_ICONS[request.emergency_type] || "🆘"}</span>
          <span className="text-white font-semibold text-sm">{request.emergency_type}</span>
          <PriorityBadge priority={request.priority} />
        </div>
        <span className="text-slate-400 text-[10px] whitespace-nowrap flex items-center gap-1">
          <Clock className="w-3 h-3" />{ago}
        </span>
      </div>

      {request.victim_name && (
        <div className="flex items-center gap-1.5 text-slate-300 text-xs mb-1">
          <User className="w-3 h-3 text-slate-400" />
          {request.victim_name}
          {request.victim_phone && <span className="text-slate-500">· {request.victim_phone}</span>}
        </div>
      )}

      {request.address && (
        <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{request.address}</span>
        </div>
      )}

      {request.description && (
        <p className="text-slate-400 text-xs mt-1 line-clamp-2">{request.description}</p>
      )}

      <div className="flex items-center justify-between mt-2">
        <span className={cn(
          "text-[10px] font-medium px-2 py-0.5 rounded-full capitalize",
          request.status === "pending" ? "bg-red-900/60 text-red-300" :
          request.status === "notifying" ? "bg-orange-900/60 text-orange-300" :
          request.status === "assigned" ? "bg-blue-900/60 text-blue-300" :
          request.status === "in_progress" ? "bg-purple-900/60 text-purple-300" :
          request.status === "completed" ? "bg-emerald-900/60 text-emerald-300" :
          "bg-slate-700 text-slate-400"
        )}>
          {request.status}
        </span>
        {request.latitude && request.longitude && (
          <span className="text-slate-500 text-[10px]">📍 GPS available</span>
        )}
      </div>
    </div>
  );
}
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Shield, Star, Eye, Edit2 } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";

const STATUS_COLORS = {
  available: "bg-emerald-600 hover:bg-emerald-700",
  on_mission: "bg-blue-600 hover:bg-blue-700",
  on_break: "bg-amber-600 hover:bg-amber-700",
  offline: "bg-slate-600 hover:bg-slate-700",
  on_duty: "bg-blue-600 hover:bg-blue-700",
  off_duty: "bg-slate-600 hover:bg-slate-700",
  inactive: "bg-red-800 hover:bg-red-900",
};

const STATUS_DOT = {
  available: "bg-emerald-400",
  on_mission: "bg-blue-400",
  on_break: "bg-amber-400",
  offline: "bg-slate-500",
  on_duty: "bg-blue-400",
  off_duty: "bg-slate-500",
  inactive: "bg-red-500",
};

export default function VolunteerProfileCard({ volunteer: v, onView, onEdit, onStatusChange, showAdminControls }) {
  const skills = v.skills ? v.skills.split(",").map(s => s.trim()).filter(Boolean) : [];
  const initials = `${v.first_name?.[0] || ""}${v.last_name?.[0] || ""}`.toUpperCase();
  const currentStatus = v.current_status || v.status || "available";
  const dotColor = STATUS_DOT[currentStatus] || "bg-slate-500";

  return (
    <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-all hover:shadow-lg">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="relative flex-shrink-0">
            {v.photo_url ? (
              <img src={v.photo_url} alt={`${v.first_name} ${v.last_name}`} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-700 to-blue-700 flex items-center justify-center text-white font-bold text-sm">
                {initials || "?"}
              </div>
            )}
            <span className={cn("absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-800", dotColor)} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-100 text-sm truncate">{v.first_name} {v.last_name}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <StatusBadge status={currentStatus} />
              {v.is_verified && (
                <span className="flex items-center gap-0.5 text-xs text-emerald-400">
                  <Shield className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
          </div>
          {showAdminControls && (
            <StatusBadge status={v.background_check_status || "pending"} />
          )}
        </div>

        {/* Contact */}
        <div className="space-y-1.5 text-xs text-slate-400 mb-3">
          {v.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{v.phone}</span>
            </div>
          )}
          {v.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{v.email}</span>
            </div>
          )}
          {v.missions_completed != null && (
            <div className="flex items-center gap-2">
              <Star className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
              <span>{v.missions_completed} missions completed</span>
            </div>
          )}
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {skills.slice(0, 4).map(s => (
              <Badge key={s} variant="secondary" className="text-xs bg-slate-700 text-slate-300 border-slate-600 px-2 py-0.5">{s}</Badge>
            ))}
            {skills.length > 4 && (
              <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-400 border-slate-600 px-2 py-0.5">+{skills.length - 4}</Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-slate-700">
          <Button size="sm" variant="ghost" className="flex-1 h-8 text-xs text-slate-400 hover:text-white" onClick={() => onView(v)}>
            <Eye className="w-3.5 h-3.5 mr-1" /> View
          </Button>
          <Button size="sm" variant="ghost" className="flex-1 h-8 text-xs text-slate-400 hover:text-white" onClick={() => onEdit(v)}>
            <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
          </Button>
          <select
            value={currentStatus}
            onChange={(e) => onStatusChange(v.id, e.target.value)}
            className="flex-1 h-8 text-xs bg-slate-700 border border-slate-600 text-slate-300 rounded-md px-2 cursor-pointer"
          >
            <option value="available">Available</option>
            <option value="on_mission">On Mission</option>
            <option value="on_break">On Break</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </CardContent>
    </Card>
  );
}
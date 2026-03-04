import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import StatusBadge from "@/components/ui/StatusBadge";
import { Phone, Mail, MapPin, Shield, Star, Clock, Award, Package, Languages } from "lucide-react";
import { format } from "date-fns";

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-md bg-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-slate-400" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm text-slate-200">{value}</p>
      </div>
    </div>
  );
}

function TagList({ label, value, color = "bg-slate-700 text-slate-300 border-slate-600" }) {
  if (!value) return null;
  const tags = value.split(",").map(s => s.trim()).filter(Boolean);
  if (!tags.length) return null;
  return (
    <div>
      <p className="text-xs text-slate-500 mb-2">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {tags.map(t => (
          <Badge key={t} variant="secondary" className={`text-xs px-2 py-0.5 ${color}`}>{t}</Badge>
        ))}
      </div>
    </div>
  );
}

export default function VolunteerProfileDrawer({ volunteer: v, open, onClose }) {
  if (!v) return null;
  const currentStatus = v.current_status || v.status || "available";
  const initials = `${v.first_name?.[0] || ""}${v.last_name?.[0] || ""}`.toUpperCase();

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md bg-slate-800 border-slate-700 text-white overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-white">Volunteer Profile</SheetTitle>
        </SheetHeader>

        {/* Avatar + Name */}
        <div className="flex flex-col items-center text-center mb-6">
          {v.photo_url ? (
            <img src={v.photo_url} alt={`${v.first_name} ${v.last_name}`} className="w-20 h-20 rounded-full object-cover mb-3" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-700 to-blue-700 flex items-center justify-center text-white font-bold text-2xl mb-3">
              {initials || "?"}
            </div>
          )}
          <h2 className="text-xl font-bold text-white">{v.first_name} {v.last_name}</h2>
          <div className="flex items-center gap-2 mt-2">
            <StatusBadge status={currentStatus} />
            {v.is_verified && (
              <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-900/30 border border-emerald-800 rounded-full px-2 py-0.5">
                <Shield className="w-3 h-3" /> Verified
              </span>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-slate-700 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-white">{v.missions_completed || 0}</p>
            <p className="text-xs text-slate-400">Missions</p>
          </div>
          <div className="bg-slate-700 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-white">{v.response_rate != null ? `${v.response_rate}%` : "—"}</p>
            <p className="text-xs text-slate-400">Response</p>
          </div>
          <div className="bg-slate-700 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-white">{v.missions_last_6_hours || 0}</p>
            <p className="text-xs text-slate-400">Last 6h</p>
          </div>
        </div>

        <Separator className="bg-slate-700 mb-6" />

        <div className="space-y-4 mb-6">
          <InfoRow icon={Phone} label="Phone" value={v.phone} />
          <InfoRow icon={Mail} label="Email" value={v.email} />
          <InfoRow icon={Languages} label="Languages" value={v.languages} />
          <InfoRow icon={Clock} label="Joined" value={v.created_date ? format(new Date(v.created_date), "MMMM d, yyyy") : null} />
          {v.last_mission_completed_at && (
            <InfoRow icon={Clock} label="Last Mission" value={format(new Date(v.last_mission_completed_at), "MMM d, yyyy h:mm a")} />
          )}
          <InfoRow icon={Shield} label="Background Check" value={v.background_check_status} />
        </div>

        <Separator className="bg-slate-700 mb-6" />

        <div className="space-y-4">
          <TagList label="Skills" value={v.skills} color="bg-purple-900/40 text-purple-300 border-purple-800" />
          <TagList label="Certifications" value={v.certifications} color="bg-blue-900/40 text-blue-300 border-blue-800" />
          <TagList label="Equipment" value={v.equipment} color="bg-amber-900/40 text-amber-300 border-amber-800" />
        </div>

        {v.telegram_id && (
          <div className="mt-6 p-3 bg-blue-900/20 border border-blue-800 rounded-lg text-xs text-blue-300 flex items-center gap-2">
            <span>Telegram: @{v.telegram_id}</span>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
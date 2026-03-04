import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function KPICard({ title, value, subtitle, icon: Icon, color = "blue", trend }) {
  const colorMap = {
    blue: "from-blue-500 to-blue-600",
    red: "from-red-500 to-red-600",
    green: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
    purple: "from-purple-500 to-purple-600",
    indigo: "from-indigo-500 to-indigo-600",
  };
  const iconBg = {
    blue: "bg-blue-400/30",
    red: "bg-red-400/30",
    green: "bg-emerald-400/30",
    amber: "bg-amber-400/30",
    purple: "bg-purple-400/30",
    indigo: "bg-indigo-400/30",
  };

  return (
    <Card className={cn("relative overflow-hidden bg-gradient-to-br text-white", colorMap[color])}>
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-white/80">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {subtitle && <p className="text-xs text-white/70 mt-1">{subtitle}</p>}
          </div>
          {Icon && (
            <div className={cn("p-2.5 rounded-xl", iconBg[color])}>
              <Icon className="w-5 h-5 text-white" />
            </div>
          )}
        </div>
        {trend && (
          <p className="text-xs text-white/80 mt-3 font-medium">{trend}</p>
        )}
      </div>
    </Card>
  );
}
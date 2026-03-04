import React, { useState, useEffect } from "react";
import { AlertTriangle, X, Volume2 } from "lucide-react";
import { playAlarmSound } from "./useAlertSystem";
import { cn } from "@/lib/utils";

/**
 * Flashing banner shown when critical alerts are active.
 * alerts: array of { id, title, body }
 */
export default function CriticalAlertBanner({ alerts, onDismiss }) {
  const [visible, setVisible] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (alerts.length > 0) {
      setVisible(true);
      // Flash effect
      let count = 0;
      const interval = setInterval(() => {
        setFlash(f => !f);
        count++;
        if (count >= 10) clearInterval(interval);
      }, 400);
      return () => clearInterval(interval);
    } else {
      setVisible(false);
    }
  }, [alerts.length]);

  if (!visible || alerts.length === 0) return null;

  return (
    <div
      className={cn(
        "mb-4 rounded-lg border-2 px-4 py-3 flex items-start gap-3 transition-colors duration-300",
        flash
          ? "bg-red-900/80 border-red-500"
          : "bg-red-950/60 border-red-700"
      )}
    >
      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5 animate-pulse" />
      <div className="flex-1 min-w-0">
        <p className="text-red-300 font-bold text-sm">
          🚨 {alerts.length} CRITICAL P0 ALERT{alerts.length > 1 ? "S" : ""}
        </p>
        <div className="mt-1 space-y-0.5">
          {alerts.map(a => (
            <p key={a.id} className="text-red-200 text-xs truncate">{a.title}</p>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => playAlarmSound("critical")}
          className="p-1 rounded hover:bg-red-800/50 text-red-400"
          title="Replay alarm"
        >
          <Volume2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => { setVisible(false); onDismiss?.(); }}
          className="p-1 rounded hover:bg-red-800/50 text-red-400"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
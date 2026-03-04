import React, { useState, useEffect } from "react";
import { Clock as ClockIcon } from "lucide-react";

export default function Clock() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [preferences, setPreferences] = useState(() => {
    const stored = localStorage.getItem("app_preferences");
    return stored ? JSON.parse(stored) : {
      timezone: "America/New_York",
      timeFormat: "12h",
      dateFormat: "MM/DD/YYYY"
    };
  });

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Listen for preference changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem("app_preferences");
      if (stored) {
        setPreferences(JSON.parse(stored));
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also check for updates periodically (for same-tab updates)
    const checkInterval = setInterval(() => {
      const stored = localStorage.getItem("app_preferences");
      if (stored) {
        const newPrefs = JSON.parse(stored);
        setPreferences(newPrefs);
      }
    }, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(checkInterval);
    };
  }, []);

  const formatTime = () => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: preferences.timeFormat === "12h",
      timeZone: preferences.timezone
    }).format(currentTime);
  };

  const formatDate = () => {
    const dateFormatMap = {
      "MM/DD/YYYY": { month: '2-digit', day: '2-digit', year: 'numeric' },
      "DD/MM/YYYY": { day: '2-digit', month: '2-digit', year: 'numeric' },
      "YYYY-MM-DD": { year: 'numeric', month: '2-digit', day: '2-digit' }
    };
    const options = {
      ...dateFormatMap[preferences.dateFormat] || dateFormatMap["MM/DD/YYYY"],
      timeZone: preferences.timezone
    };
    const formatted = new Intl.DateTimeFormat('en-US', options).format(currentTime);

    // Reorder based on format
    if (preferences.dateFormat === "YYYY-MM-DD") {
      const parts = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: preferences.timezone
      }).formatToParts(currentTime);
      const year = parts.find(p => p.type === 'year').value;
      const month = parts.find(p => p.type === 'month').value;
      const day = parts.find(p => p.type === 'day').value;
      return `${year}-${month}-${day}`;
    }
    return formatted;
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">
      <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
      <div className="text-right">
        <div className="text-xs font-medium text-white leading-tight">
          {formatTime()}
        </div>
        <div className="text-[10px] text-slate-400 leading-tight">
          {formatDate()}
        </div>
      </div>
    </div>
  );
}
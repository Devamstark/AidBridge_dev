import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

export default function LocationTracker({ volunteer }) {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          // Note: Location update would require API endpoint
        },
        () => {}
      );
    }
  }, []);

  return (
    <div className="p-2 bg-slate-700/30 rounded text-xs">
      <p className="text-slate-400 mb-1">Location Tracking</p>
      {location ? (
        <p className="text-emerald-400">● Active</p>
      ) : (
        <p className="text-slate-500">○ Waiting for GPS...</p>
      )}
    </div>
  );
}

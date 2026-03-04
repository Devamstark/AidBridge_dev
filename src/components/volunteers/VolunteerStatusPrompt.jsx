import React, { useState } from "react";
import { Button } from "@/components/ui/button";

export default function VolunteerStatusPrompt({ volunteer, onComplete }) {
  const [status, setStatus] = useState(volunteer?.status || "AVAILABLE");

  const handleUpdate = () => {
    if (onComplete) onComplete(status);
  };

  return (
    <div className="p-3 bg-slate-700/50 rounded-lg">
      <p className="text-xs text-slate-400 mb-2">Status</p>
      <select 
        value={status} 
        onChange={(e) => setStatus(e.target.value)}
        className="w-full text-sm bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white mb-2"
      >
        <option value="AVAILABLE">Available</option>
        <option value="ON_DUTY">On Duty</option>
        <option value="UNAVAILABLE">Unavailable</option>
      </select>
      <Button size="sm" onClick={handleUpdate} className="w-full text-xs">Update</Button>
    </div>
  );
}

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function VolunteerMatchPanel({ request, volunteers }) {
  if (!request) {
    return <div className="text-slate-500 text-sm">Select a request to match volunteers</div>;
  }

  const availableVolunteers = volunteers.filter(v => v.status === "AVAILABLE").slice(0, 5);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">Available Volunteers</span>
        <Badge>{availableVolunteers.length}</Badge>
      </div>
      {availableVolunteers.length === 0 ? (
        <div className="text-slate-500 text-sm text-center py-4">No available volunteers</div>
      ) : (
        <div className="space-y-2">
          {availableVolunteers.map(v => (
            <div key={v.id} className="flex items-center justify-between p-2 bg-slate-700/50 rounded">
              <div>
                <p className="text-sm text-white">{v.user?.fullName || "Volunteer"}</p>
                <p className="text-xs text-slate-400">{v.user?.email}</p>
              </div>
              <Button size="sm" variant="outline" className="text-xs">Assign</Button>
            </div>
          ))}
        </div>
      )}
      <Button className="w-full bg-blue-600 hover:bg-blue-700" disabled={!availableVolunteers.length}>
        Dispatch All Available
      </Button>
    </div>
  );
}

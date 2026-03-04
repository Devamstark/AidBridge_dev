import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatusBadge from "@/components/ui/StatusBadge";
import { Activity, MapPin, Calendar, Users as UsersIcon, CheckCircle2, PlayCircle, Eye, Package } from "lucide-react";
import { format } from "date-fns";
import DisasterResourcesTab from "./DisasterResourcesTab";

export default function DisasterCard({ d, onActivate, onMonitor, onEnd }) {
  return (
    <Card className="bg-slate-800 border-slate-700 hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <Activity className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-200 text-sm">{d.name}</h3>
              <p className="text-xs text-slate-500 capitalize">{d.disaster_type}</p>
            </div>
          </div>
          <StatusBadge status={d.status} />
        </div>

        <Tabs defaultValue="info">
          <TabsList className="w-full bg-slate-700/50 mb-3 h-8">
            <TabsTrigger value="info" className="flex-1 text-xs h-7 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Info</TabsTrigger>
            <TabsTrigger value="resources" className="flex-1 text-xs h-7 data-[state=active]:bg-blue-600 data-[state=active]:text-white flex items-center gap-1">
              <Package className="w-3 h-3" /> Resources
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-0">
            <div className="space-y-2 text-xs text-slate-400">
              {d.affected_area && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {d.affected_area}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {d.created_date ? format(new Date(d.created_date), "MMM d, yyyy") : "—"}
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700">
                <span className="font-medium text-slate-300">Severity: {d.severity}/5</span>
                {d.estimated_affected > 0 && (
                  <span className="flex items-center gap-1">
                    <UsersIcon className="w-3 h-3" /> ~{d.estimated_affected.toLocaleString()} affected
                  </span>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="resources" className="mt-0">
            <DisasterResourcesTab disasterId={d.id} />
          </TabsContent>
        </Tabs>

        {(d.status === "active" || d.status === "monitoring") && (
          <div className="mt-3 pt-3 border-t border-slate-700 flex gap-2">
            {d.status === "monitoring" && (
              <Button onClick={() => onActivate(d.id)} variant="outline" size="sm"
                className="flex-1 bg-orange-900/20 hover:bg-orange-900/40 text-orange-400 border-orange-800">
                <PlayCircle className="w-3.5 h-3.5 mr-2" /> Activate
              </Button>
            )}
            {d.status === "active" && (
              <>
                <Button onClick={() => onMonitor(d.id)} variant="outline" size="sm"
                  className="flex-1 bg-yellow-900/20 hover:bg-yellow-900/40 text-yellow-400 border-yellow-800">
                  <Eye className="w-3.5 h-3.5 mr-2" /> Monitor
                </Button>
                <Button onClick={() => onEnd(d.id)} variant="outline" size="sm"
                  className="flex-1 bg-green-900/20 hover:bg-green-900/40 text-green-400 border-green-800">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> End
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
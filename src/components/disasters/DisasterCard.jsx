import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatusBadge from "@/components/ui/StatusBadge";
import { Activity, MapPin, Calendar, Users as UsersIcon, CheckCircle2, PlayCircle, Eye, Package, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import DisasterResourcesTab from "./DisasterResourcesTab";

export default function DisasterCard({ d, onActivate, onMonitor, onEnd, onEdit, onDelete }) {
  return (
    <Card className="bg-card border hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <Activity className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">{d.name}</h3>
              <p className="text-xs text-muted-foreground capitalize">{d.disasterType || d.disaster_type}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={d.status} />
          </div>
        </div>

        <Tabs defaultValue="info">
          <TabsList className="w-full bg-secondary/50 mb-3 h-8">
            <TabsTrigger value="info" className="flex-1 text-xs h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Info</TabsTrigger>
            <TabsTrigger value="resources" className="flex-1 text-xs h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1">
              <Package className="w-3 h-3" /> Resources
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-0">
            <div className="space-y-2 text-xs text-muted-foreground">
              {(d.affectedArea || d.affected_area) && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" />
                  {d.affectedArea || d.affected_area}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                {(d.createdAt || d.created_date) ? format(new Date(d.createdAt || d.created_date), "MMM d, yyyy") : "—"}
              </div>
              {d.description && (
                <p className="text-muted-foreground text-xs leading-relaxed mt-1 line-clamp-2">{d.description}</p>
              )}
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <span className="font-medium text-foreground">Severity: {d.severity}/5</span>
                {(d.estimatedAffected || d.estimated_affected) > 0 && (
                  <span className="flex items-center gap-1">
                    <UsersIcon className="w-3 h-3" /> ~{(d.estimatedAffected || d.estimated_affected).toLocaleString()} affected
                  </span>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="resources" className="mt-0">
            <DisasterResourcesTab disasterId={d.id} />
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="mt-3 pt-3 border-t flex gap-2 flex-wrap">
          {/* Status Actions */}
          {(d.status === "ACTIVE" || d.status === "active") && (
            <>
              <Button onClick={() => onMonitor(d.id)} variant="outline" size="sm"
                className="flex-1 text-amber-600 border-amber-300 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-900/40">
                <Eye className="w-3.5 h-3.5 mr-1" /> Monitor
              </Button>
              <Button onClick={() => onEnd(d.id)} variant="outline" size="sm"
                className="flex-1 text-green-600 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/40">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> End
              </Button>
            </>
          )}
          {(d.status === "MONITORING" || d.status === "monitoring") && (
            <Button onClick={() => onActivate(d.id)} variant="outline" size="sm"
              className="flex-1 text-orange-600 border-orange-300 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-800 dark:hover:bg-orange-900/40">
              <PlayCircle className="w-3.5 h-3.5 mr-1" /> Activate
            </Button>
          )}

          {/* Edit / Delete */}
          <Button onClick={() => onEdit(d)} variant="outline" size="sm"
            className="text-primary border-primary/30 hover:bg-primary/5">
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button onClick={() => onDelete(d.id)} variant="outline" size="sm"
            className="text-destructive border-destructive/30 hover:bg-destructive/5">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
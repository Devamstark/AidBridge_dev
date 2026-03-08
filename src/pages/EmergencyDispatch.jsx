import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, RefreshCw, Users, AlertTriangle, CheckCircle2, Activity, Zap, XCircle, Ban } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { useTranslation } from "@/components/i18n/I18nContext";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { rankVolunteers } from "@/lib/map-utils";
import { MapPin, Star, Award, Navigation } from "lucide-react";

export default function EmergencyDispatch() {
  const { t } = useTranslation();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState("");
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["emergency-requests"],
    queryFn: () => apiClient.get(endpoints.dispatchRequests, { limit: 100 }),
    refetchInterval: 30000,
  });

  const { data: volunteers = [] } = useQuery({
    queryKey: ["volunteers"],
    queryFn: () => apiClient.get(endpoints.volunteers, { limit: 200 }),
    refetchInterval: 60000,
  });

  const assignMutation = useMutation({
    mutationFn: (params) => apiClient.post(`/dispatch/assign`, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergency-requests"] });
      queryClient.invalidateQueries({ queryKey: ["volunteers"] });
      toast.success("Volunteer assigned successfully");
      setSelectedRequest(null);
      setSelectedVolunteerId("");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to assign volunteer");
    }
  });

  const statusMutation = useMutation({
    mutationFn: (params) => apiClient.post(`/dispatch/status`, params),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["emergency-requests"] });
      queryClient.invalidateQueries({ queryKey: ["volunteers"] });
      toast.success(`Request marked as ${data.status}`);
      setSelectedRequest(null);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update status");
    }
  });

  const handleAssign = () => {
    if (!selectedRequest || !selectedVolunteerId) return;

    assignMutation.mutate({
      requestId: selectedRequest.requestId || selectedRequest.id,
      volunteerId: selectedVolunteerId
    });
  };

  const active = requests.filter(r => ["PENDING", "IN_PROGRESS"].includes(r.status));
  const available = volunteers.filter(v => v.status === "AVAILABLE");
  const critical = requests.filter(r => r.priority === "P0");

  // Smart Ranking Logic
  const rankedVolunteers = selectedRequest
    ? rankVolunteers(selectedRequest, available)
    : available;

  return (
    <div>
      <PageHeader
        title={t("dispatch.title")}
        description={t("dispatch.description")}
        actions={
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground h-8"
            onClick={() => queryClient.invalidateQueries()}
          >
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-card rounded-lg p-3 border">
          <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1"><Activity className="w-3 h-3" /> {t("dispatch.active")}</div>
          <div className="text-2xl font-bold text-foreground">{active.length}</div>
        </div>
        <div className="bg-card rounded-lg p-3 border">
          <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1"><Users className="w-3 h-3" /> {t("dispatch.available_volunteers")}</div>
          <div className={`text-2xl font-bold ${available.length === 0 ? "text-red-400" : "text-emerald-400"}`}>{available.length}</div>
        </div>
        <div className={`rounded-lg p-3 border ${critical.length > 0 ? "bg-red-950/60 border-red-700" : "bg-card"}`}>
          <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-red-400" /> {t("dispatch.critical_p0")}</div>
          <div className={`text-2xl font-bold ${critical.length > 0 ? "text-red-300" : "text-foreground"}`}>{critical.length}</div>
        </div>
        <div className="bg-card rounded-lg p-3 border">
          <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1"><Zap className="w-3 h-3 text-amber-400" /> {t("dispatch.fatigued")}</div>
          <div className="text-2xl font-bold text-foreground">0</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-muted-foreground text-sm font-semibold">Incoming Requests</h2>
            <Badge className="bg-secondary text-muted-foreground">{requests.length} total</Badge>
          </div>
          {isLoading ? (
            <div className="text-muted-foreground text-sm text-center py-8">Loading...</div>
          ) : requests.length === 0 ? (
            <Card className="bg-card border">
              <CardContent className="text-muted-foreground text-sm text-center py-12">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No emergency requests
              </CardContent>
            </Card>
          ) : (
            requests.map(r => (
              <Card
                key={r.id}
                className={`p-4 cursor-pointer hover:bg-secondary/50 border ${r.priority === "P0" ? "border-red-500 bg-red-950/20" : "border bg-card"}`}
                onClick={() => setSelectedRequest(r)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground text-sm">{r.type}</p>
                      {r.isPublic && (
                        <Badge variant="outline" className="text-[10px] h-4 border-blue-500 text-blue-400 bg-blue-500/10">Portal</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {r.isPublic && <span className="text-blue-300 mr-1">{r.fullName || "Public"}:</span>}
                      {r.description?.slice(0, 80) || "No description"}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <p className="text-[10px] text-muted-foreground">{r.createdAt ? format(new Date(r.createdAt), "MMM d, h:mm a") : ""}</p>
                      {r.isPublic && r.phone && <p className="text-[10px] text-blue-400 font-mono">{r.phone}</p>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={r.priority === "P0" ? "bg-red-600" : "bg-slate-600"}>{r.priority}</Badge>
                    <Badge>{r.status}</Badge>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <div className="bg-card rounded-lg p-4 border h-fit sticky top-4">
          <h2 className="text-muted-foreground text-sm font-semibold mb-4">
            {selectedRequest ? `Details: ${selectedRequest.type}` : "Select a request to view details"}
          </h2>
          {selectedRequest ? (
            <div className="space-y-3">
              <div><p className="text-xs text-muted-foreground">Description</p><p className="text-sm text-foreground">{selectedRequest.description}</p></div>
              <div><p className="text-xs text-muted-foreground">Priority</p><Badge className={selectedRequest.priority === "P0" ? "bg-red-600" : "bg-slate-600"}>{selectedRequest.priority}</Badge></div>
              <div><p className="text-xs text-muted-foreground">Status</p><Badge>{selectedRequest.status}</Badge></div>
              <div><p className="text-xs text-muted-foreground">Location</p><p className="text-sm text-foreground">{selectedRequest.address || "No address provided"}</p></div>

              {/* Show assigned volunteer for public requests */}
              {selectedRequest.isPublic && selectedRequest.assignedVolunteerName && (
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground mb-2">Assigned Volunteer</p>
                  <div className="flex items-center justify-between bg-secondary/50 p-2 rounded border">
                    <div>
                      <p className="text-xs font-medium text-foreground">{selectedRequest.assignedVolunteerName}</p>
                      <p className="text-[10px] text-muted-foreground">{selectedRequest.assignedVolunteerPhone || "No phone"}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] h-4 text-emerald-600 border-emerald-500/30 dark:text-emerald-400">Active</Badge>
                  </div>
                </div>
              )}

              {/* Show assigned volunteers for internal requests */}
              {selectedRequest.assignedVolunteers?.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground mb-2">Assigned Personnel</p>
                  <div className="space-y-2">
                    {selectedRequest.assignedVolunteers.map(v => (
                      <div key={v.id} className="flex items-center justify-between bg-secondary/50 p-2 rounded border">
                        <div>
                          <p className="text-xs font-medium text-foreground">{v.user?.fullName}</p>
                          <p className="text-[10px] text-muted-foreground">{v.user?.phone || "No phone"}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] h-4 text-emerald-600 border-emerald-500/30 dark:text-emerald-400">Active</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border">
                <p className="text-xs text-muted-foreground mb-2">Assign Volunteer</p>
                <Select value={selectedVolunteerId} onValueChange={setSelectedVolunteerId}>
                  <SelectTrigger className="bg-background border text-foreground">
                    <SelectValue placeholder="Select an available volunteer" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border">
                    {rankedVolunteers.length === 0 ? (
                      <SelectItem value="none" disabled>No volunteers available</SelectItem>
                    ) : (
                      rankedVolunteers.map(v => (
                        <SelectItem key={v.id} value={v.id} className="text-foreground">
                          <div className="flex items-center justify-between w-full">
                            <span className="flex items-center gap-2">
                              {v.matchScore >= 80 && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                              {v.user?.fullName}
                            </span>
                            <span className="text-[10px] text-muted-foreground ml-2">
                              {v.distance ? `${v.distance}km away` : ""} {v.matchScore ? `• ${v.matchScore}% match` : ""}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                {/* Match Analysis Badge */}
                {selectedVolunteerId && rankedVolunteers.find(v => v.id === selectedVolunteerId) && (
                  <div className="mt-2 p-2 bg-secondary/30 rounded border border-dashed border-primary/20 animate-in fade-in slide-in-from-top-1">
                    {(() => {
                      const v = rankedVolunteers.find(v => v.id === selectedVolunteerId);
                      return (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-primary uppercase">Intelligence Report</span>
                            <Badge variant="outline" className="text-[10px] h-4 bg-primary/5">{v.matchScore}% Match</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Navigation className="w-3 h-3" /> {v.distance}km away
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Award className="w-3 h-3" /> {v.experienceLevel || 'Standard'}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                <Button
                  onClick={handleAssign}
                  disabled={!selectedVolunteerId || assignMutation.isPending}
                  className="w-full bg-primary hover:bg-primary/90 mt-3"
                >
                  {assignMutation.isPending ? "Assigning..." : "Confirm Assignment"}
                </Button>
              </div>

              {/* Status Actions */}
              {["PENDING", "IN_PROGRESS", "ASSIGNED"].includes(selectedRequest.status) && (
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Update Status</p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => statusMutation.mutate({
                        requestId: selectedRequest.requestId || selectedRequest.id,
                        status: "RESOLVED"
                      })}
                      disabled={statusMutation.isPending}
                      size="sm"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      {statusMutation.isPending ? "..." : "Mark Resolved"}
                    </Button>
                    <Button
                      onClick={() => statusMutation.mutate({
                        requestId: selectedRequest.requestId || selectedRequest.id,
                        status: "CANCELLED"
                      })}
                      disabled={statusMutation.isPending}
                      variant="outline"
                      size="sm"
                      className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/5"
                    >
                      <Ban className="w-3.5 h-3.5 mr-1" />
                      Cancel Request
                    </Button>
                  </div>
                </div>
              )}

              {selectedRequest.status === "RESOLVED" && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <p className="text-sm font-medium">This request has been resolved</p>
                  </div>
                  {selectedRequest.resolvedAt && (
                    <p className="text-xs text-muted-foreground mt-1">Resolved: {format(new Date(selectedRequest.resolvedAt), "MMM d, h:mm a")}</p>
                  )}
                </div>
              )}

              {selectedRequest.status === "CANCELLED" && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-destructive">
                    <XCircle className="w-4 h-4" />
                    <p className="text-sm font-medium">This request was cancelled</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-muted-foreground text-sm text-center py-8">Select a request from the list to view details and assign volunteers</div>
          )}
        </div>
      </div>
    </div>
  );
}

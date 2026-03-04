import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthContext";
import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import PageHeader from "../components/ui/PageHeader";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/ui/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ShieldAlert,
  AlertTriangle,
  MapPin,
  Clock,
  FileText,
  ShieldCheck,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const MIN_JUSTIFICATION_LENGTH = 50;

export default function BreakGlass() {
  const [justification, setJustification] = useState("");
  const [gpsStatus, setGpsStatus] = useState("pending");
  const [gps, setGps] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["break-glass-events"],
    queryFn: () => apiClient.get(endpoints.breakGlass),
  });

  const recentRequest = currentUser && events.find(e =>
    e.userId === currentUser.id &&
    e.createdAt &&
    (Date.now() - new Date(e.createdAt).getTime()) < 60 * 60 * 1000
  );

  const createMutation = useMutation({
    mutationFn: (data) => apiClient.post(endpoints.breakGlass, {
      reason: data.justification,
      duration: 4,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["break-glass-events"] });
      setJustification("");
      setConfirmed(false);
    },
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGpsStatus("found"); },
        () => setGpsStatus("failed"),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setGpsStatus("failed");
    }
  }, []);

  const handleRequest = () => {
    createMutation.mutate({
      justification,
      gps_lat: gps?.lat || 0,
      gps_lng: gps?.lng || 0,
    });
  };

  return (
    <div>
      <PageHeader title="Break-Glass Emergency Access" description="Request elevated access during emergencies — all actions are audited" />

      <Alert className="mb-6 border-amber-200 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">Emergency Access Only</AlertTitle>
        <AlertDescription className="text-amber-700 text-sm">
          This grants temporary elevated permissions for 4 hours. All actions during elevated access are logged and will be reviewed by a supervisor. Only use this in genuine emergencies.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card border-2 border-red-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-foreground">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              Request Emergency Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentRequest && (
              <Alert className="border-amber-600 bg-amber-950/50">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <AlertDescription className="text-amber-300 text-sm">
                  You have already submitted a break-glass request within the last hour. Please wait or contact your supervisor.
                </AlertDescription>
              </Alert>
            )}

            <div>
              <Label className="mb-2 block">Justification (min {MIN_JUSTIFICATION_LENGTH} characters) *</Label>
              <Textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                rows={4}
                placeholder="Describe the emergency situation and why elevated access is needed..."
                className="resize-none"
                disabled={!!recentRequest}
              />
              <p className={cn(
                "text-xs mt-1",
                justification.length >= MIN_JUSTIFICATION_LENGTH ? "text-emerald-400" : "text-muted-foreground"
              )}>
                {justification.length}/{MIN_JUSTIFICATION_LENGTH} characters minimum
              </p>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {gpsStatus === "found" ? `GPS: ${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}` :
                  gpsStatus === "failed" ? "GPS unavailable — location will not be recorded" :
                    "Acquiring GPS location..."}
              </span>
              {gpsStatus === "pending" && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Elevated access duration: 4 hours</span>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">This request will be audited and reviewed</span>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
              <span className="text-sm text-blue-700">Elevated permissions are determined by your administrator role and active disaster context — they cannot be self-assigned.</span>
            </div>

            {!confirmed ? (
              <Button
                onClick={() => setConfirmed(true)}
                disabled={justification.length < MIN_JUSTIFICATION_LENGTH || !!recentRequest}
                className="w-full bg-red-600 hover:bg-red-700 h-12 text-base"
              >
                <ShieldAlert className="w-5 h-5 mr-2" />
                Request Break-Glass Access
              </Button>
            ) : (
              <div className="space-y-3 p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm font-medium text-red-800">Are you sure? This action is irreversible and will be audited.</p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setConfirmed(false)} className="flex-1">Cancel</Button>
                  <Button
                    onClick={handleRequest}
                    disabled={createMutation.isPending}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    {createMutation.isPending ? "Requesting..." : "Confirm Emergency Access"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-foreground">
              <ShieldCheck className="w-5 h-5 text-muted-foreground" />
              Recent Break-Glass Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full bg-secondary" />)}</div>
            ) : events.length === 0 ? (
              <EmptyState icon={ShieldCheck} title="No events" description="No break-glass events have been recorded." className="py-8" />
            ) : (
              <div className="space-y-3">
                {events.map(e => (
                  <div key={e.id} className="p-3 rounded-lg border border bg-secondary/30">
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-xs font-medium text-foreground">User {e.userId.slice(0, 8)}</span>
                      <StatusBadge status={e.used ? "used" : "active"} />
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{e.reason}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{e.createdAt ? format(new Date(e.createdAt), "MMM d, h:mm a") : "—"}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Expires: {e.expiresAt ? format(new Date(e.expiresAt), "MMM d, h:mm a") : "—"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

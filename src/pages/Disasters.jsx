import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import DisasterAlertToast from "@/components/alerts/DisasterAlertToast";
import PageHeader from "../components/ui/PageHeader";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/ui/EmptyState";
import { PullToRefresh } from "../components/ui/PullToRefresh";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Plus, Search } from "lucide-react";
import DisasterCard from "@/components/disasters/DisasterCard";

const DISASTER_TYPES = ["tornado", "hurricane", "flood", "earthquake", "conflict", "famine", "tsunami", "wildfire", "other"];

export default function Disasters() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    disasterType: "hurricane",
    severity: 3,
    status: "ACTIVE",
    affectedArea: "",
    description: "",
    estimatedAffected: 0,
    latitude: 0,
    longitude: 0
  });
  const queryClient = useQueryClient();

  const { data: disasters = [], isLoading } = useQuery({
    queryKey: ["disasters"],
    queryFn: () => apiClient.get(endpoints.disasters, { limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: (newDisasterData) => apiClient.post(endpoints.disasters, newDisasterData),
    onMutate: async (newDisaster) => {
      await queryClient.cancelQueries({ queryKey: ["disasters"] });
      const previous = queryClient.getQueryData(["disasters"]);
      queryClient.setQueryData(["disasters"], (old = []) => [
        { ...newDisaster, id: "temp-" + Date.now(), createdAt: new Date().toISOString() },
        ...(Array.isArray(old) ? old : [])
      ]);
      return { previous };
    },
    onError: (err, newDisaster, context) => {
      if (context?.previous) queryClient.setQueryData(["disasters"], context.previous);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disasters"] });
      setOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => apiClient.put(endpoints.disaster(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disasters"] });
      setOpen(false);
      setEditingId(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.delete(endpoints.disaster(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disasters"] });
      setDeleteId(null);
    },
  });

  const endDisasterMutation = useMutation({
    mutationFn: ({ id }) => apiClient.put(endpoints.disaster(id), { status: "RESOLVED" }),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ["disasters"] });
      const previous = queryClient.getQueryData(["disasters"]);
      queryClient.setQueryData(["disasters"], (old = []) =>
        (Array.isArray(old) ? old : []).map(d => d.id === id ? { ...d, status: "RESOLVED" } : d)
      );
      return { previous };
    },
    onError: (err, vars, context) => {
      if (context?.previous) queryClient.setQueryData(["disasters"], context.previous);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["disasters"] }); },
  });

  const activateDisasterMutation = useMutation({
    mutationFn: ({ id }) => apiClient.put(endpoints.disaster(id), { status: "ACTIVE" }),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ["disasters"] });
      const previous = queryClient.getQueryData(["disasters"]);
      queryClient.setQueryData(["disasters"], (old = []) =>
        (Array.isArray(old) ? old : []).map(d => d.id === id ? { ...d, status: "ACTIVE" } : d)
      );
      return { previous };
    },
    onError: (err, vars, context) => {
      if (context?.previous) queryClient.setQueryData(["disasters"], context.previous);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["disasters"] }); },
  });

  const monitorDisasterMutation = useMutation({
    mutationFn: ({ id }) => apiClient.put(endpoints.disaster(id), { status: "MONITORING" }),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ["disasters"] });
      const previous = queryClient.getQueryData(["disasters"]);
      queryClient.setQueryData(["disasters"], (old = []) =>
        (Array.isArray(old) ? old : []).map(d => d.id === id ? { ...d, status: "MONITORING" } : d)
      );
      return { previous };
    },
    onError: (err, vars, context) => {
      if (context?.previous) queryClient.setQueryData(["disasters"], context.previous);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["disasters"] }); },
  });

  const resetForm = () => setForm({
    name: "",
    disasterType: "hurricane",
    severity: 3,
    status: "ACTIVE",
    affectedArea: "",
    description: "",
    estimatedAffected: 0,
    latitude: 0,
    longitude: 0
  });

  const filtered = disasters.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.affectedArea?.toLowerCase().includes(search.toLowerCase())
  );

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["disasters"] });
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div>
        <DisasterAlertToast />
        <PageHeader
          title="Disaster Events"
          description="Manage and monitor all disaster events"
          actions={
            <Button onClick={() => { resetForm(); setOpen(true); }} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" /> New Disaster
            </Button>
          }
        />

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search disasters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card border text-foreground placeholder-muted-foreground"
          />
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 bg-card" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Activity} title="No disasters found" description="Create a new disaster event to get started." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(d => (
              <DisasterCard
                key={d.id}
                d={d}
                onActivate={(id) => activateDisasterMutation.mutate({ id })}
                onMonitor={(id) => monitorDisasterMutation.mutate({ id })}
                onEnd={(id) => endDisasterMutation.mutate({ id })}
                onEdit={(disaster) => {
                  setEditingId(disaster.id);
                  setForm({
                    name: disaster.name || "",
                    disasterType: disaster.disasterType || "hurricane",
                    severity: disaster.severity || 3,
                    status: disaster.status || "ACTIVE",
                    affectedArea: disaster.affectedArea || "",
                    description: disaster.description || "",
                    estimatedAffected: disaster.estimatedAffected || 0,
                    latitude: disaster.latitude || 0,
                    longitude: disaster.longitude || 0,
                  });
                  setOpen(true);
                }}
                onDelete={(id) => setDeleteId(id)}
              />
            ))}
          </div>
        )}

        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditingId(null); resetForm(); } }}>
          <DialogContent className="max-w-lg bg-card border">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Disaster Event" : "New Disaster Event"}</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {editingId ? "Update the details for this disaster event." : "Enter the details of the new disaster event to begin tracking and response efforts."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label className="text-muted-foreground">Event Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Hurricane Milton" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Disaster Type</Label>
                  <Select value={form.disasterType} onValueChange={(v) => setForm({ ...form, disasterType: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DISASTER_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-muted-foreground">Severity (1-5)</Label>
                  <Select value={String(form.severity)} onValueChange={(v) => setForm({ ...form, severity: parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(n => <SelectItem key={n} value={String(n)}>{n} — {["Minor", "Moderate", "Significant", "Severe", "Catastrophic"][n - 1]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Latitude</Label>
                  <Input type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: parseFloat(e.target.value) || 0 })} placeholder="e.g. 27.95" />
                </div>
                <div>
                  <Label className="text-muted-foreground">Longitude</Label>
                  <Input type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: parseFloat(e.target.value) || 0 })} placeholder="e.g. -82.45" />
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Affected Area</Label>
                <Input value={form.affectedArea} onChange={(e) => setForm({ ...form, affectedArea: e.target.value })} placeholder="City, County, State" />
              </div>
              <div>
                <Label className="text-muted-foreground">Estimated People Affected</Label>
                <Input type="number" value={form.estimatedAffected} onChange={(e) => setForm({ ...form, estimatedAffected: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => { setOpen(false); setEditingId(null); resetForm(); }}>Cancel</Button>
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => {
                    if (editingId) {
                      updateMutation.mutate({ id: editingId, data: form });
                    } else {
                      createMutation.mutate(form);
                    }
                  }}
                  disabled={!form.name || createMutation.isPending || updateMutation.isPending}
                >
                  {editingId
                    ? (updateMutation.isPending ? "Saving..." : "Save Changes")
                    : (createMutation.isPending ? "Creating..." : "Create Event")
                  }
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
          <AlertDialogContent className="bg-card border">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Disaster Event?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. All associated data including survivor records linked to this event may be affected.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => deleteMutation.mutate(deleteId)}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PullToRefresh>
  );
}

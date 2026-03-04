import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import PageHeader from "../components/ui/PageHeader";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/ui/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Plus, Search, Users, Building2, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

const LOCATION_TYPES = ["SHELTER", "WAREHOUSE", "DISTRIBUTION_CENTER", "CLINIC", "FIELD_HOSPITAL"];

export default function Locations() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    locationType: "SHELTER",
    address: "",
    capacity: 100,
    currentOccupancy: 0,
    operationalStatus: "OPEN",
    disasterId: "",
    contactPhone: "",
    managerName: "",
    latitude: 0,
    longitude: 0
  });
  const queryClient = useQueryClient();

  const { data: locations = [], isLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: () => apiClient.get(endpoints.locations, { limit: 100 }),
  });
  const { data: disasters = [] } = useQuery({
    queryKey: ["disasters"],
    queryFn: () => apiClient.get(endpoints.disasters, { status: "ACTIVE" }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => apiClient.post(endpoints.locations, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["locations"] }); setOpen(false); },
  });

  const filtered = locations.filter(l =>
    l.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.address?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Locations" description="Shelters, warehouses, and distribution points" actions={
        <Button onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" /> Add Location</Button>
      } />

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search locations..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-card border text-foreground placeholder-muted-foreground" />
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-44 bg-card" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={MapPin} title="No locations found" description="Add your first shelter or facility." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(l => {
            const occupancyPct = l.capacity > 0 ? Math.round((l.currentOccupancy / l.capacity) * 100) : 0;
            return (
              <Card key={l.id} className="bg-card border hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-sm">{l.name}</h3>
                        <p className="text-xs text-muted-foreground capitalize">{l.locationType?.toLowerCase()}</p>
                      </div>
                    </div>
                    <StatusBadge status={l.operationalStatus} />
                  </div>
                  {l.address && <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1"><MapPin className="w-3 h-3" />{l.address}</p>}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> Occupancy</span>
                      <span className="font-medium text-muted-foreground">{l.currentOccupancy || 0} / {l.capacity || "—"}</span>
                    </div>
                    <Progress value={occupancyPct} className={cn("h-2 bg-secondary", occupancyPct > 90 ? "[&>div]:bg-red-500" : occupancyPct > 70 ? "[&>div]:bg-amber-500" : "[&>div]:bg-emerald-500")} />
                  </div>
                  {l.contactPhone && <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1"><Phone className="w-3 h-3" />{l.contactPhone}</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg bg-card border text-foreground">
          <DialogHeader><DialogTitle className="text-foreground">Add Location</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div><Label className="text-muted-foreground">Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Central High School Shelter" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-muted-foreground">Type</Label>
                <Select value={form.locationType} onValueChange={(v) => setForm({ ...form, locationType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{LOCATION_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t.toLowerCase()}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-muted-foreground">Status</Label>
                <Select value={form.operationalStatus} onValueChange={(v) => setForm({ ...form, operationalStatus: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPEN">Open</SelectItem><SelectItem value="FULL">Full</SelectItem><SelectItem value="CLOSED">Closed</SelectItem><SelectItem value="LIMITED">Setup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label className="text-muted-foreground">Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Full address" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-muted-foreground">Latitude</Label><Input type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: parseFloat(e.target.value) || 0 })} /></div>
              <div><Label className="text-muted-foreground">Longitude</Label><Input type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: parseFloat(e.target.value) || 0 })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-muted-foreground">Capacity</Label><Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 0 })} /></div>
              <div><Label className="text-muted-foreground">Disaster Event</Label>
                <Select value={form.disasterId} onValueChange={(v) => setForm({ ...form, disasterId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{disasters.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-muted-foreground">Manager Name</Label><Input value={form.managerName} onChange={(e) => setForm({ ...form, managerName: e.target.value })} /></div>
              <div><Label className="text-muted-foreground">Contact Phone</Label><Input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} /></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => createMutation.mutate(form)} disabled={!form.name || !form.disasterId || createMutation.isPending}>
                {createMutation.isPending ? "Adding..." : "Add Location"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

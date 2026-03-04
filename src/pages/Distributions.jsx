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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Truck, Plus, Search } from "lucide-react";
import { format } from "date-fns";

export default function Distributions() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ disasterId: "", resourceId: "", distributionType: "INDIVIDUAL", locationId: "", notes: "" });
  const queryClient = useQueryClient();

  const { data: distributions = [], isLoading } = useQuery({
    queryKey: ["distributions"],
    queryFn: () => apiClient.get(endpoints.distributions, { limit: 200 }),
  });
  const { data: disasters = [] } = useQuery({
    queryKey: ["disasters-active"],
    queryFn: () => apiClient.get(endpoints.disasters, { status: "ACTIVE" }),
  });
  const { data: resources = [] } = useQuery({
    queryKey: ["resources"],
    queryFn: () => apiClient.get(endpoints.resources, { limit: 200 }),
  });
  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: () => apiClient.get(endpoints.locations, { limit: 100 }),
  });

  const resourceMap = Object.fromEntries(resources.map(r => [r.id, r.name]));
  const locationMap = Object.fromEntries(locations.map(l => [l.id, l.name]));
  const disasterMap = Object.fromEntries(disasters.map(d => [d.id, d.name]));

  const createMutation = useMutation({
    mutationFn: (data) => apiClient.post(endpoints.distributions, { 
      ...data, 
      quantity: 1,
      quantityDistributed: 0,
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["distributions"] }); setOpen(false); },
  });

  const filtered = distributions.filter(d =>
    d.resource?.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.notes?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Distributions" description="Track resource distributions to survivors" actions={
        <Button onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" /> Record Distribution</Button>
      } />

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search distributions..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-card border text-foreground placeholder-muted-foreground" />
      </div>

      {isLoading ? (
        <Card className="bg-card border"><CardContent className="p-4 space-y-3">{[1,2,3,4].map(i=><Skeleton key={i} className="h-10 w-full bg-secondary"/>)}</CardContent></Card>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Truck} title="No distributions recorded" description="Record your first resource distribution." />
      ) : (
        <Card className="bg-card border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-background/50 border-b border">
                  <TableHead className="text-muted-foreground">Resource</TableHead>
                  <TableHead className="text-muted-foreground">Quantity</TableHead>
                  <TableHead className="text-muted-foreground">Type</TableHead>
                  <TableHead className="hidden md:table-cell text-muted-foreground">From Location</TableHead>
                  <TableHead className="hidden md:table-cell text-muted-foreground">Disaster</TableHead>
                  <TableHead className="hidden sm:table-cell text-muted-foreground">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(d => (
                  <TableRow key={d.id} className="border-b border hover:bg-secondary/30">
                    <TableCell className="font-medium text-sm text-foreground">{d.resource?.name || resourceMap[d.resourceId] || "—"}</TableCell>
                    <TableCell className="font-semibold text-sm text-muted-foreground">{d.quantity}</TableCell>
                    <TableCell><StatusBadge status={d.distributionType} /></TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{locationMap[d.locationId] || "—"}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{disasterMap[d.disasterId] || "—"}</TableCell>
                    <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">{d.createdAt ? format(new Date(d.createdAt), "MMM d, h:mm a") : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Record Distribution</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div><Label>Disaster Event *</Label>
              <Select value={form.disasterId} onValueChange={(v) => setForm({...form, disasterId: v})}>
                <SelectTrigger><SelectValue placeholder="Select disaster" /></SelectTrigger>
                <SelectContent>{disasters.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Resource *</Label>
                <Select value={form.resourceId} onValueChange={(v) => setForm({...form, resourceId: v})}>
                  <SelectTrigger><SelectValue placeholder="Select resource" /></SelectTrigger>
                  <SelectContent>{resources.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Quantity *</Label><Input type="number" min={1} value={form.quantity} onChange={(e) => setForm({...form, quantity: parseInt(e.target.value) || 1})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>From Location</Label>
                <Select value={form.locationId} onValueChange={(v) => setForm({...form, locationId: v})}>
                  <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                  <SelectContent>{locations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Type</Label>
                <Select value={form.distributionType} onValueChange={(v) => setForm({...form, distributionType: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                    <SelectItem value="BULK">Bulk</SelectItem>
                    <SelectItem value="EMERGENCY">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} rows={2} /></div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => createMutation.mutate(form)} disabled={!form.disasterId || !form.resourceId || createMutation.isPending}>{createMutation.isPending ? "Recording..." : "Record Distribution"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

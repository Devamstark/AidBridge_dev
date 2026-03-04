import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Plus, Search } from "lucide-react";

const CATEGORIES = ["FOOD", "WATER", "SHELTER", "HYGIENE", "MEDICAL", "CLOTHING", "TOOLS", "OTHER"];
const CATEGORY_COLORS = {
  FOOD: "bg-amber-50 text-amber-700",
  WATER: "bg-cyan-50 text-cyan-700",
  SHELTER: "bg-blue-50 text-blue-700",
  HYGIENE: "bg-pink-50 text-pink-700",
  MEDICAL: "bg-red-50 text-red-700",
  CLOTHING: "bg-purple-50 text-purple-700",
  TOOLS: "bg-slate-100 text-slate-700",
  OTHER: "bg-gray-50 text-gray-700",
};

export default function Resources() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", subcategory: "", category: "FOOD", unitType: "each", parLevel: 0 });
  const queryClient = useQueryClient();

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["resources"],
    queryFn: () => apiClient.get(endpoints.resources, { limit: 200 }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => apiClient.post(endpoints.resources, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["resources"] }); setOpen(false); setForm({ name: "", subcategory: "", category: "FOOD", unitType: "each", parLevel: 0 }); },
  });

  const filtered = resources.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Resources" description="Relief supply catalog" actions={
        <Button onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" /> Add Resource</Button>
      } />

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search resources..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-card border text-foreground placeholder-muted-foreground" />
      </div>

      {isLoading ? (
        <Card className="bg-card border"><CardContent className="p-4 space-y-3">{[1,2,3].map(i=><Skeleton key={i} className="h-10 w-full bg-secondary"/>)}</CardContent></Card>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Package} title="No resources found" description="Add relief supplies to the catalog." />
      ) : (
        <Card className="bg-card border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-background/50 border-b border">
                  <TableHead className="text-muted-foreground">Name</TableHead>
                  <TableHead className="text-muted-foreground">Category</TableHead>
                  <TableHead className="text-muted-foreground">Unit</TableHead>
                  <TableHead className="text-muted-foreground">Par Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(r => (
                  <TableRow key={r.id} className="border-b border hover:bg-secondary/30">
                    <TableCell><span className="font-medium text-sm text-foreground">{r.name}</span><br/><span className="text-xs text-muted-foreground">{r.subcategory || r.category}</span></TableCell>
                    <TableCell><Badge className={CATEGORY_COLORS[r.category] || "bg-gray-50 text-gray-700"} variant="secondary">{r.category}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.unitType || "each"}</TableCell>
                    <TableCell className="text-sm font-medium text-muted-foreground">{r.parLevel || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Resource</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="e.g. Emergency Blanket" /></div>
            <div><Label>Type</Label><Input value={form.subcategory} onChange={(e) => setForm({...form, subcategory: e.target.value})} placeholder="e.g. Wool Blanket 60x80" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({...form, category: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c} className="capitalize">{c.toLowerCase()}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Unit</Label><Input value={form.unitType} onChange={(e) => setForm({...form, unitType: e.target.value})} placeholder="each, case, liter" /></div>
            </div>
            <div><Label>Par Level (min stock)</Label><Input type="number" value={form.parLevel} onChange={(e) => setForm({...form, parLevel: parseInt(e.target.value) || 0})} /></div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => createMutation.mutate(form)} disabled={!form.name || createMutation.isPending}>{createMutation.isPending ? "Adding..." : "Add Resource"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

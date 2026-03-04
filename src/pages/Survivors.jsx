import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import PageHeader from "../components/ui/PageHeader";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/ui/EmptyState";
import { PullToRefresh } from "../components/ui/PullToRefresh";
import { ResponsiveTable } from "../components/ui/ResponsiveTable";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Users, Search, UserPlus, Phone, Mail, Calendar, Home, CheckCircle2, XCircle, Info, HelpCircle } from "lucide-react";
import { format } from "date-fns";

export default function Survivors() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSurvivor, setSelectedSurvivor] = useState(null);
  const [updating, setUpdating] = useState(false);
  const queryClient = useQueryClient();

  const { data: survivors = [], isLoading } = useQuery({
    queryKey: ["survivors"],
    queryFn: () => apiClient.get(endpoints.survivors, { limit: 200 }),
  });

  const { data: disasters = [] } = useQuery({
    queryKey: ["disasters"],
    queryFn: () => apiClient.get(endpoints.disasters, { limit: 100 }),
  });

  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: () => apiClient.get(endpoints.locations, { limit: 100 }),
  });

  const disasterMap = Object.fromEntries(disasters.map(d => [d.id, d.name]));
  const locationMap = Object.fromEntries(locations.map(l => [l.id, l.name]));

  const handleRefresh = async () => {
    window.location.reload();
  };

  const handleUpdateStatus = async (id, newStatus) => {
    setUpdating(true);
    try {
      await apiClient.put(`/survivors/${id}`, { status: newStatus });
      queryClient.invalidateQueries(["survivors"]);
      setSelectedSurvivor(null);
    } catch (err) {
      console.error("Failed to update survivor status:", err);
    } finally {
      setUpdating(false);
    }
  };

  const filtered = survivors.filter(s => {
    const matchSearch = !search ||
      s.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      s.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      s.caseNumber?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div>
        <PageHeader
          title="Survivors"
          description={`${survivors.length} total registered survivors`}
          actions={
            <Link to={createPageUrl("SurvivorIntake")}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="w-4 h-4 mr-2" /> New Intake
              </Button>
            </Link>
          }
        />

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by name or case number..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-card border text-foreground placeholder-muted-foreground" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[160px] bg-card border text-foreground"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="PENDING_REVIEW">🔍 Pending Review</SelectItem>
              <SelectItem value="REGISTERED">Registered</SelectItem>
              <SelectItem value="SAFE">Sheltered</SelectItem>
              <SelectItem value="INJURED">Assisted</SelectItem>
              <SelectItem value="RELOCATED">Relocated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <Card className="bg-card border"><CardContent className="p-4 space-y-3">{[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full bg-secondary" />)}</CardContent></Card>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Users} title="No survivors found" description={search ? "Try a different search term." : "Register your first survivor to get started."} />
        ) : (
          <ResponsiveTable
            headers={["Name", "Case #", "Disaster", "Status", "Household", "Registered"]}
            data={filtered}
            renderRow={(s) => (
              <TableRow
                key={s.id}
                className="hover:bg-secondary/30 border-b border cursor-pointer"
                onClick={() => setSelectedSurvivor(s)}
              >
                <TableCell>
                  <div>
                    <p className="font-medium text-sm text-foreground">{s.firstName} {s.lastName}</p>
                    {s.phone && <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{s.phone}</p>}
                  </div>
                </TableCell>
                <TableCell><span className="font-mono text-xs text-muted-foreground">{s.caseNumber || "—"}</span></TableCell>
                <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{disasterMap[s.disasterId] || "—"}</TableCell>
                <TableCell><StatusBadge status={s.status} /></TableCell>
                <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{s.householdSize || 1}</TableCell>
                <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                  {s.createdAt ? format(new Date(s.createdAt), "MMM d, h:mm a") : "—"}
                </TableCell>
              </TableRow>
            )}
            renderCard={(s) => (
              <Card key={s.id} className="bg-card border cursor-pointer hover:bg-secondary/50" onClick={() => setSelectedSurvivor(s)}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-foreground">{s.firstName} {s.lastName}</p>
                      <p className="text-xs text-muted-foreground font-mono mt-1">{s.caseNumber || "—"}</p>
                    </div>
                    <div className="flex gap-1">
                      <StatusBadge status={s.status} />
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {s.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {s.phone}
                      </div>
                    )}
                    <div>Household: {s.householdSize || 1} people</div>
                    {s.createdAt && <div>Registered: {format(new Date(s.createdAt), "MMM d, h:mm a")}</div>}
                  </div>
                </CardContent>
              </Card>
            )}
          />
        )}

        {/* Survivor Details Modal */}
        <Dialog open={!!selectedSurvivor} onOpenChange={(open) => !open && setSelectedSurvivor(null)}>
          <DialogContent className="bg-card border max-w-2xl">
            <DialogHeader>
              <div className="flex items-center justify-between mb-2">
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Survivor Details
                </DialogTitle>
                {selectedSurvivor && <StatusBadge status={selectedSurvivor.status} />}
              </div>
              <DialogDescription className="text-muted-foreground">
                Case Number: <span className="font-mono text-primary">{selectedSurvivor?.caseNumber}</span>
              </DialogDescription>
            </DialogHeader>

            {selectedSurvivor && (
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
                      <p className="text-lg font-semibold text-foreground">{selectedSurvivor.firstName} {selectedSurvivor.lastName}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Contact Information</label>
                      <div className="space-y-2 mt-1">
                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-4 h-4 text-blue-400" />
                          {selectedSurvivor.phone || "No phone provided"}
                        </p>
                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="w-4 h-4 text-blue-400" />
                          {selectedSurvivor.email || "No email provided"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Household Size</label>
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                        <Home className="w-4 h-4 text-emerald-400" />
                        {selectedSurvivor.householdSize || 1} Person(s)
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 bg-secondary/50 p-4 rounded-lg border">
                    <div>
                      <label className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        Intake Notes
                      </label>
                      <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap leading-relaxed">
                        {selectedSurvivor.intakeNotes || "No notes available for this case."}
                      </p>
                    </div>
                    {selectedSurvivor.disasterId && (
                      <div>
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Linked Disaster</label>
                        <p className="text-sm text-muted-foreground mt-1">{disasterMap[selectedSurvivor.disasterId]}</p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedSurvivor.status === "PENDING_REVIEW" ? (
                  <div className="bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-900/50 rounded-lg p-4 mt-2">
                    <p className="text-sm text-amber-700 dark:text-amber-200 mb-4 flex items-center gap-2 font-medium">
                      <HelpCircle className="w-4 h-4" />
                      This registration was submitted via the web portal and is awaiting review.
                    </p>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleUpdateStatus(selectedSurvivor.id, "REGISTERED")}
                        disabled={updating}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Approve & Register
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleUpdateStatus(selectedSurvivor.id, "ARCHIVED")}
                        disabled={updating}
                        className="flex-1 font-bold"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject Case
                      </Button>
                    </div>
                  </div>
                ) : (
                  <DialogFooter className="border-t pt-4">
                    <div className="flex items-center gap-2 w-full">
                      <p className="text-xs text-muted-foreground flex-1 italic">
                        Registered on {format(new Date(selectedSurvivor.createdAt), "PPP")}
                      </p>
                      <Button variant="outline" className="border hover:bg-card" onClick={() => setSelectedSurvivor(null)}>
                        Close
                      </Button>
                    </div>
                  </DialogFooter>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PullToRefresh>
  );
}

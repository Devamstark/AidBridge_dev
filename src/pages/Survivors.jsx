import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Users, Search, UserPlus, Phone } from "lucide-react";
import { format } from "date-fns";

export default function Survivors() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSurvivor, setSelectedSurvivor] = useState(null);

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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search by name or case number..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-slate-400" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[160px] bg-slate-800 border-slate-700 text-white"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="REGISTERED">Registered</SelectItem>
              <SelectItem value="SAFE">Sheltered</SelectItem>
              <SelectItem value="INJURED">Assisted</SelectItem>
              <SelectItem value="RELOCATED">Relocated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <Card className="bg-slate-800 border-slate-700"><CardContent className="p-4 space-y-3">{[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full bg-slate-700" />)}</CardContent></Card>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Users} title="No survivors found" description={search ? "Try a different search term." : "Register your first survivor to get started."} />
        ) : (
          <ResponsiveTable
            headers={["Name", "Case #", "Disaster", "Status", "Household", "Registered"]}
            data={filtered}
            renderRow={(s) => (
              <TableRow
                key={s.id}
                className="hover:bg-slate-700/30 border-b border-slate-700 cursor-pointer"
                onClick={() => setSelectedSurvivor(s)}
              >
                <TableCell>
                  <div>
                    <p className="font-medium text-sm text-slate-200">{s.firstName} {s.lastName}</p>
                    {s.phone && <p className="text-xs text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3" />{s.phone}</p>}
                  </div>
                </TableCell>
                <TableCell><span className="font-mono text-xs text-slate-400">{s.caseNumber || "—"}</span></TableCell>
                <TableCell className="hidden md:table-cell text-xs text-slate-400">{disasterMap[s.disasterId] || "—"}</TableCell>
                <TableCell><StatusBadge status={s.status} /></TableCell>
                <TableCell className="hidden sm:table-cell text-sm text-slate-600">{s.householdSize || 1}</TableCell>
                <TableCell className="hidden lg:table-cell text-xs text-slate-400">
                  {s.createdAt ? format(new Date(s.createdAt), "MMM d, h:mm a") : "—"}
                </TableCell>
              </TableRow>
            )}
            renderCard={(s) => (
              <Card key={s.id} className="bg-slate-800 border-slate-700 cursor-pointer hover:bg-slate-700/50" onClick={() => setSelectedSurvivor(s)}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-slate-200">{s.firstName} {s.lastName}</p>
                      <p className="text-xs text-slate-400 font-mono mt-1">{s.caseNumber || "—"}</p>
                    </div>
                    <div className="flex gap-1">
                      <StatusBadge status={s.status} />
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-slate-400">
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
      </div>
    </PullToRefresh>
  );
}

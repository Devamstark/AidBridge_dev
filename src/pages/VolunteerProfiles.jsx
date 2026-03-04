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
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Plus, Search, Phone, Mail } from "lucide-react";

const SKILL_OPTIONS = ["Medical", "Logistics", "Translation", "First Aid", "Counseling", "Driving", "Cooking", "Childcare", "Construction", "IT Support"];

export default function VolunteerProfiles() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [form, setForm] = useState({ userId: "", skills: [], certifications: [] });
  const queryClient = useQueryClient();

  const { data: volunteers = [], isLoading } = useQuery({
    queryKey: ["volunteers"],
    queryFn: () => apiClient.get(endpoints.volunteers, { limit: 200 }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => apiClient.put(endpoints.volunteer(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["volunteers"] });
      setOpen(false);
    },
  });

  const filtered = volunteers.filter(v =>
    v.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    v.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Volunteer Profiles" description="Manage volunteer profiles and skills" />

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input placeholder="Search volunteers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-slate-800 border-slate-700 text-white" />
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map(i => <Skeleton key={i} className="h-40 bg-slate-800"/>)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={UserCheck} title="No volunteers found" description="Add volunteers to start coordinating." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(v => (
            <Card key={v.id} className="bg-slate-800 border-slate-700 hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-900/30 flex items-center justify-center text-sm font-bold text-purple-300">
                      {v.user?.fullName?.[0] || "V"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-200 text-sm">{v.user?.fullName || "Volunteer"}</h3>
                      <StatusBadge status={v.status} className="mt-1" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-slate-400">
                  {v.user?.phone && <div className="flex items-center gap-2"><Phone className="w-3 h-3" />{v.user.phone}</div>}
                  {v.user?.email && <div className="flex items-center gap-2"><Mail className="w-3 h-3" />{v.user.email}</div>}
                </div>
                {v.skills && v.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {v.skills.slice(0, 3).map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs bg-slate-700 text-slate-300 border-slate-600">{skill}</Badge>
                    ))}
                  </div>
                )}
                <Button size="sm" variant="outline" className="w-full mt-3 text-xs" onClick={() => { setSelectedSkills(v.skills || []); setOpen(true); }}>Edit Profile</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Update Volunteer Profile</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="mb-2 block">Skills</Label>
              <div className="flex flex-wrap gap-2">
                {SKILL_OPTIONS.map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill])}
                    className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                  >{skill}</button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => updateMutation.mutate({ id: filtered[0]?.id, data: { skills: selectedSkills } })}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

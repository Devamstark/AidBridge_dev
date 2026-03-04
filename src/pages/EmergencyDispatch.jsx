import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, RefreshCw, Users, AlertTriangle, CheckCircle2, Activity, Zap } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { useTranslation } from "@/components/i18n/I18nContext";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

export default function EmergencyDispatch() {
  const { t } = useTranslation();
  const [selectedRequest, setSelectedRequest] = useState(null);
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

  const active = requests.filter(r => ["PENDING", "IN_PROGRESS"].includes(r.status));
  const available = volunteers.filter(v => v.status === "AVAILABLE");
  const critical = requests.filter(r => r.priority === "P0");

  return (
    <div>
      <PageHeader
        title={t("dispatch.title")}
        description={t("dispatch.description")}
        actions={
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 h-8"
            onClick={() => queryClient.invalidateQueries()}
          >
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
          <div className="text-slate-400 text-xs mb-1 flex items-center gap-1"><Activity className="w-3 h-3" /> {t("dispatch.active")}</div>
          <div className="text-2xl font-bold text-white">{active.length}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
          <div className="text-slate-400 text-xs mb-1 flex items-center gap-1"><Users className="w-3 h-3" /> {t("dispatch.available_volunteers")}</div>
          <div className={`text-2xl font-bold ${available.length === 0 ? "text-red-400" : "text-emerald-400"}`}>{available.length}</div>
        </div>
        <div className={`rounded-lg p-3 border ${critical.length > 0 ? "bg-red-950/60 border-red-700" : "bg-slate-800 border-slate-700"}`}>
          <div className="text-slate-400 text-xs mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-red-400" /> {t("dispatch.critical_p0")}</div>
          <div className={`text-2xl font-bold ${critical.length > 0 ? "text-red-300" : "text-white"}`}>{critical.length}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
          <div className="text-slate-400 text-xs mb-1 flex items-center gap-1"><Zap className="w-3 h-3 text-amber-400" /> {t("dispatch.fatigued")}</div>
          <div className="text-2xl font-bold text-white">0</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-slate-300 text-sm font-semibold">Incoming Requests</h2>
            <Badge className="bg-slate-700 text-slate-300">{requests.length} total</Badge>
          </div>
          {isLoading ? (
            <div className="text-slate-500 text-sm text-center py-8">Loading...</div>
          ) : requests.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="text-slate-500 text-sm text-center py-12">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No emergency requests
              </CardContent>
            </Card>
          ) : (
            requests.map(r => (
              <Card
                key={r.id}
                className={`p-4 cursor-pointer hover:bg-slate-700/50 border ${r.priority === "P0" ? "border-red-500 bg-red-950/20" : "border-slate-700 bg-slate-800"}`}
                onClick={() => setSelectedRequest(r)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white text-sm">{r.type}</p>
                      {r.isPublic && (
                        <Badge variant="outline" className="text-[10px] h-4 border-blue-500 text-blue-400 bg-blue-500/10">Portal</Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {r.isPublic && <span className="text-blue-300 mr-1">{r.fullName || "Public"}:</span>}
                      {r.description?.slice(0, 80) || "No description"}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <p className="text-[10px] text-slate-500">{r.createdAt ? format(new Date(r.createdAt), "MMM d, h:mm a") : ""}</p>
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

        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 h-fit sticky top-4">
          <h2 className="text-slate-300 text-sm font-semibold mb-4">
            {selectedRequest ? `Details: ${selectedRequest.type}` : "Select a request to view details"}
          </h2>
          {selectedRequest ? (
            <div className="space-y-3">
              <div><p className="text-xs text-slate-400">Description</p><p className="text-sm text-white">{selectedRequest.description}</p></div>
              <div><p className="text-xs text-slate-400">Priority</p><Badge className={selectedRequest.priority === "P0" ? "bg-red-600" : "bg-slate-600"}>{selectedRequest.priority}</Badge></div>
              <div><p className="text-xs text-slate-400">Status</p><Badge>{selectedRequest.status}</Badge></div>
              <div><p className="text-xs text-slate-400">Location</p><p className="text-sm text-white">{selectedRequest.address || "No address provided"}</p></div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 mt-4">Assign Volunteers</Button>
            </div>
          ) : (
            <div className="text-slate-500 text-sm text-center py-8">Select a request from the list to view details and assign volunteers</div>
          )}
        </div>
      </div>
    </div>
  );
}

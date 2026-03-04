import React from "react";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { useTranslation } from "../components/i18n/I18nContext";
import { useDisasters } from "../hooks/useDisasters";
import { useSurvivors } from "../hooks/useSurvivors";
import { useLocations } from "../hooks/useLocations";
import { useVolunteers } from "../hooks/useVolunteers";
import { useDistributions } from "../hooks/useDistributions";
import DisasterMap from "../components/maps/DisasterMap";
import { PullToRefresh } from "../components/ui/PullToRefresh";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  MapPin,
  UserCheck,
  Activity,
  ArrowRight,
  Truck
} from "lucide-react";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { data: disasters = [], isLoading: loadingD } = useDisasters({ limit: 50 });
  const { data: survivors = [], isLoading: loadingS } = useSurvivors({ limit: 100 });
  const { data: locations = [], isLoading: loadingL } = useLocations({ limit: 100 });
  const { data: volunteers = [], isLoading: loadingV } = useVolunteers({ limit: 100 });
  const { data: distributions = [], isLoading: loadingDist } = useDistributions({ limit: 200 });

  const handleRefresh = async () => {
    await queryClient.invalidateQueries();
  };

  const activeDisasters = disasters.filter(d => d.status === "ACTIVE");
  const activeVolunteers = volunteers.filter(v => v.status === "AVAILABLE" || v.status === "ON_DUTY");
  const openLocations = locations.filter(l => l.operationalStatus === "OPEN" || l.operationalStatus === "FULL");

  const survivorStatusData = React.useMemo(() => {
    const counts = {};
    survivors.forEach(s => {
      counts[s.status || "REGISTERED"] = (counts[s.status || "REGISTERED"] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name: name.replace(/_/g, " "), value }));
  }, [survivors]);

  const distributionsByDay = React.useMemo(() => {
    const days = {};
    distributions.forEach(d => {
      const day = d.createdAt ? format(new Date(d.createdAt), "MMM d") : "Unknown";
      days[day] = (days[day] || 0) + (d.quantity || 0);
    });
    return Object.entries(days).slice(-7).map(([day, qty]) => ({ day, quantity: qty }));
  }, [distributions]);

  const isLoading = loadingD || loadingS || loadingL || loadingV || loadingDist;

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">{t("dashboard.title")}</h1>
            <p className="text-muted-foreground text-sm">{t("dashboard.description")}</p>
          </div>
          <Link to={createPageUrl("SurvivorIntake")}>
            <Button className="bg-primary hover:bg-primary/90">
              <Users className="w-4 h-4 mr-2" />
              {t("dashboard.new_intake")}
            </Button>
          </Link>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("dashboard.active_disasters")}
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : activeDisasters.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {disasters.length} {t("dashboard.total_events")}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("dashboard.survivors_registered")}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : survivors.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {t("dashboard.across_active")} {activeDisasters.length} {t("dashboard.active_events")}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("dashboard.active_locations")}
              </CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : openLocations.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {locations.length} {t("dashboard.total_facilities")}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("dashboard.volunteers")}
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : activeVolunteers.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {volunteers.length} {t("dashboard.total_registered")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Map */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">{t("dashboard.live_map")}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DisasterMap height="400px" />
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Truck className="w-4 h-4" />
                {t("dashboard.distributions")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {distributionsByDay.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={distributionsByDay}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                    <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Bar dataKey="quantity" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">
                  {t("dashboard.no_distribution_data")}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">{t("dashboard.survivor_status")}</CardTitle>
            </CardHeader>
            <CardContent>
              {survivorStatusData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={survivorStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {survivorStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-2 mt-4 justify-center">
                    {survivorStatusData.map((entry, index) => (
                      <div key={entry.name} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[index % PIE_COLORS.length] }} />
                        <span className="text-xs text-muted-foreground capitalize">{entry.name}</span>
                        <span className="text-xs font-medium">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
                  {t("dashboard.no_survivor_data")}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Active Disasters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">{t("dashboard.active_events_list")}</CardTitle>
              <Link to={createPageUrl("Disasters")}>
                <Button variant="ghost" size="sm" className="text-xs">
                  {t("dashboard.view_all")} <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : activeDisasters.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                {t("dashboard.no_active")}
              </div>
            ) : (
              <div className="space-y-2">
                {activeDisasters.map(d => (
                  <div key={d.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{d.name}</p>
                        <p className="text-xs text-muted-foreground">{d.affectedArea || d.disasterType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {d.disasterType}
                      </Badge>
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        {t("dashboard.severity")}: {d.severity}/5
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PullToRefresh>
  );
}

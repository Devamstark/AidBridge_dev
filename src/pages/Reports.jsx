import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/ui/PageHeader";
import { FileText, Download, Activity, Calendar, Clock, BarChart3, Info } from "lucide-react";
import { generateOperationSummary, filterByRange } from "@/lib/report-utils";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";

export default function Reports() {
    const [reportType, setReportType] = useState("daily");
    const [summary, setSummary] = useState("");

    const { data: requests = [], isLoading: loadingRequests } = useQuery({
        queryKey: ["emergency-requests-all"],
        queryFn: () => apiClient.get(endpoints.dispatchRequests, { limit: 1000 }),
    });

    const { data: volunteers = [] } = useQuery({
        queryKey: ["volunteers-all"],
        queryFn: () => apiClient.get(endpoints.volunteers, { limit: 500 }),
    });

    const { data: resources = [] } = useQuery({
        queryKey: ["resources-all"],
        queryFn: () => apiClient.get(endpoints.resources, { limit: 100 }),
    });

    const { data: disasters = [] } = useQuery({
        queryKey: ["disasters-all"],
        queryFn: () => apiClient.get(endpoints.disasters, { limit: 100 }),
    });

    const handleSummarize = () => {
        // Collect filtered data based on reportType
        const filteredRequests = filterByRange(requests, reportType === 'daily' ? 'day' : reportType === 'weekly' ? 'week' : 'month');

        // We summarize current active state regardless of range, 
        // but we could also filter resolved ones.
        const reportData = {
            requests: filteredRequests,
            volunteers,
            resources,
            disasters
        };

        const text = generateOperationSummary(reportData);
        setSummary(text);
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Header
        doc.setFillColor(30, 41, 59); // Slate-800
        doc.rect(0, 0, pageWidth, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text("AidBridge Situation Report (SITREP)", 14, 20);
        doc.setFontSize(10);
        doc.text(`Generated: ${format(new Date(), "PPpp")}`, 14, 30);
        doc.text(`Report Period: ${reportType.toUpperCase()}`, pageWidth - 50, 30);

        // Summary Section
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Executive Summary", 14, 55);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const splitText = doc.splitTextToSize(summary || generateOperationSummary({ requests, volunteers, resources, disasters }), pageWidth - 28);
        doc.text(splitText, 14, 65);

        // Dashboard Stats Table
        const activeReqs = requests.filter(r => r.status !== 'RESOLVED');
        const stats = [
            ["Critical (P0) Requests", activeReqs.filter(r => r.priority === 'P0').length.toString()],
            ["Active Missions", activeReqs.filter(r => r.status === 'ASSIGNED').length.toString()],
            ["Personnel in Field", volunteers.filter(v => v.status === 'ON_DUTY').length.toString()],
            ["Available Capacity", volunteers.filter(v => v.status === 'AVAILABLE').length.toString()]
        ];

        doc.autoTable({
            startY: 120,
            head: [['Key Metrics', 'Value']],
            body: stats,
            theme: 'striped',
            headStyles: { fillColor: [51, 65, 85] }
        });

        // Resource Status Table
        const resourceData = resources.map(r => [
            r.name,
            r.category,
            `${r.currentStock} ${r.unit}`,
            r.currentStock < r.minThreshold ? 'URGENT' : 'STABLE'
        ]);

        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 15,
            head: [['Resource', 'Category', 'Level', 'Status']],
            body: resourceData,
            theme: 'grid',
            headStyles: { fillColor: [51, 65, 85] }
        });

        doc.save(`AidBridge_SITREP_${reportType}_${format(new Date(), "yyyyMMdd")}.pdf`);
    };

    return (
        <div className="pb-10">
            <PageHeader
                title="Operation Reports"
                description="Generate automated situation reports and operational summaries for stakeholders."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border border-border/50 bg-card/60 backdrop-blur-md shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg font-bold">
                                <SettingsIcon className="w-5 h-5 text-primary" /> Report Configuration
                            </CardTitle>
                            <CardDescription>Select the timeframe for the automated scan.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Tabs defaultValue="daily" onValueChange={setReportType} className="w-full">
                                <TabsList className="grid grid-cols-3 w-full bg-muted/50 p-1">
                                    <TabsTrigger value="daily" className="text-xs">Daily</TabsTrigger>
                                    <TabsTrigger value="weekly" className="text-xs">Weekly</TabsTrigger>
                                    <TabsTrigger value="monthly" className="text-xs">Monthly</TabsTrigger>
                                </TabsList>
                            </Tabs>

                            <div className="pt-4 space-y-3">
                                <Button onClick={handleSummarize} className="w-full bg-primary hover:bg-primary/90 font-semibold gap-2 h-11 shadow-md shadow-primary/20">
                                    <Activity className="w-4 h-4" /> Summarize Operation
                                </Button>
                                <Button onClick={exportPDF} variant="outline" className="w-full border-border hover:bg-accent gap-2 h-11">
                                    <Download className="w-4 h-4" /> Export Professional PDF
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
                                <Info className="w-4 h-4" /> Intelligence Note
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                SITREPs are generated using logic-based extraction from active operation data.
                                PDF exports are formatted according to standard emergency management protocols.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card className="h-full border border-border/50 bg-card shadow-xl overflow-hidden flex flex-col min-h-[500px]">
                        <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-bold tracking-tight">Operation SITREP</CardTitle>
                                    <CardDescription className="flex items-center gap-2 text-xs">
                                        <Clock className="w-3 h-3 text-primary" /> Generated overview based on current system data
                                    </CardDescription>
                                </div>
                                <Badge className="rounded-full px-3 bg-primary/10 text-primary border-primary/20 flex gap-1.5 items-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    {reportType.toUpperCase()}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 relative overflow-hidden bg-slate-50/50 dark:bg-slate-900/20">
                            <div className="absolute inset-0 p-10 overflow-y-auto font-mono text-[13px] leading-[1.8] text-foreground/90 whitespace-pre-wrap selection:bg-primary/20">
                                {summary ? (
                                    <div className="animate-in fade-in duration-500">
                                        {summary}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground/40">
                                        <FileText className="w-20 h-20 mb-6 opacity-20" />
                                        <p className="font-sans text-sm font-medium">Ready to generate report</p>
                                        <p className="font-sans text-xs mt-1 text-center max-w-[200px]">Click the summarize button to analyze active operational data</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// Helper icons for the config card
function SettingsIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.1a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

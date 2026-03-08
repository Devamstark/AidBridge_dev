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
                    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Settings2 className="w-5 h-5 text-blue-400" /> Report Configuration
                            </CardTitle>
                            <CardDescription>Select the timeframe for the automated scan.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Tabs defaultValue="daily" onValueChange={setReportType} className="w-full">
                                <TabsList className="grid grid-cols-3 w-full bg-slate-950/50 border border-slate-800">
                                    <TabsTrigger value="daily">Daily</TabsTrigger>
                                    <TabsTrigger value="weekly">Weekly</TabsTrigger>
                                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                                </TabsList>
                            </Tabs>

                            <div className="pt-4 space-y-2">
                                <Button onClick={handleSummarize} className="w-full bg-blue-600 hover:bg-blue-700 font-semibold gap-2">
                                    <Activity className="w-4 h-4" /> Summarize Operation
                                </Button>
                                <Button onClick={exportPDF} variant="outline" className="w-full border-slate-700 hover:bg-slate-800 gap-2">
                                    <Download className="w-4 h-4" /> Export Professional PDF
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-800 bg-slate-900/50">
                        <CardHeader>
                            <CardTitle className="text-md font-semibold text-slate-400 flex items-center gap-2">
                                <Info className="w-4 h-4" /> Intelligence Note
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-500 italic">
                                SITREPs are generated using logic-based extraction from active operation data.
                                PDF exports are formatted according to standard emergency management protocols.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card className="h-full border-slate-800 bg-slate-950/50 shadow-2xl overflow-hidden flex flex-col">
                        <CardHeader className="border-b border-slate-800 bg-slate-900/30">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl">Automated SITREP</CardTitle>
                                    <CardDescription className="flex items-center gap-2 mt-1">
                                        <Clock className="w-3 h-3" /> Real-time status report generated from operational data
                                    </CardDescription>
                                </div>
                                <Badge variant="outline" className="h-6 gap-1 border-blue-500/30 text-blue-400">
                                    <Calendar className="w-3 h-3" /> {reportType.toUpperCase()}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 relative">
                            <div className="absolute inset-0 p-6 overflow-y-auto font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">
                                {summary || (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-500 animate-pulse">
                                        <FileText className="w-16 h-16 mb-4 opacity-10" />
                                        <p>Click "Summarize Operation" to generate report</p>
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
function Settings2(props) {
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
            <path d="M20 7h-9" />
            <path d="M14 17H5" />
            <circle cx="17" cy="17" r="3" />
            <circle cx="7" cy="7" r="3" />
        </svg>
    );
}

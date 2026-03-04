import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, CheckCircle, Clock, AlertCircle, XCircle, Phone, Mail } from "lucide-react";
import { apiClient } from "@/api/client";

const STATUS_CONFIG = {
  PENDING: { color: 'bg-yellow-500', lightColor: 'bg-yellow-50', textColor: 'text-yellow-700', icon: Clock, label: 'Pending Review' },
  ASSIGNED: { color: 'bg-blue-500', lightColor: 'bg-blue-50', textColor: 'text-blue-700', icon: AlertCircle, label: 'Volunteer Assigned' },
  IN_PROGRESS: { color: 'bg-purple-500', lightColor: 'bg-purple-50', textColor: 'text-purple-700', icon: Clock, label: 'In Progress' },
  RESOLVED: { color: 'bg-green-500', lightColor: 'bg-green-50', textColor: 'text-green-700', icon: CheckCircle, label: 'Resolved' },
};

export default function TrackRequest() {
  const navigate = useNavigate();
  const [requestId, setRequestId] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await apiClient.get(`/public/track/${requestId}`);
      setResult(response);
    } catch (err) {
      setError(err.data?.error || 'Request ID not found. Please check and try again.');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const StatusIcon = result ? STATUS_CONFIG[result.status]?.icon : Clock;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/help')} 
          className="mb-6 text-slate-600 hover:text-slate-900 hover:bg-white/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>

        <Card className="bg-white border-0 shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                <Search className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-slate-900">Track Your Request</CardTitle>
                <p className="text-sm text-slate-600">Enter your Request ID or Case Number</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTrack} className="mb-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-700 font-medium mb-2 block">Request ID or Case Number</Label>
                  <div className="flex gap-2">
                    <Input
                      value={requestId}
                      onChange={(e) => setRequestId(e.target.value.toUpperCase())}
                      placeholder="REQ-20260303-XXX or SRV-20260303-XXX"
                      className="border-slate-300 focus:border-green-500 focus:ring-green-500 font-mono text-lg"
                      required
                    />
                    <Button 
                      type="submit" 
                      disabled={isLoading} 
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-8"
                    >
                      {isLoading ? 'Searching...' : 'Track'}
                    </Button>
                  </div>
                </div>
              </div>
            </form>

            {error && (
              <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
                <AlertDescription className="text-red-700 text-sm">{error}</AlertDescription>
              </Alert>
            )}

            {result && (
              <div className="space-y-6">
                {/* Status Header */}
                <div className={`rounded-xl p-6 ${STATUS_CONFIG[result.status]?.lightColor || 'bg-slate-50'} border-2 ${STATUS_CONFIG[result.status]?.color.replace('bg-', 'border-') || 'border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-1">
                        {result.type === 'HELP_REQUEST' ? 'Request ID' : 'Case Number'}
                      </p>
                      <p className="text-3xl font-bold text-slate-900 font-mono">{result.requestId || result.caseNumber}</p>
                    </div>
                    <Badge className={`${STATUS_CONFIG[result.status]?.color} text-white px-4 py-2 text-sm font-semibold`}>
                      <StatusIcon className="w-4 h-4 mr-2" />
                      {STATUS_CONFIG[result.status]?.label || result.status}
                    </Badge>
                  </div>
                </div>

                {result.type === 'HELP_REQUEST' ? (
                  <>
                    {/* Request Details */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 font-medium mb-1">Emergency Type</p>
                        <p className="text-slate-900 font-semibold">{result.emergencyType}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 font-medium mb-1">Location</p>
                        <p className="text-slate-900 font-semibold">{result.location}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 font-medium mb-1">People Count</p>
                        <p className="text-slate-900 font-semibold">{result.peopleCount} people</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 font-medium mb-1">Submitted</p>
                        <p className="text-slate-900 font-semibold">{new Date(result.createdAt).toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Timeline
                      </h4>
                      <div className="space-y-4">
                        {result.timeline.map((event, index) => {
                          const EventIcon = STATUS_CONFIG[event.status]?.icon || Clock;
                          const config = STATUS_CONFIG[event.status] || STATUS_CONFIG.PENDING;
                          return (
                            <div key={index} className="flex gap-4">
                              <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full ${config.color} flex items-center justify-center shadow-lg`}>
                                  <EventIcon className="w-5 h-5 text-white" />
                                </div>
                                {index < result.timeline.length - 1 && (
                                  <div className="w-0.5 h-12 bg-slate-200 mt-2" />
                                )}
                              </div>
                              <div className="flex-1 pt-1">
                                <p className="font-semibold text-slate-900">{config.label}</p>
                                <p className="text-sm text-slate-500">{new Date(event.timestamp).toLocaleString()}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 font-medium mb-1">Name</p>
                        <p className="text-slate-900 font-semibold">{result.firstName} {result.lastName}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 font-medium mb-1">Submitted</p>
                        <p className="text-slate-900 font-semibold">{new Date(result.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className={`rounded-lg p-4 ${STATUS_CONFIG.PENDING.lightColor} border ${STATUS_CONFIG.PENDING.color.replace('bg-', 'border-')}`}>
                      <p className={`text-sm font-medium ${STATUS_CONFIG.PENDING.textColor}`}>{result.message}</p>
                    </div>
                  </div>
                )}

                {/* Contact Support */}
                <div className="pt-6 border-t border-slate-200">
                  <p className="text-sm font-semibold text-slate-700 mb-3">Need help?</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Button variant="outline" className="border-slate-300 hover:bg-slate-50">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Support
                    </Button>
                    <Button variant="outline" className="border-slate-300 hover:bg-slate-50">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Support
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

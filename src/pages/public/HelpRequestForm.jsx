import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, AlertTriangle, MapPin, Clock, Users } from "lucide-react";
import { apiClient } from "@/api/client";

const EMERGENCY_TYPES = [
  { value: 'MEDICAL', label: 'Medical Emergency', icon: '🏥', color: 'bg-red-500' },
  { value: 'RESCUE', label: 'Rescue Needed', icon: '🚁', color: 'bg-orange-500' },
  { value: 'SHELTER', label: 'Shelter Needed', icon: '🏠', color: 'bg-blue-500' },
  { value: 'FOOD', label: 'Food/Water', icon: '🍞', color: 'bg-green-500' },
  { value: 'OTHER', label: 'Other', icon: '📋', color: 'bg-slate-500' },
];

export default function HelpRequestForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    location: '',
    latitude: undefined,
    longitude: undefined,
    emergencyType: 'MEDICAL',
    priority: 'P2',
    description: '',
    peopleCount: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            location: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
          }));
        },
        (err) => {
          console.error('Location error:', err);
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await apiClient.post('/public/help', formData);
      setSuccess(response);
    } catch (err) {
      setError(err.message || 'Failed to submit request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <AlertTriangle className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Request Submitted!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-green-700 font-medium mb-1">Your Request ID</p>
              <p className="text-3xl font-bold text-green-800 font-mono">{success.requestId}</p>
            </div>
            <p className="text-sm text-slate-600 text-center">
              Save this Request ID to track your request status. A volunteer will contact you soon.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => navigate('/track')} className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold">
                Track Status
              </Button>
              <Button onClick={() => navigate('/help')} variant="outline" className="flex-1 border-slate-300 hover:bg-slate-100">
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 text-slate-600 hover:text-slate-900 hover:bg-white/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>

        <Card className="bg-white border-0 shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-slate-900">Emergency Help Request</CardTitle>
                <p className="text-sm text-slate-600">Fill out this form to request immediate assistance</p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4 text-sm text-slate-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Takes 2-3 minutes</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>No login required</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
                <AlertDescription className="text-red-700 text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Contact Information</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-700 font-medium mb-2 block">Full Name *</Label>
                    <Input
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-slate-700 font-medium mb-2 block">Phone Number *</Label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="(555) 123-4567"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-slate-700 font-medium mb-2 block">Email (optional)</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-bold text-sm">2</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Your Location</h3>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Enter your address or location description"
                      className="border-slate-300 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                  <Button type="button" onClick={handleGetLocation} variant="outline" className="border-slate-300 hover:bg-green-50 hover:text-green-600">
                    <MapPin className="w-4 h-4" />
                  </Button>
                </div>
                {formData.latitude && formData.longitude && (
                  <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                    <p className="text-sm text-green-700 font-medium">GPS Coordinates Captured</p>
                    <p className="text-xs text-green-600 font-mono">{formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}</p>
                  </div>
                )}
              </div>

              {/* Emergency Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                    <span className="text-red-600 font-bold text-sm">3</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Emergency Details</h3>
                </div>
                <div>
                  <Label className="text-slate-700 font-medium mb-2 block">Emergency Type *</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {EMERGENCY_TYPES.map(type => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, emergencyType: type.value })}
                        className={`p-3 rounded-lg border-2 transition-all ${formData.emergencyType === type.value
                            ? `border-${type.color.replace('bg-', '')} bg-${type.color.replace('bg-', '')}/10`
                            : 'border-slate-200 hover:border-slate-300'
                          }`}
                      >
                        <div className="text-2xl mb-1">{type.icon}</div>
                        <div className="text-xs font-medium text-slate-700">{type.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-700 font-medium mb-2 block">Priority *</Label>
                    <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                      <SelectTrigger className="border-slate-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="P0">🔴 P0 - Critical (Life-threatening)</SelectItem>
                        <SelectItem value="P1">🟠 P1 - High (Urgent)</SelectItem>
                        <SelectItem value="P2">🟡 P2 - Medium (Standard)</SelectItem>
                        <SelectItem value="P3">🟢 P3 - Low (Non-urgent)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-700 font-medium mb-2 block">Number of People *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.peopleCount}
                      onChange={(e) => setFormData({ ...formData, peopleCount: parseInt(e.target.value) || 1 })}
                      className="border-slate-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-slate-700 font-medium mb-2 block">Description *</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    placeholder="Describe your emergency situation in detail..."
                    className="border-slate-300 focus:border-red-500 focus:ring-red-500 resize-none"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                disabled={isLoading}
              >
                {isLoading ? 'Submitting Request...' : 'Submit Emergency Request'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

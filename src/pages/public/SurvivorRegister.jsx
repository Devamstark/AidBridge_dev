import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, FileText, CheckCircle, User, Users, Shield } from "lucide-react";
import { apiClient } from "@/api/client";

export default function SurvivorRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    householdSize: 1,
    consentDataSharing: false,
    consentContact: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await apiClient.post('/public/survivor/register', formData);
      setSuccess(response);
    } catch (err) {
      setError(err.message || 'Failed to submit registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <CheckCircle className="w-10 h-10 text-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Registration Submitted!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-green-700 font-medium mb-1">Your Case Number</p>
              <p className="text-3xl font-bold text-green-800 font-mono">{success.caseNumber}</p>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Save this Case Number to track your registration status. A coordinator will contact you soon.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => navigate('/track')} className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-foreground font-semibold">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 text-muted-foreground hover:text-slate-900 hover:bg-white/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>

        <Card className="bg-white border-0 shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-slate-900">Survivor Registration</CardTitle>
                <p className="text-sm text-muted-foreground">Register for disaster assistance and support</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="flex gap-2 mt-6">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex-1">
                  <div className={`h-2 rounded-full transition-all ${step >= s ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-slate-200'}`} />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Personal Info</span>
              <span>Household</span>
              <span>Consent</span>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
                <AlertDescription className="text-red-700 text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 && (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Personal Information</h3>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-700 font-medium mb-2 block">First Name *</Label>
                      <Input
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-slate-700 font-medium mb-2 block">Last Name *</Label>
                      <Input
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-700 font-medium mb-2 block">Phone Number *</Label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-700 font-medium mb-2 block">Email (optional)</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-700 font-medium mb-2 block">Date of Birth (optional)</Label>
                      <Input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <Button type="button" onClick={nextStep} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-foreground font-semibold py-6">
                    Next: Household Info
                  </Button>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                      <Users className="w-4 h-4 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Household Information</h3>
                  </div>
                  <div>
                    <Label className="text-slate-700 font-medium mb-2 block">Household Size (including yourself) *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.householdSize}
                      onChange={(e) => setFormData({ ...formData, householdSize: parseInt(e.target.value) || 1 })}
                      className="border-slate-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Additional household members can be added after initial registration.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" onClick={prevStep} variant="outline" className="flex-1 border-slate-300 hover:bg-slate-100">
                      Back
                    </Button>
                    <Button type="button" onClick={nextStep} className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-foreground font-semibold py-6">
                      Next: Consent
                    </Button>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Consent Agreement</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <Checkbox
                        id="consentContact"
                        checked={formData.consentContact}
                        onCheckedChange={(v) => setFormData({ ...formData, consentContact: v })}
                        className="data-[state=checked]:bg-blue-600"
                      />
                      <div>
                        <Label htmlFor="consentContact" className="text-slate-700 font-medium cursor-pointer">Contact Consent</Label>
                        <p className="text-xs text-muted-foreground mt-1">I agree to be contacted by aid workers via phone or email.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <Checkbox
                        id="consentDataSharing"
                        checked={formData.consentDataSharing}
                        onCheckedChange={(v) => setFormData({ ...formData, consentDataSharing: v })}
                        className="data-[state=checked]:bg-blue-600"
                      />
                      <div>
                        <Label htmlFor="consentDataSharing" className="text-slate-700 font-medium cursor-pointer">Data Sharing Consent</Label>
                        <p className="text-xs text-muted-foreground mt-1">I agree to share my information with partner organizations for better assistance.</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" onClick={prevStep} variant="outline" className="flex-1 border-slate-300 hover:bg-slate-100">
                      Back
                    </Button>
                    <Button type="submit" disabled={isLoading} className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-foreground font-semibold py-6">
                      {isLoading ? 'Submitting...' : 'Submit Registration'}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, AlertTriangle, MapPin, Clock, Users, CheckCircle2, ChevronRight, Info, Activity } from "lucide-react";
import { apiClient } from "@/api/client";
import { motion, AnimatePresence } from "framer-motion";

const EMERGENCY_TYPES = [
  { value: 'MEDICAL', label: 'Medical', icon: '🏥', borderColor: 'border-rose-500', bgColor: 'bg-rose-500/10', textColor: 'text-rose-600' },
  { value: 'RESCUE', label: 'Rescue', icon: '🚁', borderColor: 'border-orange-500', bgColor: 'bg-orange-500/10', textColor: 'text-orange-600' },
  { value: 'SHELTER', label: 'Shelter', icon: '🏠', borderColor: 'border-blue-500', bgColor: 'bg-blue-500/10', textColor: 'text-blue-600' },
  { value: 'FOOD', label: 'Food/Water', icon: '🍞', borderColor: 'border-emerald-500', bgColor: 'bg-emerald-500/10', textColor: 'text-emerald-600' },
  { value: 'OTHER', label: 'Other', icon: '📋', borderColor: 'border-slate-500', bgColor: 'bg-slate-500/10', textColor: 'text-slate-600' },
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
      <div className="min-h-screen mesh-bg flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="glass border-none shadow-2xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />
            <CardHeader className="text-center pb-2 pt-8">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6 border-4 border-emerald-500/10"
              >
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </motion.div>
              <CardTitle className="text-3xl font-black tracking-tight text-slate-900 border-none">MISSION LOGGED</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4 px-8 pb-10">
              <div className="bg-slate-900/5 dark:bg-white/5 rounded-2xl p-6 text-center border border-slate-200/50">
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-2">Unique Tracking ID</p>
                <p className="text-4xl font-black text-primary tracking-tighter font-mono">{success.requestId}</p>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center leading-relaxed">
                  Your request has been broadcasted to the nearest emergency responders. 
                  <span className="block mt-1 font-bold text-slate-700">Please keep your phone line open.</span>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={() => navigate('/track')} className="h-12 font-bold bg-primary hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/20">
                  Track Live
                </Button>
                <Button onClick={() => navigate('/')} variant="outline" className="h-12 font-bold rounded-xl border-2">
                  Return Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-bg py-12">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-8 text-muted-foreground hover:text-slate-900 hover:bg-white/50 rounded-full pl-2 pr-6"
          >
            <div className="p-1.5 rounded-full bg-white shadow-sm mr-3">
              <ArrowLeft className="w-4 h-4" />
            </div>
            Exit Request Portal
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass border-none shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-rose-500 via-primary to-orange-500" />
            
            <CardHeader className="pb-8 pt-10 px-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden flex items-center justify-center">
                    <img src="/logo.png" alt="AidBridge Logo" className="w-10 h-10 object-contain" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-black tracking-tight text-slate-900 leading-none mb-2 underline decoration-rose-500/20 underline-offset-4">Emergency Dispatch</CardTitle>
                    <p className="text-muted-foreground font-medium">Survivor Intake Phase</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-muted-foreground/60 bg-slate-100/50 dark:bg-white/5 px-4 py-2 rounded-full border border-slate-200/50">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>~2m Est.</span>
                  </div>
                  <div className="w-1 h-1 bg-slate-300 rounded-full" />
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" />
                    <span>No Login</span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-8 pb-10">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Alert variant="destructive" className="mb-8 border-rose-200 bg-rose-50 rounded-2xl">
                      <AlertDescription className="text-rose-700 text-sm font-bold flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        {error}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-10">
                {/* Step 1 */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-black shadow-lg shadow-primary/30">
                      1
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 italic tracking-tight">Identity Details</h3>
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-slate-200 to-transparent" />
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-slate-800 font-bold ml-1">Full Name</Label>
                      <Input
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="h-12 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl transition-all font-medium"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-800 font-bold ml-1">Secure Contact No.</Label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="h-12 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl transition-all font-medium font-mono"
                        placeholder="(555) 000-0000"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-800 font-bold ml-1">Email (Optional Trace)</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="h-12 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl transition-all font-medium"
                      placeholder="survivor@example.com"
                    />
                  </div>
                </div>

                {/* Step 2 */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black shadow-lg shadow-emerald-500/30">
                      2
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 italic tracking-tight">Geospatial Marker</h3>
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-slate-200 to-transparent" />
                  </div>

                  <div className="relative group">
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Street, Landmark, or descriptive location..."
                      className="h-14 pl-12 pr-14 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-xl transition-all font-medium"
                      required
                    />
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                    <Button 
                      type="button" 
                      onClick={handleGetLocation} 
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 p-0 bg-white hover:bg-emerald-50 text-emerald-600 border border-slate-200 shadow-sm rounded-lg"
                    >
                      <Activity className="w-4 h-4 animate-pulse" />
                    </Button>
                  </div>
                  
                  {formData.latitude && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <span className="text-emerald-700 text-sm font-bold tracking-tight">GPS LOCK ACQUIRED</span>
                      </div>
                      <span className="text-emerald-600 font-mono text-[10px] bg-white px-2 py-1 rounded border border-emerald-500/10 font-bold">
                        {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                      </span>
                    </motion.div>
                  )}
                </div>

                {/* Step 3 */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center font-black shadow-lg shadow-rose-500/30">
                      3
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 italic tracking-tight">Deployment Intel</h3>
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-slate-200 to-transparent" />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-slate-800 font-bold ml-1 underline decoration-rose-500/20 decoration-2">Category of Need</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {EMERGENCY_TYPES.map(type => {
                        const isSelected = formData.emergencyType === type.value;
                        return (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            key={type.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, emergencyType: type.value })}
                            className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-300 ${isSelected ? `${type.borderColor} ${type.bgColor} shadow-lg shadow-black/5` : 'border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md'}`}
                          >
                            <span className="text-3xl mb-2 filter drop-shadow-sm">{type.icon}</span>
                            <span className={`text-[10px] font-black uppercase tracking-wider ${isSelected ? type.textColor : 'text-slate-500'}`}>{type.label}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-slate-800 font-bold ml-1">Threat Level</Label>
                      <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                        <SelectTrigger className="h-12 border-slate-200 rounded-xl focus:ring-rose-500/10 font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-none shadow-2xl">
                          <SelectItem value="P0" className="py-3 font-bold text-rose-600">CRITICAL (LIFESPAN RISK)</SelectItem>
                          <SelectItem value="P1" className="py-3 font-bold text-orange-600">HIGH (URGENT ACTION)</SelectItem>
                          <SelectItem value="P2" className="py-3 font-bold text-emerald-600">STANDARD (P2)</SelectItem>
                          <SelectItem value="P3" className="py-3 font-bold text-slate-500">ROUTINE (P3)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-800 font-bold ml-1">Personnel Count</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          min="1"
                          value={formData.peopleCount}
                          onChange={(e) => setFormData({ ...formData, peopleCount: parseInt(e.target.value) || 1 })}
                          className="h-12 pl-12 border-slate-200 rounded-xl font-black font-mono focus:ring-rose-500/10"
                        />
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-800 font-bold ml-1">Incident Report / Details</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={5}
                      placeholder="Describe the situation, landscape, or immediate threats..."
                      className="border-slate-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 rounded-2xl transition-all font-medium resize-none p-4"
                      required
                    />
                  </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Button
                    type="submit"
                    className="group relative w-full h-16 bg-slate-900 hover:bg-black text-white font-black text-xl tracking-tighter rounded-2xl shadow-2xl overflow-hidden transition-all"
                    disabled={isLoading}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-rose-400 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-out" />
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {isLoading ? (
                        <>
                          <Activity className="w-5 h-5 animate-spin" />
                          DISPATCHING...
                        </>
                      ) : (
                        <>
                          INITIATE EMERGENCY REQUEST
                          <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

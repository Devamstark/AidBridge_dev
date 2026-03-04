import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthContext";
import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { createPageUrl } from "../utils";
import PageHeader from "../components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  UserPlus,
  Heart,
  Shield,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  { title: "Personal Info", icon: UserPlus },
  { title: "Needs & Medical", icon: Heart },
  { title: "Review & Submit", icon: Shield },
];

const MEDICAL_CHIPS = ["Diabetes", "Asthma", "Heart Condition", "Seizures", "Wheelchair", "Oxygen", "Dialysis", "Pregnant", "Infant", "Elderly"];
const DIETARY_CHIPS = ["Gluten-Free", "Vegetarian", "Vegan", "Halal", "Kosher", "Nut Allergy", "Lactose Intolerant"];
const LANGUAGE_OPTIONS = ["English", "Spanish", "Mandarin", "Cantonese", "French", "Arabic", "Vietnamese", "Korean", "Portuguese", "Creole", "ASL"];

export default function SurvivorIntake() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    phone: "",
    email: "",
    householdSize: 1,
    dependents: 0,
    address: "",
    latitude: "",
    longitude: "",
    status: "REGISTERED",
    gender: "",
    medicalNeeds: [],
    medications: "",
    allergies: [],
    dietaryNeeds: [],
    mobilityAssistance: false,
    languageAssistance: "",
    specialNeeds: "",
    disasterId: "",
    locationId: "",
    intakeNotes: "",
  });
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: disasters = [] } = useQuery({
    queryKey: ["disasters-active"],
    queryFn: () => apiClient.get(endpoints.disasters, { status: "ACTIVE" }),
  });
  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: () => apiClient.get(endpoints.locations, { limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => apiClient.post(endpoints.survivors, data),
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["survivors"] });
    },
  });

  const handleChipToggle = (chip, list, setList) => {
    if (list.includes(chip)) {
      setList(list.filter(c => c !== chip));
    } else {
      setList([...list, chip]);
    }
  };

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = () => {
    createMutation.mutate({
      ...form,
      medicalNeeds: form.medicalNeeds.join(", "),
      allergies: form.allergies.join(", "),
      familyMembers: [],
    });
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <PageHeader title="Survivor Registered" description="Survivor has been successfully registered" />
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Registration Complete</h2>
            <p className="text-slate-400 mb-6">Case number has been assigned and the survivor has been added to the system.</p>
            <Button onClick={() => { setSubmitted(false); setStep(0); setForm({ ...form, firstName: "", lastName: "", phone: "", email: "" }); }} className="bg-blue-600 hover:bg-blue-700">
              Register Another Survivor
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader title="Survivor Intake" description="Register a new survivor" />
      
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((s, i) => (
            <div key={s.title} className="flex items-center">
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center border-2", i <= step ? "bg-blue-600 border-blue-600 text-white" : "bg-slate-800 border-slate-700 text-slate-400")}>
                <s.icon className="w-5 h-5" />
              </div>
              <span className={cn("ml-2 text-sm font-medium", i <= step ? "text-white" : "text-slate-400")}>{s.title}</span>
              {i < STEPS.length - 1 && <ChevronRight className="w-5 h-5 text-slate-600 mx-2" />}
            </div>
          ))}
        </div>
        <Progress value={((step + 1) / STEPS.length) * 100} className="h-2" />
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-slate-300">First Name *</Label><Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
                  <div><Label className="text-slate-300">Last Name *</Label><Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-slate-300">Date of Birth</Label><Input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} /></div>
                  <div><Label className="text-slate-300">Gender</Label>
                    <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                        <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-slate-300">Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                  <div><Label className="text-slate-300">Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-slate-300">Household Size</Label><Input type="number" value={form.householdSize} onChange={(e) => setForm({ ...form, householdSize: parseInt(e.target.value) || 1 })} /></div>
                  <div><Label className="text-slate-300">Dependents</Label><Input type="number" value={form.dependents} onChange={(e) => setForm({ ...form, dependents: parseInt(e.target.value) || 0 })} /></div>
                </div>
                <div><Label className="text-slate-300">Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-slate-300">Disaster</Label>
                    <Select value={form.disasterId} onValueChange={(v) => setForm({ ...form, disasterId: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{disasters.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label className="text-slate-300">Location</Label>
                    <Select value={form.locationId} onValueChange={(v) => setForm({ ...form, locationId: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{locations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Medical & Special Needs</h3>
                <div><Label className="text-slate-300">Medical Needs</Label><div className="flex flex-wrap gap-2 mt-2">{MEDICAL_CHIPS.map(chip => (<button key={chip} type="button" onClick={() => handleChipToggle(chip, form.medicalNeeds, (v) => setForm({ ...form, medicalNeeds: v }))} className={cn("px-3 py-1.5 rounded-full text-xs border", form.medicalNeeds.includes(chip) ? "bg-red-50 text-red-700 border-red-200" : "bg-slate-700 text-slate-300 border-slate-600")}>{chip}</button>))}</div></div>
                <div><Label className="text-slate-300">Medications</Label><Textarea value={form.medications} onChange={(e) => setForm({ ...form, medications: e.target.value })} rows={2} /></div>
                <div><Label className="text-slate-300">Allergies</Label><div className="flex flex-wrap gap-2 mt-2">{DIETARY_CHIPS.map(chip => (<button key={chip} type="button" onClick={() => handleChipToggle(chip, form.allergies, (v) => setForm({ ...form, allergies: v }))} className={cn("px-3 py-1.5 rounded-full text-xs border", form.allergies.includes(chip) ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-slate-700 text-slate-300 border-slate-600")}>{chip}</button>))}</div></div>
                <div className="flex items-center gap-2"><Checkbox checked={form.mobilityAssistance} onCheckedChange={(v) => setForm({ ...form, mobilityAssistance: v })} /><Label className="text-slate-300">Requires mobility assistance</Label></div>
                <div><Label className="text-slate-300">Language Assistance</Label><Select value={form.languageAssistance} onValueChange={(v) => setForm({ ...form, languageAssistance: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{LANGUAGE_OPTIONS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select></div>
                <div><Label className="text-slate-300">Special Notes</Label><Textarea value={form.specialNeeds} onChange={(e) => setForm({ ...form, specialNeeds: e.target.value })} rows={3} /></div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Review Information</h3>
                <div className="bg-slate-700/50 rounded-lg p-4 space-y-2">
                  <p className="text-white font-medium">{form.firstName} {form.lastName}</p>
                  <p className="text-sm text-slate-400">Phone: {form.phone || "—"}</p>
                  <p className="text-sm text-slate-400">Household: {form.householdSize} people</p>
                  <p className="text-sm text-slate-400">Medical: {form.medicalNeeds.length > 0 ? form.medicalNeeds.join(", ") : "None"}</p>
                </div>
                <div className="flex items-center gap-2 p-3 bg-amber-950/50 border border-amber-600 rounded-lg"><AlertCircle className="w-4 h-4 text-amber-400" /><p className="text-sm text-amber-300">By submitting, you confirm this information is accurate to the best of your knowledge.</p></div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between mt-6">
            {step > 0 ? (
              <Button variant="outline" onClick={handleBack} className="text-slate-300"><ChevronLeft className="w-4 h-4 mr-2" /> Back</Button>
            ) : <div />}
            {step < STEPS.length - 1 ? (
              <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">Next <ChevronRight className="w-4 h-4 ml-2" /></Button>
            ) : (
              <Button onClick={handleSubmit} disabled={createMutation.isPending || !form.firstName || !form.lastName} className="bg-emerald-600 hover:bg-emerald-700">
                {createMutation.isPending ? "Submitting..." : "Submit Registration"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

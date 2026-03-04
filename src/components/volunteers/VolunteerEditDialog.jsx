import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const SKILL_OPTIONS = ["Medical", "Logistics", "Translation", "First Aid", "Counseling", "Driving", "Cooking", "Childcare", "Construction", "IT Support", "Search & Rescue", "Water Rescue", "Firefighting"];
const CERT_OPTIONS = ["CPR", "EMT", "Firefighter", "Lifeguard", "First Aid"];
const EQUIP_OPTIONS = ["Ambulance", "Fire Extinguisher", "Boat", "First Aid Kit"];

function TagSelector({ options, selected, onToggle, colorOn, colorOff }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onToggle(opt)}
          className={cn(
            "px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
            selected.includes(opt) ? colorOn : colorOff
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function VolunteerEditDialog({ volunteer, open, onClose, onSave, isPending }) {
  const [form, setForm] = useState({});
  const [skills, setSkills] = useState([]);
  const [certs, setCerts] = useState([]);
  const [equip, setEquip] = useState([]);

  useEffect(() => {
    if (volunteer) {
      setForm({
        first_name: volunteer.first_name || "",
        last_name: volunteer.last_name || "",
        phone: volunteer.phone || "",
        email: volunteer.email || "",
        languages: volunteer.languages || "",
        telegram_id: volunteer.telegram_id || "",
        status: volunteer.status || "available",
        current_status: volunteer.current_status || "available",
      });
      setSkills(volunteer.skills ? volunteer.skills.split(",").map(s => s.trim()).filter(Boolean) : []);
      setCerts(volunteer.certifications ? volunteer.certifications.split(",").map(s => s.trim()).filter(Boolean) : []);
      setEquip(volunteer.equipment ? volunteer.equipment.split(",").map(s => s.trim()).filter(Boolean) : []);
    }
  }, [volunteer]);

  const toggle = (setter) => (val) => setter(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);

  const handleSave = () => {
    onSave({
      ...form,
      skills: skills.join(", "),
      certifications: certs.join(", "),
      equipment: equip.join(", "),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-slate-800 border-slate-700 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Volunteer Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-slate-300">First Name *</Label>
              <Input className="bg-slate-700 border-slate-600 text-white" value={form.first_name || ""} onChange={e => setForm({ ...form, first_name: e.target.value })} />
            </div>
            <div>
              <Label className="text-slate-300">Last Name *</Label>
              <Input className="bg-slate-700 border-slate-600 text-white" value={form.last_name || ""} onChange={e => setForm({ ...form, last_name: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-slate-300">Phone</Label>
              <Input className="bg-slate-700 border-slate-600 text-white" value={form.phone || ""} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <Label className="text-slate-300">Email</Label>
              <Input className="bg-slate-700 border-slate-600 text-white" value={form.email || ""} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-slate-300">Languages</Label>
              <Input className="bg-slate-700 border-slate-600 text-white" value={form.languages || ""} onChange={e => setForm({ ...form, languages: e.target.value })} placeholder="English, Spanish..." />
            </div>
            <div>
              <Label className="text-slate-300">Telegram ID</Label>
              <Input className="bg-slate-700 border-slate-600 text-white" value={form.telegram_id || ""} onChange={e => setForm({ ...form, telegram_id: e.target.value })} placeholder="username" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-slate-300">General Status</Label>
              <Select value={form.status || "available"} onValueChange={v => setForm({ ...form, status: v })}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="on_duty">On Duty</SelectItem>
                  <SelectItem value="off_duty">Off Duty</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-300">Operational Status</Label>
              <Select value={form.current_status || "available"} onValueChange={v => setForm({ ...form, current_status: v })}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="on_mission">On Mission</SelectItem>
                  <SelectItem value="on_break">On Break</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-slate-300 block mb-2">Skills</Label>
            <TagSelector
              options={SKILL_OPTIONS}
              selected={skills}
              onToggle={toggle(setSkills)}
              colorOn="bg-purple-900/60 text-purple-300 border-purple-700"
              colorOff="bg-slate-700 text-slate-400 border-slate-600"
            />
          </div>
          <div>
            <Label className="text-slate-300 block mb-2">Certifications</Label>
            <TagSelector
              options={CERT_OPTIONS}
              selected={certs}
              onToggle={toggle(setCerts)}
              colorOn="bg-blue-900/60 text-blue-300 border-blue-700"
              colorOff="bg-slate-700 text-slate-400 border-slate-600"
            />
          </div>
          <div>
            <Label className="text-slate-300 block mb-2">Equipment</Label>
            <TagSelector
              options={EQUIP_OPTIONS}
              selected={equip}
              onToggle={toggle(setEquip)}
              colorOn="bg-amber-900/60 text-amber-300 border-amber-700"
              colorOff="bg-slate-700 text-slate-400 border-slate-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="border-slate-600 text-slate-300 hover:bg-slate-700">Cancel</Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleSave}
              disabled={!form.first_name || !form.last_name || isPending}
            >
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
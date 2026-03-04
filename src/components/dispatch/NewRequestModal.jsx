import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function NewRequestModal({ open, onClose }) {
  const [form, setForm] = useState({
    type: "MEDICAL_EMERGENCY",
    priority: "P2",
    latitude: 0,
    longitude: 0,
    address: "",
    description: "",
  });

  const handleSubmit = () => {
    console.log("New emergency request:", form);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">New Emergency Request</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label className="text-slate-300">Type</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="MEDICAL_EMERGENCY">Medical Emergency</SelectItem>
                <SelectItem value="RESCUE">Rescue</SelectItem>
                <SelectItem value="FIRE">Fire</SelectItem>
                <SelectItem value="HAZARDOUS_MATERIAL">Hazardous Material</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-slate-300">Priority</Label>
            <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="P0">P0 - Critical</SelectItem>
                <SelectItem value="P1">P1 - High</SelectItem>
                <SelectItem value="P2">P2 - Medium</SelectItem>
                <SelectItem value="P3">P3 - Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-slate-300">Address</Label>
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Location of emergency" />
          </div>
          <div>
            <Label className="text-slate-300">Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Describe the emergency situation" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleSubmit}>Submit Request</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

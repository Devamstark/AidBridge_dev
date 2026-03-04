import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileSelect({ value, onValueChange, options, label, placeholder, className, triggerClassName }) {
  const [open, setOpen] = useState(false);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  if (!isMobile) {
    return (
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={triggerClassName}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm",
          triggerClassName
        )}
      >
        <span>{options.find(o => o.value === value)?.label || placeholder}</span>
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-50">
          <path d="M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819L7.43179 8.56819C7.60753 8.74392 7.89245 8.74392 8.06819 8.56819L10.5682 6.06819C10.7439 5.89245 10.7439 5.60753 10.5682 5.43179C10.3924 5.25605 10.1075 5.25605 9.93179 5.43179L7.75 7.61358L5.56819 5.43179C5.39245 5.25605 5.10753 5.25605 4.93179 5.43179Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
        </svg>
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{label}</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto max-h-[60vh] px-4 pb-6">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onValueChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between py-3 px-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
                  value === option.value && "bg-slate-100 dark:bg-slate-800"
                )}
              >
                <span className="text-sm font-medium">{option.label}</span>
                {value === option.value && <Check className="w-4 h-4 text-blue-600" />}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
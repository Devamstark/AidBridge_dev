import React from "react";
import { cn } from "@/lib/utils";

const config = {
  P0: { label: "P0 CRITICAL", cls: "bg-red-600 text-white animate-pulse" },
  P1: { label: "P1 URGENT",   cls: "bg-orange-500 text-white" },
  P2: { label: "P2 HIGH",     cls: "bg-yellow-500 text-black" },
  P3: { label: "P3 NORMAL",   cls: "bg-blue-500 text-white" },
};

export default function PriorityBadge({ priority, className }) {
  const { label, cls } = config[priority] || config.P3;
  return (
    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider", cls, className)}>
      {label}
    </span>
  );
}
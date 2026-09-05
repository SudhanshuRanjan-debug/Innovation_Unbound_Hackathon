"use client";
import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DEMO_PROFILES, ACTIVE_CUSTOMER_ID, setActiveCustomerId } from "@/lib/api";
import { sounds } from "@/lib/audio";
import { Badge } from "@/components/ui/badge";
import { User, ChevronDown, Check } from "lucide-react";

export function CustomerSwitcher() {
  const [activeId, setActiveId] = useState(ACTIVE_CUSTOMER_ID);
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleSelect = (id: string) => {
    sounds.click();
    setActiveCustomerId(id);
    setActiveId(id);
    setOpen(false);
    queryClient.invalidateQueries();
  };

  const currentProfile = DEMO_PROFILES.find((p) => p.id === activeId) || DEMO_PROFILES[0];

  return (
    <div className="relative">
      <button
        onClick={() => {
          sounds.click();
          setOpen(!open);
        }}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-obsidian-850/90 border border-white/10 hover:border-cyan-500/40 text-xs text-white transition-all backdrop-blur-md"
      >
        <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
          <User className="h-3.5 w-3.5" />
        </div>
        <div className="text-left hidden sm:block">
          <p className="font-semibold text-xs leading-none">{currentProfile.name}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{currentProfile.role}</p>
        </div>
        <Badge
          variant={currentProfile.category === "healthy" ? "success" : currentProfile.category === "critical" ? "critical" : "warning"}
          className="text-[10px] py-0 px-1.5"
        >
          {currentProfile.riskScore}
        </Badge>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-1" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl glass-panel-glow border-cyan-500/30 p-2 shadow-2xl z-50 space-y-1">
          <p className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
            Switch Demo Scenario
          </p>
          {DEMO_PROFILES.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelect(p.id)}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-colors ${
                p.id === activeId
                  ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-200"
                  : "hover:bg-white/5 text-slate-300"
              }`}
            >
              <div>
                <p className="font-bold text-white">{p.name}</p>
                <p className="text-[10px] text-slate-400">{p.status}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={p.category === "healthy" ? "success" : p.category === "critical" ? "critical" : "warning"}
                  className="text-[10px] py-0 px-1.5"
                >
                  {p.riskScore}
                </Badge>
                {p.id === activeId && <Check className="h-3.5 w-3.5 text-cyan-400" />}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

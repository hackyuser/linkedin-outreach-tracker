"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useLeadsInternal } from "@/hooks/useLeads";

type LeadsContextValue = ReturnType<typeof useLeadsInternal>;

const LeadsContext = createContext<LeadsContextValue | null>(null);

export function LeadsProvider({ children }: { children: ReactNode }) {
  const value = useLeadsInternal();

  return (
    <LeadsContext.Provider value={value}>{children}</LeadsContext.Provider>
  );
}

export function useLeads(): LeadsContextValue {
  const context = useContext(LeadsContext);

  if (!context) {
    throw new Error("useLeads must be used within a LeadsProvider");
  }

  return context;
}

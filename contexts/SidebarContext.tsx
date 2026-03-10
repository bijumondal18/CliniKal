"use client";

import { createContext, useContext, useState } from "react";

const STORAGE_KEY = "clinic-sidebar-collapsed";

type SidebarContextType = {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
};

const SidebarContext = createContext<SidebarContextType | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsedState] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  const setCollapsed = (v: boolean) => {
    setCollapsedState(v);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, String(v));
  };

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}

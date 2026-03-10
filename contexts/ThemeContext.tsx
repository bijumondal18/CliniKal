"use client";

import { createContext, useContext, useState, useEffect } from "react";

export type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "clinic-theme";

type ThemeContextType = {
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  resolved: "light" | "dark";
};

const ThemeContext = createContext<ThemeContextType | null>(null);

function getStored(): ThemeMode {
  if (typeof window === "undefined") return "system";
  const s = localStorage.getItem(STORAGE_KEY);
  if (s === "light" || s === "dark" || s === "system") return s;
  return "system";
}

function getResolved(theme: ThemeMode): "light" | "dark" {
  if (theme === "dark") return "dark";
  if (theme === "light") return "light";
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
  return "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  useEffect(() => {
    setThemeState(getStored());
  }, []);

  useEffect(() => {
    const r = getResolved(theme);
    setResolved(r);
    document.documentElement.classList.toggle("dark", r === "dark");
  }, [theme]);

  useEffect(() => {
    if (theme !== "system") return;
    const m = window.matchMedia("(prefers-color-scheme: dark)");
    const on = () => setResolved(m.matches ? "dark" : "light");
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, [theme]);

  const setTheme = (t: ThemeMode) => {
    setThemeState(t);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, t);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolved }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "clinic-settings";

export type WorkingHoursDay = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type DayHours = {
  enabled: boolean;
  start: string;
  end: string;
};

export type NotificationSettings = {
  appointmentReminders: boolean;
  emailReminders: boolean;
  smsReminders: boolean;
  inAppNotifications: boolean;
};

export type WorkingHoursSettings = Record<WorkingHoursDay, DayHours>;

export type ClinicSettings = {
  notifications: NotificationSettings;
  workingHours: WorkingHoursSettings;
  clinicAddress: string;
  maxPatientsPerDoctor: Record<string, number>;
};

const defaultWorkingHours: WorkingHoursSettings = {
  mon: { enabled: true, start: "09:00", end: "17:00" },
  tue: { enabled: true, start: "09:00", end: "17:00" },
  wed: { enabled: true, start: "09:00", end: "17:00" },
  thu: { enabled: true, start: "09:00", end: "17:00" },
  fri: { enabled: true, start: "09:00", end: "17:00" },
  sat: { enabled: false, start: "09:00", end: "13:00" },
  sun: { enabled: false, start: "09:00", end: "13:00" },
};

const defaultNotifications: NotificationSettings = {
  appointmentReminders: true,
  emailReminders: true,
  smsReminders: false,
  inAppNotifications: true,
};

const defaultSettings: ClinicSettings = {
  notifications: defaultNotifications,
  workingHours: defaultWorkingHours,
  clinicAddress: "",
  maxPatientsPerDoctor: {},
};

function loadSettings(): ClinicSettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (!s) return defaultSettings;
    const parsed = JSON.parse(s) as Partial<ClinicSettings>;
    return {
      notifications: { ...defaultNotifications, ...parsed.notifications },
      workingHours: { ...defaultWorkingHours, ...parsed.workingHours },
      clinicAddress: parsed.clinicAddress ?? defaultSettings.clinicAddress,
      maxPatientsPerDoctor: parsed.maxPatientsPerDoctor ?? defaultSettings.maxPatientsPerDoctor,
    };
  } catch {
    return defaultSettings;
  }
}

function saveSettings(s: ClinicSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

type SettingsContextType = {
  settings: ClinicSettings;
  setNotifications: (n: Partial<NotificationSettings>) => void;
  setWorkingHours: (day: WorkingHoursDay, hours: Partial<DayHours>) => void;
  setClinicAddress: (address: string) => void;
  setMaxPatientsForDoctor: (doctorId: string, max: number) => void;
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ClinicSettings>(defaultSettings);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const setNotifications = useCallback((n: Partial<NotificationSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, notifications: { ...prev.notifications, ...n } };
      saveSettings(next);
      return next;
    });
  }, []);

  const setWorkingHours = useCallback((day: WorkingHoursDay, hours: Partial<DayHours>) => {
    setSettings((prev) => {
      const next = {
        ...prev,
        workingHours: {
          ...prev.workingHours,
          [day]: { ...prev.workingHours[day], ...hours },
        },
      };
      saveSettings(next);
      return next;
    });
  }, []);

  const setClinicAddress = useCallback((address: string) => {
    setSettings((prev) => {
      const next = { ...prev, clinicAddress: address };
      saveSettings(next);
      return next;
    });
  }, []);

  const setMaxPatientsForDoctor = useCallback((doctorId: string, max: number) => {
    setSettings((prev) => {
      const next =
        max <= 0
          ? (() => {
              const { [doctorId]: _, ...rest } = prev.maxPatientsPerDoctor;
              return { ...prev, maxPatientsPerDoctor: rest };
            })()
          : { ...prev, maxPatientsPerDoctor: { ...prev.maxPatientsPerDoctor, [doctorId]: max } };
      saveSettings(next);
      return next;
    });
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        setNotifications,
        setWorkingHours,
        setClinicAddress,
        setMaxPatientsForDoctor,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}

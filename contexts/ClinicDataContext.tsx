"use client";

import { createContext, useContext, useState, useMemo } from "react";
import { patients as initialPatients } from "@/lib/mock-data";
import { doctors as initialDoctors } from "@/lib/doctors-data";
import { appointments as initialAppointments } from "@/lib/mock-data";
import type { Patient } from "@/types/patient";
import type { Doctor } from "@/types/doctor";
import type { Appointment } from "@/types/appointment";
import type { Staff } from "@/types/staff";

type ClinicDataContextType = {
  patients: Patient[];
  addPatient: (p: Patient) => void;
  updatePatient: (id: string, p: Omit<Patient, "id">) => void;
  removePatient: (id: string) => void;
  getPatientById: (id: string) => Patient | undefined;
  doctors: Doctor[];
  addDoctor: (d: Doctor) => void;
  updateDoctor: (id: string, d: Omit<Doctor, "id">) => void;
  removeDoctor: (id: string) => void;
  getDoctorById: (id: string) => Doctor | undefined;
  appointments: Appointment[];
  addAppointment: (a: Appointment) => void;
  updateAppointment: (id: string, a: Omit<Appointment, "id">) => void;
  staff: Staff[];
  addStaff: (s: Staff) => void;
  updateStaff: (id: string, s: Omit<Staff, "id">) => void;
  removeStaff: (id: string) => void;
  getStaffById: (id: string) => Staff | undefined;
};

const ClinicDataContext = createContext<ClinicDataContextType | null>(null);

export function ClinicDataProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(() => [...initialPatients]);
  const [doctors, setDoctors] = useState<Doctor[]>(() => [...initialDoctors]);
  const [appointments, setAppointments] = useState<Appointment[]>(() => [...initialAppointments]);
  const [staff, setStaff] = useState<Staff[]>(() => []);

  const value = useMemo(
    () => ({
      patients,
      addPatient: (p: Patient) => setPatients((prev) => [...prev, p]),
      updatePatient: (id: string, p: Omit<Patient, "id">) =>
        setPatients((prev) =>
          prev.map((x) => (x.id === id ? { ...p, id } : x))
        ),
      removePatient: (id: string) =>
        setPatients((prev) => prev.filter((x) => x.id !== id)),
      getPatientById: (id: string) => patients.find((x) => x.id === id),
      doctors,
      addDoctor: (d: Doctor) => setDoctors((prev) => [...prev, d]),
      updateDoctor: (id: string, d: Omit<Doctor, "id">) =>
        setDoctors((prev) =>
          prev.map((x) => (x.id === id ? { ...d, id } : x))
        ),
      removeDoctor: (id: string) =>
        setDoctors((prev) => prev.filter((x) => x.id !== id)),
      getDoctorById: (id: string) => doctors.find((x) => x.id === id),
      appointments,
      addAppointment: (a: Appointment) => setAppointments((prev) => [...prev, a]),
      updateAppointment: (id: string, a: Omit<Appointment, "id">) =>
        setAppointments((prev) =>
          prev.map((x) => (x.id === id ? { ...a, id } : x))
        ),
      staff,
      addStaff: (s: Staff) => setStaff((prev) => [...prev, s]),
      updateStaff: (id: string, s: Omit<Staff, "id">) =>
        setStaff((prev) =>
          prev.map((x) => (x.id === id ? { ...s, id } : x))
        ),
      removeStaff: (id: string) =>
        setStaff((prev) => prev.filter((x) => x.id !== id)),
      getStaffById: (id: string) => staff.find((x) => x.id === id),
    }),
    [patients, doctors, appointments, staff]
  );

  return (
    <ClinicDataContext.Provider value={value}>
      {children}
    </ClinicDataContext.Provider>
  );
}

export function useClinicData() {
  const ctx = useContext(ClinicDataContext);
  if (!ctx) throw new Error("useClinicData must be used within ClinicDataProvider");
  return ctx;
}

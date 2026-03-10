"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { getFirebaseDb, COLLECTIONS } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { stripUndefined } from "@/lib/firestore-utils";
import type { Patient } from "@/types/patient";
import type { Doctor } from "@/types/doctor";
import type { Appointment } from "@/types/appointment";
import type { Staff } from "@/types/staff";

type ClinicDataContextType = {
  patients: Patient[];
  addPatient: (p: Patient) => Promise<void>;
  updatePatient: (id: string, p: Omit<Patient, "id">) => Promise<void>;
  removePatient: (id: string) => Promise<void>;
  getPatientById: (id: string) => Patient | undefined;
  doctors: Doctor[];
  addDoctor: (d: Doctor) => Promise<void>;
  updateDoctor: (id: string, d: Omit<Doctor, "id">) => Promise<void>;
  removeDoctor: (id: string) => Promise<void>;
  getDoctorById: (id: string) => Doctor | undefined;
  appointments: Appointment[];
  addAppointment: (a: Appointment) => Promise<void>;
  updateAppointment: (id: string, a: Omit<Appointment, "id">) => Promise<void>;
  staff: Staff[];
  addStaff: (s: Staff) => Promise<void>;
  updateStaff: (id: string, s: Omit<Staff, "id">) => Promise<void>;
  removeStaff: (id: string) => Promise<void>;
  getStaffById: (id: string) => Staff | undefined;
  isDataLoading: boolean;
};

const ClinicDataContext = createContext<ClinicDataContextType | null>(null);

export function ClinicDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.uid ?? null;
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const db = getFirebaseDb();

  useEffect(() => {
    if (!db || !userId) {
      setPatients([]);
      setDoctors([]);
      setAppointments([]);
      setStaff([]);
      setIsDataLoading(false);
      return;
    }

    setIsDataLoading(true);
    const unsubs: (() => void)[] = [];

    const qPatients = query(
      collection(db, COLLECTIONS.PATIENTS),
      where("userId", "==", userId)
    );
    unsubs.push(
      onSnapshot(qPatients, (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Patient));
        setPatients(list);
      })
    );

    const qDoctors = query(
      collection(db, COLLECTIONS.DOCTORS),
      where("userId", "==", userId)
    );
    unsubs.push(
      onSnapshot(qDoctors, (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Doctor));
        setDoctors(list);
      })
    );

    const qAppointments = query(
      collection(db, COLLECTIONS.APPOINTMENTS),
      where("userId", "==", userId)
    );
    unsubs.push(
      onSnapshot(qAppointments, (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Appointment));
        setAppointments(list);
      })
    );

    const qStaff = query(
      collection(db, COLLECTIONS.STAFF),
      where("userId", "==", userId)
    );
    unsubs.push(
      onSnapshot(qStaff, (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Staff));
        setStaff(list);
      })
    );

    setIsDataLoading(false);

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [db, userId]);

  const addPatient = useCallback(
    async (p: Patient) => {
      if (!db) {
        throw new Error("Firestore is not configured. Check your .env.local and restart the dev server.");
      }
      if (!userId) {
        throw new Error("You must be signed in to add a patient.");
      }
      const docId = p.id;
      // Build a plain object with only primitives so Firestore stores every field
      const patientDoc: Record<string, string> = {
        userId,
        firstName: p.firstName ?? "",
        lastName: p.lastName ?? "",
        dateOfBirth: p.dateOfBirth ?? "",
        email: p.email ?? "",
        phone: p.phone ?? "",
        gender: p.gender ?? "other",
      };
      if (p.bloodType != null && p.bloodType !== "") patientDoc.bloodType = p.bloodType;
      if (p.address != null && p.address !== "") patientDoc.address = p.address;
      if (p.lastVisit != null && p.lastVisit !== "") patientDoc.lastVisit = p.lastVisit;
      if (p.notes != null && p.notes !== "") patientDoc.notes = p.notes;
      try {
        await setDoc(doc(db, COLLECTIONS.PATIENTS, docId), patientDoc);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`Failed to add patient to Firestore: ${message}`);
      }
    },
    [db, userId]
  );

  const updatePatient = useCallback(
    async (id: string, p: Omit<Patient, "id">) => {
      if (!db || !userId) return;
      await setDoc(doc(db, COLLECTIONS.PATIENTS, id), stripUndefined({ ...p, userId }), { merge: true });
    },
    [db, userId]
  );

  const removePatient = useCallback(
    async (id: string) => {
      if (!db) return;
      await deleteDoc(doc(db, COLLECTIONS.PATIENTS, id));
    },
    [db]
  );

  const addDoctor = useCallback(
    async (d: Doctor) => {
      if (!db) {
        throw new Error("Firestore is not configured. Check your .env.local and restart the dev server.");
      }
      if (!userId) {
        throw new Error("You must be signed in to add a doctor.");
      }
      const docId = d.id;
      const doctorDoc: Record<string, unknown> = {
        userId,
        firstName: d.firstName ?? "",
        lastName: d.lastName ?? "",
        title: d.title ?? "MD",
        specializations: Array.isArray(d.specializations) ? d.specializations : [],
        qualification: d.qualification ?? "",
        consultationFee: typeof d.consultationFee === "number" ? d.consultationFee : 0,
        phone: d.phone ?? "",
        email: d.email ?? "",
        schedule: Array.isArray(d.schedule) ? d.schedule : [],
      };
      if (d.bio != null && d.bio !== "") doctorDoc.bio = d.bio;
      if (d.profilePhoto != null && d.profilePhoto !== "") doctorDoc.profilePhoto = d.profilePhoto;
      try {
        await setDoc(doc(db, COLLECTIONS.DOCTORS, docId), doctorDoc);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`Failed to add doctor to Firestore: ${message}`);
      }
    },
    [db, userId]
  );

  const updateDoctor = useCallback(
    async (id: string, d: Omit<Doctor, "id">) => {
      if (!db || !userId) return;
      await setDoc(doc(db, COLLECTIONS.DOCTORS, id), stripUndefined({ ...d, userId }), { merge: true });
    },
    [db, userId]
  );

  const removeDoctor = useCallback(
    async (id: string) => {
      if (!db) return;
      await deleteDoc(doc(db, COLLECTIONS.DOCTORS, id));
    },
    [db]
  );

  const addAppointment = useCallback(
    async (a: Appointment) => {
      if (!db) {
        throw new Error("Firestore is not configured. Check your .env.local and restart the dev server.");
      }
      if (!userId) {
        throw new Error("You must be signed in to add an appointment.");
      }
      const docId = a.id;
      const appointmentDoc: Record<string, string> = {
        userId,
        patientId: a.patientId ?? "",
        patientName: a.patientName ?? "",
        date: a.date ?? "",
        time: a.time ?? "",
        type: a.type ?? "checkup",
        status: a.status ?? "scheduled",
      };
      if (a.doctor != null && a.doctor !== "") appointmentDoc.doctor = a.doctor;
      if (a.doctorId != null && a.doctorId !== "") appointmentDoc.doctorId = a.doctorId;
      if (a.notes != null && a.notes !== "") appointmentDoc.notes = a.notes;
      try {
        await setDoc(doc(db, COLLECTIONS.APPOINTMENTS, docId), appointmentDoc);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`Failed to add appointment to Firestore: ${message}`);
      }
    },
    [db, userId]
  );

  const updateAppointment = useCallback(
    async (id: string, a: Omit<Appointment, "id">) => {
      if (!db || !userId) return;
      await setDoc(doc(db, COLLECTIONS.APPOINTMENTS, id), stripUndefined({ ...a, userId }), { merge: true });
    },
    [db, userId]
  );

  const addStaff = useCallback(
    async (s: Staff) => {
      if (!db) {
        throw new Error("Firestore is not configured. Check your .env.local and restart the dev server.");
      }
      if (!userId) {
        throw new Error("You must be signed in to add staff.");
      }
      const docId = s.id;
      const staffDoc: Record<string, string> = {
        userId,
        firstName: s.firstName ?? "",
        lastName: s.lastName ?? "",
        role: s.role ?? "",
        email: s.email ?? "",
        phone: s.phone ?? "",
      };
      if (s.department != null && s.department !== "") staffDoc.department = s.department;
      if (s.notes != null && s.notes !== "") staffDoc.notes = s.notes;
      try {
        await setDoc(doc(db, COLLECTIONS.STAFF, docId), staffDoc);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`Failed to add staff to Firestore: ${message}`);
      }
    },
    [db, userId]
  );

  const updateStaff = useCallback(
    async (id: string, s: Omit<Staff, "id">) => {
      if (!db || !userId) return;
      await setDoc(doc(db, COLLECTIONS.STAFF, id), stripUndefined({ ...s, userId }), { merge: true });
    },
    [db, userId]
  );

  const removeStaff = useCallback(
    async (id: string) => {
      if (!db) return;
      await deleteDoc(doc(db, COLLECTIONS.STAFF, id));
    },
    [db]
  );

  const value: ClinicDataContextType = {
    patients,
    addPatient,
    updatePatient,
    removePatient,
    getPatientById: (id: string) => patients.find((x) => x.id === id),
    doctors,
    addDoctor,
    updateDoctor,
    removeDoctor,
    getDoctorById: (id: string) => doctors.find((x) => x.id === id),
    appointments,
    addAppointment,
    updateAppointment,
    staff,
    addStaff,
    updateStaff,
    removeStaff,
    getStaffById: (id: string) => staff.find((x) => x.id === id),
    isDataLoading,
  };

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

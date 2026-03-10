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
      if (!db || !userId) return;
      const { id, ...data } = p;
      await setDoc(doc(db, COLLECTIONS.PATIENTS, id), stripUndefined({ ...data, userId }));
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
      if (!db || !userId) return;
      const { id, ...data } = d;
      await setDoc(doc(db, COLLECTIONS.DOCTORS, id), stripUndefined({ ...data, userId }));
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
      if (!db || !userId) return;
      const { id, ...data } = a;
      await setDoc(doc(db, COLLECTIONS.APPOINTMENTS, id), stripUndefined({ ...data, userId }));
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
      if (!db || !userId) return;
      const { id, ...data } = s;
      await setDoc(doc(db, COLLECTIONS.STAFF, id), stripUndefined({ ...data, userId }));
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

"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  setDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb, COLLECTIONS } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useClinic } from "@/contexts/ClinicContext";
import { stripUndefined } from "@/lib/firestore-utils";
import type { Patient } from "@/types/patient";
import type { Doctor } from "@/types/doctor";
import type { Appointment } from "@/types/appointment";
import type { Staff } from "@/types/staff";
import type { ClinicMessage } from "@/types/message";
import type { Prescription, PrescriptionMedication } from "@/types/prescription";
import type { Report } from "@/types/report";

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
  removeAppointment: (id: string) => Promise<void>;
  staff: Staff[];
  addStaff: (s: Staff) => Promise<void>;
  updateStaff: (id: string, s: Omit<Staff, "id">) => Promise<void>;
  removeStaff: (id: string) => Promise<void>;
  getStaffById: (id: string) => Staff | undefined;
  messages: ClinicMessage[];
  addMessage: (m: Omit<ClinicMessage, "id" | "createdAt" | "userId">) => Promise<void>;
  updateMessage: (id: string, m: Partial<Omit<ClinicMessage, "id" | "userId" | "createdAt">>) => Promise<void>;
  removeMessage: (id: string) => Promise<void>;
  prescriptions: Prescription[];
  addPrescription: (p: Prescription) => Promise<void>;
  updatePrescription: (id: string, p: Omit<Prescription, "id">) => Promise<void>;
  removePrescription: (id: string) => Promise<void>;
  reports: Report[];
  addReport: (r: Report) => Promise<void>;
  updateReport: (id: string, r: Omit<Report, "id">) => Promise<void>;
  removeReport: (id: string) => Promise<void>;
  isDataLoading: boolean;
};

const ClinicDataContext = createContext<ClinicDataContextType | null>(null);

export function ClinicDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.uid ?? null;
  const { currentClinicId } = useClinic();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [messages, setMessages] = useState<ClinicMessage[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const db = getFirebaseDb();

  useEffect(() => {
    if (!db || !userId || !currentClinicId) {
      setPatients([]);
      setDoctors([]);
      setAppointments([]);
      setStaff([]);
      setMessages([]);
      setPrescriptions([]);
      setReports([]);
      setIsDataLoading(false);
      return;
    }

    setIsDataLoading(true);
    const unsubs: (() => void)[] = [];

    const qPatients = query(
      collection(db, COLLECTIONS.CLINICS, currentClinicId, COLLECTIONS.PATIENTS)
    );
    unsubs.push(
      onSnapshot(qPatients, (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Patient));
        setPatients(list);
      })
    );

    const qDoctors = query(
      collection(db, COLLECTIONS.CLINICS, currentClinicId, COLLECTIONS.DOCTORS)
    );
    unsubs.push(
      onSnapshot(qDoctors, (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Doctor));
        setDoctors(list);
      })
    );

    const qAppointments = query(
      collection(db, COLLECTIONS.CLINICS, currentClinicId, COLLECTIONS.APPOINTMENTS)
    );
    unsubs.push(
      onSnapshot(qAppointments, (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Appointment));
        setAppointments(list);
      })
    );

    const qStaff = query(
      collection(db, COLLECTIONS.CLINICS, currentClinicId, COLLECTIONS.STAFF)
    );
    unsubs.push(
      onSnapshot(qStaff, (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Staff));
        setStaff(list);
      })
    );

    const qMessages = query(
      collection(db, COLLECTIONS.CLINICS, currentClinicId, COLLECTIONS.MESSAGES)
    );
    unsubs.push(
      onSnapshot(qMessages, (snap) => {
        const list = snap.docs
          .map((d) => {
            const data = d.data();
            const createdAt = data.createdAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString();
            return {
              id: d.id,
              userId: data.userId as string,
              sentBy: (data.sentBy as ClinicMessage["sentBy"]) ?? "clinic",
              recipientType: data.recipientType as "doctor" | "patient",
              recipientId: data.recipientId as string,
              recipientName: data.recipientName as string,
              text: data.text as string,
              createdAt,
              sendViaWhatsApp: data.sendViaWhatsApp === true,
              sendViaSms: data.sendViaSms === true,
              sendViaEmail: data.sendViaEmail === true,
            } as ClinicMessage;
          })
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setMessages(list);
      })
    );

    const qPrescriptions = query(
      collection(db, COLLECTIONS.CLINICS, currentClinicId, COLLECTIONS.PRESCRIPTIONS)
    );
    unsubs.push(
      onSnapshot(qPrescriptions, (snap) => {
        const list = snap.docs.map((d) => {
          const data = d.data();
          const meds = (data.medications as PrescriptionMedication[] | undefined) ?? [];
          return {
            id: d.id,
            userId: data.userId as string,
            patientId: data.patientId as string,
            patientName: data.patientName as string,
            doctorId: data.doctorId as string,
            doctorName: data.doctorName as string,
            date: data.date as string,
            diagnosis: data.diagnosis as string | undefined,
            medications: Array.isArray(meds) ? meds : [],
            notes: data.notes as string | undefined,
            followUp: data.followUp as string | undefined,
          } as Prescription;
        });
        setPrescriptions(list);
      })
    );

    const qReports = query(
      collection(db, COLLECTIONS.CLINICS, currentClinicId, COLLECTIONS.REPORTS)
    );
    unsubs.push(
      onSnapshot(qReports, (snap) => {
        const list = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            userId: data.userId as string,
            patientId: data.patientId as string,
            patientName: data.patientName as string,
            doctorId: data.doctorId as string,
            doctorName: data.doctorName as string,
            type: data.type as Report["type"],
            title: data.title as string,
            date: data.date as string,
            summary: data.summary as string | undefined,
            findings: data.findings as string | undefined,
            fileUrl: data.fileUrl as string | undefined,
            status: data.status as Report["status"],
          } as Report;
        });
        setReports(list);
      })
    );

    setIsDataLoading(false);

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [db, userId, currentClinicId]);

  const addPatient = useCallback(
    async (p: Patient) => {
      if (!db) {
        throw new Error("Firestore is not configured. Check your .env.local and restart the dev server.");
      }
      if (!userId || !currentClinicId) {
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
        await setDoc(doc(db, COLLECTIONS.CLINICS, currentClinicId, COLLECTIONS.PATIENTS, docId), patientDoc);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`Failed to add patient to Firestore: ${message}`);
      }
    },
    [db, userId, currentClinicId]
  );

  const updatePatient = useCallback(
    async (id: string, p: Omit<Patient, "id">) => {
      if (!db || !userId || !currentClinicId) return;
      await setDoc(
        doc(db, COLLECTIONS.CLINICS, currentClinicId, COLLECTIONS.PATIENTS, id),
        stripUndefined({ ...p, userId }),
        { merge: true }
      );
    },
    [db, userId, currentClinicId]
  );

  const removePatient = useCallback(
    async (id: string) => {
      if (!db || !currentClinicId) return;
      await deleteDoc(doc(db, COLLECTIONS.CLINICS, currentClinicId, COLLECTIONS.PATIENTS, id));
    },
    [db, currentClinicId]
  );

  const addDoctor = useCallback(
    async (d: Doctor) => {
      if (!db) {
        throw new Error("Firestore is not configured. Check your .env.local and restart the dev server.");
      }
      if (!userId || !currentClinicId) {
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
        scheduleTime: typeof d.scheduleTime === "string" ? d.scheduleTime : "",
        schedule: Array.isArray(d.schedule) ? d.schedule : [],
      };
      if (d.bio != null && d.bio !== "") doctorDoc.bio = d.bio;
      if (d.profilePhoto != null && d.profilePhoto !== "") doctorDoc.profilePhoto = d.profilePhoto;
      try {
        await setDoc(doc(db, COLLECTIONS.CLINICS, currentClinicId, COLLECTIONS.DOCTORS, docId), doctorDoc);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`Failed to add doctor to Firestore: ${message}`);
      }
    },
    [db, userId, currentClinicId]
  );

  const updateDoctor = useCallback(
    async (id: string, d: Omit<Doctor, "id">) => {
      if (!db || !userId || !currentClinicId) return;
      await setDoc(
        doc(db, COLLECTIONS.CLINICS, currentClinicId, COLLECTIONS.DOCTORS, id),
        stripUndefined({ ...d, userId }),
        { merge: true }
      );
    },
    [db, userId, currentClinicId]
  );

  const removeDoctor = useCallback(
    async (id: string) => {
      if (!db || !currentClinicId) return;
      await deleteDoc(doc(db, COLLECTIONS.CLINICS, currentClinicId, COLLECTIONS.DOCTORS, id));
    },
    [db, currentClinicId]
  );

  const addAppointment = useCallback(
    async (a: Appointment) => {
      if (!db) {
        throw new Error("Firestore is not configured. Check your .env.local and restart the dev server.");
      }
      if (!userId || !currentClinicId) {
        throw new Error("You must be signed in to add an appointment.");
      }
      const docId = a.id;
      const appointmentDoc: Record<string, unknown> = {
        userId,
        patientId: a.patientId ?? "",
        patientName: a.patientName ?? "",
        date: a.date ?? "",
        time: a.time ?? "",
        type: a.type ?? "checkup",
        status: a.status ?? "scheduled",
      };
      if (a.tokenNumber != null) appointmentDoc.tokenNumber = a.tokenNumber;
      if (a.doctor != null && a.doctor !== "") appointmentDoc.doctor = a.doctor;
      if (a.doctorId != null && a.doctorId !== "") appointmentDoc.doctorId = a.doctorId;
      if (a.notes != null && a.notes !== "") appointmentDoc.notes = a.notes;
      try {
        await setDoc(doc(db, COLLECTIONS.CLINICS, currentClinicId, COLLECTIONS.APPOINTMENTS, docId), appointmentDoc);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`Failed to add appointment to Firestore: ${message}`);
      }
    },
    [db, userId, currentClinicId]
  );

  const updateAppointment = useCallback(
    async (id: string, a: Omit<Appointment, "id">) => {
      if (!db || !userId || !currentClinicId) return;
      await setDoc(
        doc(db, COLLECTIONS.CLINICS, currentClinicId, COLLECTIONS.APPOINTMENTS, id),
        stripUndefined({ ...a, userId }),
        { merge: true }
      );
    },
    [db, userId, currentClinicId]
  );

  const removeAppointment = useCallback(
    async (id: string) => {
      if (!db || !currentClinicId) return;
      await deleteDoc(doc(db, COLLECTIONS.CLINICS, currentClinicId, COLLECTIONS.APPOINTMENTS, id));
    },
    [db, currentClinicId]
  );

  const addStaff = useCallback(
    async (s: Staff) => {
      if (!db) {
        throw new Error("Firestore is not configured. Check your .env.local and restart the dev server.");
      }
      if (!userId || !currentClinicId) {
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
        await setDoc(doc(db, COLLECTIONS.CLINICS, currentClinicId, COLLECTIONS.STAFF, docId), staffDoc);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`Failed to add staff to Firestore: ${message}`);
      }
    },
    [db, userId, currentClinicId]
  );

  const updateStaff = useCallback(
    async (id: string, s: Omit<Staff, "id">) => {
      if (!db || !userId || !currentClinicId) return;
      await setDoc(
        doc(db, COLLECTIONS.CLINICS, currentClinicId, COLLECTIONS.STAFF, id),
        stripUndefined({ ...s, userId }),
        { merge: true }
      );
    },
    [db, userId, currentClinicId]
  );

  const removeStaff = useCallback(
    async (id: string) => {
      if (!db || !currentClinicId) return;
      await deleteDoc(doc(db, COLLECTIONS.CLINICS, currentClinicId, COLLECTIONS.STAFF, id));
    },
    [db, currentClinicId]
  );

  const addMessage = useCallback(
    async (m: Omit<ClinicMessage, "id" | "createdAt" | "userId">) => {
      if (!db) {
        throw new Error("Firestore is not configured. Check your .env.local and restart the dev server.");
      }
      if (!userId || !currentClinicId) {
        throw new Error("You must be signed in to send a message.");
      }
      const sentBy = m.sentBy ?? "clinic";
      try {
        await addDoc(collection(db, COLLECTIONS.CLINICS, currentClinicId, COLLECTIONS.MESSAGES), {
          userId,
          sentBy,
          recipientType: m.recipientType,
          recipientId: m.recipientId,
          recipientName: m.recipientName,
          text: m.text ?? "",
          createdAt: serverTimestamp(),
          sendViaWhatsApp: m.sendViaWhatsApp === true,
          sendViaSms: m.sendViaSms === true,
          sendViaEmail: m.sendViaEmail === true,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`Failed to send message: ${message}`);
      }
    },
    [db, userId, currentClinicId]
  );

  const updateMessage = useCallback(
    async (id: string, m: Partial<Omit<ClinicMessage, "id" | "userId" | "createdAt">>) => {
      if (!db || !userId || !currentClinicId) return;
      const docRef = doc(db, COLLECTIONS.CLINICS, currentClinicId, COLLECTIONS.MESSAGES, id);
      const update: Record<string, unknown> = {};
      if (m.recipientType != null) update.recipientType = m.recipientType;
      if (m.recipientId != null) update.recipientId = m.recipientId;
      if (m.recipientName != null) update.recipientName = m.recipientName;
      if (m.text != null) update.text = m.text;
      if (m.sentBy != null) update.sentBy = m.sentBy;
      if (typeof m.sendViaWhatsApp === "boolean") update.sendViaWhatsApp = m.sendViaWhatsApp;
      if (typeof m.sendViaSms === "boolean") update.sendViaSms = m.sendViaSms;
      if (typeof m.sendViaEmail === "boolean") update.sendViaEmail = m.sendViaEmail;
      await setDoc(docRef, update, { merge: true });
    },
    [db, userId, currentClinicId]
  );

  const removeMessage = useCallback(
    async (id: string) => {
      if (!db || !currentClinicId) return;
      await deleteDoc(doc(db, COLLECTIONS.CLINICS, currentClinicId, COLLECTIONS.MESSAGES, id));
    },
    [db, currentClinicId]
  );

  const addPrescription = useCallback(
    async (p: Prescription) => {
      if (!db || !userId || !currentClinicId) throw new Error("Not configured or not signed in.");
      const docId = p.id;
      const medications = Array.isArray(p.medications) ? p.medications : [];
      const docData: Record<string, unknown> = {
        userId,
        patientId: p.patientId ?? "",
        patientName: p.patientName ?? "",
        doctorId: p.doctorId ?? "",
        doctorName: p.doctorName ?? "",
        date: p.date ?? "",
        medications,
      };
      if (p.diagnosis != null && p.diagnosis !== "") docData.diagnosis = p.diagnosis;
      if (p.notes != null && p.notes !== "") docData.notes = p.notes;
      if (p.followUp != null && p.followUp !== "") docData.followUp = p.followUp;
      await setDoc(doc(db, COLLECTIONS.CLINICS, currentClinicId, COLLECTIONS.PRESCRIPTIONS, docId), docData);
    },
    [db, userId, currentClinicId]
  );

  const updatePrescription = useCallback(
    async (id: string, p: Omit<Prescription, "id">) => {
      if (!db || !userId || !currentClinicId) return;
      const medications = Array.isArray(p.medications) ? p.medications : [];
      await setDoc(
        doc(db, COLLECTIONS.CLINICS, currentClinicId, COLLECTIONS.PRESCRIPTIONS, id),
        stripUndefined({ ...p, userId, medications }),
        { merge: true }
      );
    },
    [db, userId, currentClinicId]
  );

  const removePrescription = useCallback(
    async (id: string) => {
      if (!db || !currentClinicId) return;
      await deleteDoc(doc(db, COLLECTIONS.CLINICS, currentClinicId, COLLECTIONS.PRESCRIPTIONS, id));
    },
    [db, currentClinicId]
  );

  const addReport = useCallback(
    async (r: Report) => {
      if (!db || !userId || !currentClinicId) throw new Error("Not configured or not signed in.");
      const docId = r.id;
      const docData: Record<string, unknown> = {
        userId,
        patientId: r.patientId ?? "",
        patientName: r.patientName ?? "",
        doctorId: r.doctorId ?? "",
        doctorName: r.doctorName ?? "",
        type: r.type ?? "other",
        title: r.title ?? "",
        date: r.date ?? "",
        status: r.status ?? "pending",
      };
      if (r.summary != null && r.summary !== "") docData.summary = r.summary;
      if (r.findings != null && r.findings !== "") docData.findings = r.findings;
      if (r.fileUrl != null && r.fileUrl !== "") docData.fileUrl = r.fileUrl;
      await setDoc(doc(db, COLLECTIONS.CLINICS, currentClinicId, COLLECTIONS.REPORTS, docId), docData);
    },
    [db, userId, currentClinicId]
  );

  const updateReport = useCallback(
    async (id: string, r: Omit<Report, "id">) => {
      if (!db || !userId || !currentClinicId) return;
      await setDoc(
        doc(db, COLLECTIONS.CLINICS, currentClinicId, COLLECTIONS.REPORTS, id),
        stripUndefined({ ...r, userId }),
        { merge: true }
      );
    },
    [db, userId, currentClinicId]
  );

  const removeReport = useCallback(
    async (id: string) => {
      if (!db || !currentClinicId) return;
      await deleteDoc(doc(db, COLLECTIONS.CLINICS, currentClinicId, COLLECTIONS.REPORTS, id));
    },
    [db, currentClinicId]
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
    removeAppointment,
    staff,
    addStaff,
    updateStaff,
    removeStaff,
    getStaffById: (id: string) => staff.find((x) => x.id === id),
    messages,
    addMessage,
    updateMessage,
    removeMessage,
    prescriptions,
    addPrescription,
    updatePrescription,
    removePrescription,
    reports,
    addReport,
    updateReport,
    removeReport,
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

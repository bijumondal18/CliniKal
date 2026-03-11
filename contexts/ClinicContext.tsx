"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { collection, doc, onSnapshot, setDoc } from "firebase/firestore";
import { getFirebaseDb, COLLECTIONS } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

export type ClinicProfile = {
  clinicName: string;
  clinicAddress: string;
  clinicImage: string;
};

export type ClinicSummary = {
  id: string;
  role: "admin" | "member";
  clinicName: string;
  clinicAddress: string;
  clinicImage: string;
};

type ClinicContextType = {
  clinics: ClinicSummary[];
  currentClinicId: string | null;
  currentClinic: ClinicSummary | null;
  isClinicLoading: boolean;
  setCurrentClinicId: (clinicId: string) => void;
  createClinic: (data: ClinicProfile) => Promise<string>;
  saveClinic: (data: ClinicProfile) => Promise<void>;
};

const ClinicContext = createContext<ClinicContextType | null>(null);

const STORAGE_KEY = "current-clinic-id";

export function ClinicProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.uid ?? null;
  const [clinics, setClinics] = useState<ClinicSummary[]>([]);
  const [currentClinicId, _setCurrentClinicId] = useState<string | null>(null);
  const [isClinicLoading, setIsClinicLoading] = useState(true);
  const db = getFirebaseDb();

  useEffect(() => {
    if (!db || !userId) {
      setClinics([]);
      _setCurrentClinicId(null);
      setIsClinicLoading(false);
      return;
    }

    setIsClinicLoading(true);
    const membershipRef = collection(db, "users", userId, "clinics");
    const unsub = onSnapshot(
      membershipRef,
      async (snap) => {
        const nextClinics: ClinicSummary[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            role: (data.role as ClinicSummary["role"]) ?? "member",
            clinicName: (data.clinicName as string) ?? "",
            clinicAddress: (data.clinicAddress as string) ?? "",
            clinicImage: (data.clinicImage as string) ?? "",
          };
        });

        if (nextClinics.length === 0) {
          // First-time user: auto-create a clinic and make them admin.
          const clinicRef = doc(collection(db, COLLECTIONS.CLINICS));
          const clinicId = clinicRef.id;
          const defaultProfile: ClinicProfile = { clinicName: "My Clinic", clinicAddress: "", clinicImage: "" };
          await setDoc(clinicRef, {
            clinicName: defaultProfile.clinicName,
            clinicAddress: defaultProfile.clinicAddress,
            clinicImage: defaultProfile.clinicImage,
            createdAt: new Date().toISOString(),
            createdByUserId: userId,
          });
          await setDoc(doc(db, COLLECTIONS.CLINICS, clinicId, "users", userId), {
            role: "admin",
            joinedAt: new Date().toISOString(),
          });
          await setDoc(doc(db, "users", userId, "clinics", clinicId), {
            role: "admin",
            clinicName: defaultProfile.clinicName,
            clinicAddress: defaultProfile.clinicAddress,
            clinicImage: defaultProfile.clinicImage,
            updatedAt: new Date().toISOString(),
          });
          // Snapshot will re-fire with the new membership.
          return;
        }

        setClinics(nextClinics);

        const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
        const preferred = stored && nextClinics.some((c) => c.id === stored) ? stored : nextClinics[0].id;
        _setCurrentClinicId((prev) => prev ?? preferred);
        setIsClinicLoading(false);
      },
      () => {
        setClinics([]);
        _setCurrentClinicId(null);
        setIsClinicLoading(false);
      }
    );

    return () => unsub();
  }, [db, userId]);

  const setCurrentClinicId = useCallback((clinicId: string) => {
    _setCurrentClinicId(clinicId);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, clinicId);
  }, []);

  const createClinic = useCallback(
    async (data: ClinicProfile): Promise<string> => {
      if (!db || !userId) {
        throw new Error("You must be signed in to create a clinic.");
      }
      const clinicRef = doc(collection(db, COLLECTIONS.CLINICS));
      const clinicId = clinicRef.id;
      await setDoc(clinicRef, {
        clinicName: data.clinicName ?? "",
        clinicAddress: data.clinicAddress ?? "",
        clinicImage: data.clinicImage ?? "",
        createdAt: new Date().toISOString(),
        createdByUserId: userId,
      });
      await setDoc(doc(db, COLLECTIONS.CLINICS, clinicId, "users", userId), {
        role: "admin",
        joinedAt: new Date().toISOString(),
      });
      await setDoc(doc(db, "users", userId, "clinics", clinicId), {
        role: "admin",
        clinicName: data.clinicName ?? "",
        clinicAddress: data.clinicAddress ?? "",
        clinicImage: data.clinicImage ?? "",
        updatedAt: new Date().toISOString(),
      });
      setCurrentClinicId(clinicId);
      return clinicId;
    },
    [db, userId, setCurrentClinicId]
  );

  const saveClinic = useCallback(
    async (data: ClinicProfile) => {
      if (!db || !userId || !currentClinicId) {
        throw new Error("You must be signed in to save clinic details.");
      }
      const payload = {
        clinicName: data.clinicName ?? "",
        clinicAddress: data.clinicAddress ?? "",
        clinicImage: data.clinicImage ?? "",
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, COLLECTIONS.CLINICS, currentClinicId), payload, { merge: true });
      await setDoc(doc(db, "users", userId, "clinics", currentClinicId), payload, { merge: true });
      setClinics((prev) =>
        prev.map((c) => (c.id === currentClinicId ? { ...c, ...payload } : c))
      );
    },
    [db, userId, currentClinicId]
  );

  const currentClinic = currentClinicId ? clinics.find((c) => c.id === currentClinicId) ?? null : null;

  return (
    <ClinicContext.Provider
      value={{
        clinics,
        currentClinicId,
        currentClinic,
        isClinicLoading,
        setCurrentClinicId,
        createClinic,
        saveClinic,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
}

export function useClinic() {
  const ctx = useContext(ClinicContext);
  if (!ctx) throw new Error("useClinic must be used within ClinicProvider");
  return ctx;
}

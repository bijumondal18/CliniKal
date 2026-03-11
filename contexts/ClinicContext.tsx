"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { getFirebaseDb, COLLECTIONS } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

export type ClinicProfile = {
  clinicName: string;
  clinicAddress: string;
  clinicImage: string;
};

type ClinicContextType = {
  clinic: ClinicProfile | null;
  isClinicLoading: boolean;
  saveClinic: (data: ClinicProfile) => Promise<void>;
};

const defaultClinic: ClinicProfile = {
  clinicName: "",
  clinicAddress: "",
  clinicImage: "",
};

const ClinicContext = createContext<ClinicContextType | null>(null);

export function ClinicProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.uid ?? null;
  const [clinic, setClinic] = useState<ClinicProfile | null>(null);
  const [isClinicLoading, setIsClinicLoading] = useState(true);
  const db = getFirebaseDb();

  useEffect(() => {
    if (!db || !userId) {
      setClinic(null);
      setIsClinicLoading(false);
      return;
    }
    setIsClinicLoading(true);
    const docRef = doc(db, COLLECTIONS.CLINICS, userId);
    const unsub = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          setClinic({
            clinicName: (d.clinicName as string) ?? "",
            clinicAddress: (d.clinicAddress as string) ?? "",
            clinicImage: (d.clinicImage as string) ?? "",
          });
        } else {
          setClinic(null);
        }
        setIsClinicLoading(false);
      },
      () => {
        setClinic(null);
        setIsClinicLoading(false);
      }
    );
    return () => unsub();
  }, [db, userId]);

  const saveClinic = useCallback(
    async (data: ClinicProfile) => {
      if (!db || !userId) {
        throw new Error("You must be signed in to save clinic details.");
      }
      const docRef = doc(db, COLLECTIONS.CLINICS, userId);
      const payload = {
        userId,
        clinicName: data.clinicName ?? "",
        clinicAddress: data.clinicAddress ?? "",
        clinicImage: data.clinicImage ?? "",
      };
      await setDoc(docRef, payload);
      setClinic({
        clinicName: payload.clinicName,
        clinicAddress: payload.clinicAddress,
        clinicImage: payload.clinicImage,
      });
    },
    [db, userId]
  );

  return (
    <ClinicContext.Provider value={{ clinic, isClinicLoading, saveClinic }}>
      {children}
    </ClinicContext.Provider>
  );
}

export function useClinic() {
  const ctx = useContext(ClinicContext);
  if (!ctx) throw new Error("useClinic must be used within ClinicProvider");
  return ctx;
}

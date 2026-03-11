"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { getFirebaseDb, COLLECTIONS } from "@/lib/firebase";
import { useClinic } from "@/contexts/ClinicContext";
import type { Membership, MembershipPlanId, MembershipStatus } from "@/types/membership";
import { isMembershipActive } from "@/types/membership";

type MembershipContextType = {
  membership: Membership | null;
  isActive: boolean;
  isLoading: boolean;
};

const MembershipContext = createContext<MembershipContextType | null>(null);

function parseMembership(data: Record<string, unknown> | undefined): Membership | null {
  if (!data) return null;
  const planId = (data.membershipPlan as MembershipPlanId) ?? "free";
  const status = (data.membershipStatus as MembershipStatus) ?? "active";
  return {
    planId,
    status,
    trialEndsAt: (data.trialEndsAt as string) ?? null,
    stripeCustomerId: (data.stripeCustomerId as string) ?? null,
    stripeSubscriptionId: (data.stripeSubscriptionId as string) ?? null,
    currentPeriodEnd: (data.currentPeriodEnd as string) ?? null,
  };
}

export function MembershipProvider({ children }: { children: React.ReactNode }) {
  const { currentClinicId } = useClinic();
  const [membership, setMembership] = useState<Membership | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const db = getFirebaseDb();

  useEffect(() => {
    if (!db || !currentClinicId) {
      setMembership(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const clinicRef = doc(db, COLLECTIONS.CLINICS, currentClinicId);
    const unsub = onSnapshot(
      clinicRef,
      (snap) => {
        setMembership(parseMembership(snap.data() as Record<string, unknown>));
        setIsLoading(false);
      },
      () => {
        setMembership(null);
        setIsLoading(false);
      }
    );
    return () => unsub();
  }, [db, currentClinicId]);

  const isActive = isMembershipActive(membership);

  return (
    <MembershipContext.Provider value={{ membership, isActive, isLoading }}>
      {children}
    </MembershipContext.Provider>
  );
}

export function useMembership() {
  const ctx = useContext(MembershipContext);
  if (!ctx) throw new Error("useMembership must be used within MembershipProvider");
  return ctx;
}

/** Plan identifier for display and feature gating */
export type MembershipPlanId = "free" | "trial" | "basic" | "pro" | "enterprise";

/** Billing/subscription status from your payment provider (e.g. Stripe) */
export type MembershipStatus =
  | "trialing"   // In trial period
  | "active"     // Paid and in good standing
  | "past_due"   // Payment failed, retrying
  | "canceled"   // User canceled, access until period end
  | "expired"    // No longer has access
  | "incomplete"; // Checkout not completed

export type Membership = {
  planId: MembershipPlanId;
  status: MembershipStatus;
  /** ISO date string; when trial ends (if status is trialing) */
  trialEndsAt?: string | null;
  /** Payment provider customer ID (e.g. Stripe customer id) */
  stripeCustomerId?: string | null;
  /** Payment provider subscription ID (e.g. Stripe subscription id) */
  stripeSubscriptionId?: string | null;
  /** ISO date; current billing period end */
  currentPeriodEnd?: string | null;
};

/** Default for new clinics: 14-day trial */
export const DEFAULT_TRIAL_DAYS = 14;

export function getTrialEndDate(days: number = DEFAULT_TRIAL_DAYS): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Whether the clinic has access to the product (trial or active paid) */
export function isMembershipActive(m: Membership | null): boolean {
  if (!m) return true; // No membership record yet = allow (e.g. legacy clinic)
  if (m.status === "active") return true;
  if (m.status === "trialing" && m.trialEndsAt) {
    return new Date(m.trialEndsAt) > new Date();
  }
  if (m.status === "canceled" && m.currentPeriodEnd) {
    return new Date(m.currentPeriodEnd) > new Date();
  }
  return false;
}

export const PLAN_LABELS: Record<MembershipPlanId, string> = {
  free: "Free",
  trial: "Trial",
  basic: "Basic",
  pro: "Pro",
  enterprise: "Enterprise",
};

export const STATUS_LABELS: Record<MembershipStatus, string> = {
  trialing: "Trial",
  active: "Active",
  past_due: "Past due",
  canceled: "Canceled",
  expired: "Expired",
  incomplete: "Incomplete",
};

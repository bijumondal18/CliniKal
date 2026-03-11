"use client";

import Link from "next/link";

export default function UpgradePlanPage() {
  return (
    <div className="py-4 sm:p-8">
      <div className="mb-6">
        <Link href="/dashboard/settings" className="text-sm font-medium text-blue-600 hover:text-blue-700">
          ← Back to Settings
        </Link>
      </div>
      <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-8 shadow-soft max-w-2xl">
        <h1 className="text-xl font-bold text-[var(--foreground)]">Upgrade plan</h1>
        <p className="mt-2 text-sm text-[var(--foreground)] opacity-70">
          To charge clinics by membership, connect a payment provider (e.g. Stripe). You can:
        </p>
        <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-[var(--foreground)] opacity-90">
          <li>Create API routes (e.g. <code className="rounded bg-[var(--muted-bg)] px-1">/api/create-checkout-session</code>) that create a Stripe Checkout session for the current clinic.</li>
          <li>Store <code className="rounded bg-[var(--muted-bg)] px-1">stripeCustomerId</code> and <code className="rounded bg-[var(--muted-bg)] px-1">stripeSubscriptionId</code> on the clinic document in Firestore when the subscription is created.</li>
          <li>Use Stripe webhooks to update <code className="rounded bg-[var(--muted-bg)] px-1">membershipStatus</code> and <code className="rounded bg-[var(--muted-bg)] px-1">currentPeriodEnd</code> when payments succeed or fail.</li>
        </ul>
        <p className="mt-6 text-sm text-[var(--foreground)] opacity-70">
          Membership data is stored on each clinic doc: <code className="rounded bg-[var(--muted-bg)] px-1">membershipPlan</code>, <code className="rounded bg-[var(--muted-bg)] px-1">membershipStatus</code>, <code className="rounded bg-[var(--muted-bg)] px-1">trialEndsAt</code>. New clinics get a 14-day trial by default.
        </p>
      </div>
    </div>
  );
}

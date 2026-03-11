"use client";

import Link from "next/link";

export default function ManageBillingPage() {
  return (
    <div className="py-4 sm:p-8">
      <div className="mb-6">
        <Link href="/dashboard/settings" className="text-sm font-medium text-blue-600 hover:text-blue-700">
          ← Back to Settings
        </Link>
      </div>
      <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-8 shadow-soft max-w-2xl">
        <h1 className="text-xl font-bold text-[var(--foreground)]">Manage billing</h1>
        <p className="mt-2 text-sm text-[var(--foreground)] opacity-70">
          Once Stripe is connected, this page can redirect to the Stripe Customer Portal so the clinic can update payment method, view invoices, or cancel the subscription. Create an API route that returns a portal session URL using the clinic&apos;s <code className="rounded bg-[var(--muted-bg)] px-1">stripeCustomerId</code>.
        </p>
      </div>
    </div>
  );
}

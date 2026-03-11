# Clinic membership (subscription) model

Clinics are charged by membership. Each clinic has a subscription state stored in Firestore and shown in the app.

## How it works

- **Per clinic**: Membership is stored on the clinic document `clinics/{clinicId}`:
  - `membershipPlan`: `"free"` | `"trial"` | `"basic"` | `"pro"` | `"enterprise"`
  - `membershipStatus`: `"trialing"` | `"active"` | `"past_due"` | `"canceled"` | `"expired"` | `"incomplete"`
  - `trialEndsAt`: ISO date string (when trial ends)
  - `stripeCustomerId`, `stripeSubscriptionId`, `currentPeriodEnd`: for Stripe integration

- **New clinics**: Get a **14-day trial** by default (`membershipPlan: "trial"`, `membershipStatus: "trialing"`, `trialEndsAt` set).

- **Existing clinics**: If the clinic doc has no membership fields, the app treats them as having access (no paywall). You can backfill later.

- **Paywall**: When `membershipStatus` is expired/canceled/past_due (and no longer in trial or grace period), the dashboard shows a “Membership required” message and a link to Settings → Membership.

## Settings → Membership

- **Settings** page has a **Membership** section: current plan, status, trial end date, and buttons:
  - **Upgrade plan** → `/dashboard/settings/upgrade` (placeholder; connect Stripe here)
  - **Manage billing** → `/dashboard/settings/billing` (placeholder; Stripe Customer Portal)

## Connecting Stripe (or another provider)

1. **Create Checkout (upgrade)**  
   Add an API route (e.g. `app/api/create-checkout-session/route.ts`) that:
   - Reads the current clinic’s `stripeCustomerId` from Firestore (or creates a Stripe Customer and saves the id).
   - Creates a [Stripe Checkout Session](https://stripe.com/docs/api/checkout/sessions/create) for a subscription.
   - Returns the session URL and redirect the user to it from the Upgrade page.

2. **Webhooks**  
   Add a webhook route (e.g. `app/api/webhooks/stripe/route.ts`) that:
   - On `customer.subscription.created` / `updated`: update the clinic doc with `stripeSubscriptionId`, `membershipStatus`, `currentPeriodEnd`, and optionally `membershipPlan` (from metadata).
   - On `customer.subscription.deleted` or `past_due`: set `membershipStatus` to `"expired"` or `"past_due"`.

3. **Customer Portal (manage billing)**  
   Add an API route that creates a [Stripe Billing Portal session](https://stripe.com/docs/api/customer_portal/sessions/create) using the clinic’s `stripeCustomerId` and redirect the user to the returned URL from the Manage billing page.

4. **Environment**  
   Use `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` (and optionally price IDs) in `.env.local` or your host’s env. Do not expose the secret key to the client.

After this, clinics can upgrade from Settings, and you can charge them by membership as intended.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Firebase Setup

This app uses **Firebase Authentication** (email/password) for login and **Cloud Firestore** for all clinic data (patients, doctors, appointments, staff).

### 1. Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a project (or use an existing one).
2. Enable **Authentication** → Sign-in method → **Email/Password**.
3. Create at least one user (e.g. `admin@yourdomain.com` / your password) under Authentication → Users.
4. Enable **Firestore Database** → Create database (start in test mode if you prefer; then deploy the rules below).

### 2. Environment variables

Copy `env.example` to `.env.local` and fill in your Firebase config from **Project settings** → **General** → **Your apps** (add a web app if needed):

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 3. Firestore rules

Deploy the rules in `firestore.rules` so each user can only read/write their own data (documents are scoped by `userId`). In Firebase Console → Firestore → Rules, paste the contents of `firestore.rules`, or use the Firebase CLI:

```bash
firebase deploy --only firestore:rules
```

(Configure the Firebase CLI with `firebase use` if you have multiple projects.)

### 4. Run the app

After setting `.env.local`, run the dev server and sign in with the email/password you created in step 1.

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

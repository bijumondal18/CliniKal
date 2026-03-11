# Deploy Clinikal Dashboard (Make it Live)

Follow these steps to deploy your dashboard to the web.

---

## 1. Push your code to GitHub

If you haven’t already:

```bash
git add .
git commit -m "Ready for deploy"
git remote add origin https://github.com/YOUR_USERNAME/patient-dashboard.git   # if needed
git push -u origin main
```

(Use your repo URL and branch name if different.)

---

## 2. Deploy on Vercel (recommended)

1. Go to [vercel.com](https://vercel.com) and sign in (GitHub is easiest).
2. Click **Add New…** → **Project**.
3. Import your **patient-dashboard** repository.
4. **Configure project**
   - **Framework Preset:** **Next.js** (should auto-detect; if not, choose it manually).
   - **Root Directory:** Leave **empty** or set to **`.`** so Vercel uses the repo root (where `package.json` and `next` live).  
     ⚠️ If you see *"No Next.js version detected"*, go to **Settings → General → Root Directory** and clear it, or set it to **`.`**.
   - Build Command: `npm run build` (default).
   - Output Directory: leave default.
5. **Environment variables**  
   Add each variable from your `.env.local` (or `env.example`). In Vercel: **Settings → Environment Variables** (or add during import):

   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

   Set them for **Production** (and optionally Preview if you use branches).

6. **Production branch:** Under **Settings → Git**, set **Production Branch** to **main** (or whichever branch you use for production).

7. Click **Deploy**.  
   Vercel will build and give you a URL like `https://patient-dashboard-xxx.vercel.app`.

---

## 3. Allow your live URL in Firebase

So Firebase Auth and Firestore work on the deployed site:

1. Open [Firebase Console](https://console.firebase.google.com/) → your project.
2. **Authentication** → **Settings** (or **Sign-in method** tab) → **Authorized domains**.
3. Click **Add domain** and add your Vercel URL, e.g. `patient-dashboard-xxx.vercel.app` (and your custom domain later if you add one).

---

## 4. (Optional) Custom domain on Vercel

1. In Vercel: Project → **Settings** → **Domains**.
2. Add your domain and follow the DNS instructions.
3. Add the same domain under Firebase **Authorized domains** (e.g. `app.yourdomain.com`).

---

## 5. Run production build locally (optional)

To confirm the app builds before deploying:

```bash
cp env.example .env.local
# Edit .env.local with your Firebase values, then:
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000). After login, the app will use your live Firestore and Auth.

---

## Summary

| Step | Action |
|------|--------|
| 1 | Push code to GitHub |
| 2 | Import repo on Vercel, add env vars, deploy |
| 3 | Add Vercel (and custom) domain in Firebase Authorized domains |
| 4 | (Optional) Add custom domain in Vercel + Firebase |

After step 3, your dashboard is live and usable at the Vercel URL.

### "No Next.js version detected"

- **Root Directory:** In Vercel go to **Project → Settings → General**. Under **Root Directory**, leave it **empty** or set to **`.`**. If it’s set to a subfolder but your repo root *is* the app, clear it.
- **Repo layout:** If your Git repo is a parent folder and the Next app is in a subfolder (e.g. `my-repo/patient-dashboard/`), set **Root Directory** to that subfolder, e.g. `patient-dashboard`.
- **Commit package.json:** Ensure `package.json` (with `"next"` in `dependencies`) is committed and pushed.
- This repo includes a `vercel.json` with `"framework": "nextjs"` to help Vercel detect Next.js.

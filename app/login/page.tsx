"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const inputClass =
  "w-full rounded-xl border border-[var(--card-border)] bg-[var(--muted-bg)] px-4 py-3 text-[var(--foreground)] placeholder:opacity-60 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";
const labelClass = "mb-1.5 block text-sm font-medium text-[var(--foreground)]";

export default function LoginPage() {
  const router = useRouter();
  const { isLoggedIn, login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoggedIn) router.replace("/dashboard");
  }, [isLoggedIn, router]);

  if (isLoggedIn) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (login(username, password)) {
      router.replace("/dashboard");
    } else {
      setError("Invalid username or password.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4">
      <div className="flex w-full max-w-4xl overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-soft">
        {/* Left panel - branding with gradient */}
        <div className="hidden w-[42%] flex-col justify-between bg-gradient-to-b from-blue-50 via-[var(--primary-muted)] to-blue-100 p-8 dark:from-blue-950/40 dark:via-blue-900/30 dark:to-blue-950/50 sm:flex">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-xl font-semibold tracking-tight text-[var(--foreground)]">Clinic</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-[var(--foreground)] opacity-70">You can easily</p>
            <p className="mt-1 text-lg font-semibold leading-snug text-[var(--foreground)]">
              Get access to your clinic dashboard — patients, appointments, and more in one place.
            </p>
          </div>
        </div>

        {/* Right panel - form */}
        <div className="flex flex-1 flex-col justify-center p-8 sm:p-10">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-2 flex items-start gap-1.5">
              <span className="mt-1.5 text-sm text-blue-600 dark:text-blue-400" aria-hidden>*</span>
              <h1 className="text-2xl font-bold text-[var(--foreground)]">Sign in</h1>
            </div>
            <p className="mb-8 text-sm text-[var(--foreground)] opacity-70">
              Access your dashboard to manage patients, appointments, doctors, and clinic settings.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
                  {error}
                </p>
              )}
              <div>
                <label className={labelClass}>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={inputClass}
                  placeholder="Enter your username"
                  autoComplete="username"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputClass} pr-11`}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1.5 text-[var(--foreground)] opacity-60 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    title={showPassword ? "Hide password" : "Show password"}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 py-3 text-sm font-medium text-white shadow-soft hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Sign in
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-[var(--foreground)] opacity-70">
              Need access? Contact your administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

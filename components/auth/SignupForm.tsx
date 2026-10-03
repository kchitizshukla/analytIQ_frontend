"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/Toast";
import { errorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function passwordScore(pw: string): { score: number; label: string; tone: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ["Too weak", "Weak", "Fair", "Good", "Strong"];
  const tones = ["bg-red-400", "bg-red-400", "bg-amber-400", "bg-emerald-400", "bg-emerald-500"];
  return { score, label: labels[score], tone: tones[score] };
}

export function SignupForm({ onSwitch }: { onSwitch: () => void }) {
  const { signup } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  const strength = useMemo(() => passwordScore(password), [password]);
  const emailValid = EMAIL_RE.test(email.trim());
  const nameValid = name.trim().length > 0;
  const passwordValid = password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password);
  const matches = password === confirm && confirm.length > 0;

  function validate(): string | null {
    if (!nameValid) return "Please enter your full name.";
    if (!emailValid) return "Please enter a valid email address.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (!passwordValid) return "Password must include upper and lower case letters and a number.";
    if (!matches) return "Passwords do not match.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    const problem = validate();
    if (problem) {
      toast.error(problem);
      return;
    }
    setSubmitting(true);
    try {
      const user = await signup(name.trim(), email.trim(), password);
      toast.success(`Welcome to AnalytIQ, ${user.name.split(" ")[0]}!`);
      router.replace("/dashboard");
    } catch (err) {
      toast.error("Unable to create account.", {
        description: errorMessage(err, "Please try again."),
      });
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-ink-900">Create your account</h1>
      <p className="mt-2 text-sm text-ink-500">Start turning your data into insights.</p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
        <div>
          <label htmlFor="signup-name" className="label">Full Name</label>
          <input
            id="signup-name"
            type="text"
            autoComplete="name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={touched && !nameValid}
            className="input mt-1.5"
            placeholder="Jane Doe"
          />
        </div>

        <div>
          <label htmlFor="signup-email" className="label">Email</label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={touched && !emailValid}
            className="input mt-1.5"
            placeholder="you@company.com"
          />
          {touched && email.length > 0 && !emailValid && (
            <p className="mt-1 text-xs text-red-600">Enter a valid email address.</p>
          )}
        </div>

        <div>
          <label htmlFor="signup-password" className="label">Password</label>
          <div className="relative mt-1.5">
            <input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pr-11"
              placeholder="At least 8 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 grid w-11 place-items-center text-ink-400 transition hover:text-ink-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {password.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex h-1.5 flex-1 gap-1" aria-hidden="true">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-full flex-1 rounded-full transition-colors",
                      i < strength.score ? strength.tone : "bg-ink-100",
                    )}
                  />
                ))}
              </div>
              <span className="w-16 text-right text-[11px] font-medium text-ink-500">{strength.label}</span>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="signup-confirm" className="label">Confirm Password</label>
          <div className="relative mt-1.5">
            <input
              id="signup-confirm"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              aria-invalid={touched && confirm.length > 0 && !matches}
              className="input pr-11"
              placeholder="Re-enter your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute inset-y-0 right-0 grid w-11 place-items-center text-ink-400 transition hover:text-ink-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {confirm.length > 0 && !matches && (
            <p className="mt-1 text-xs text-red-600">Passwords do not match.</p>
          )}
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          {submitting ? "Creating account…" : "Create Account"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-ink-500">
        Already have an account?{" "}
        <button onClick={onSwitch} className="font-semibold text-brand-600 transition hover:text-brand-700">
          Sign in
        </button>
      </p>
    </div>
  );
}

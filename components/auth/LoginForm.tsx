"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/Toast";
import { errorMessage } from "@/lib/api";
import { DemoCredentials } from "./DemoCredentials";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const { login } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  const emailValid = EMAIL_RE.test(email.trim());
  const passwordValid = password.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!emailValid) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!passwordValid) {
      toast.error("Please enter your password.");
      return;
    }
    setSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}.`);
      router.replace("/dashboard");
    } catch (err) {
      toast.error("Unable to sign in.", {
        description: errorMessage(err, "Please check your email and password."),
      });
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-ink-900">Welcome back</h1>
      <p className="mt-2 text-sm text-ink-500">Sign in to continue analyzing your data.</p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
        <div>
          <label htmlFor="login-email" className="label">Email</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(true)}
            aria-invalid={touched && !emailValid}
            className="input mt-1.5"
            placeholder="you@company.com"
          />
          {touched && email.length > 0 && !emailValid && (
            <p className="mt-1 text-xs text-red-600">Enter a valid email address.</p>
          )}
        </div>

        <div>
          <label htmlFor="login-password" className="label">Password</label>
          <div className="relative mt-1.5">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pr-11"
              placeholder="Enter your password"
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
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
          {submitting ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <div className="mt-4 flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={() => toast.info("Password reset isn't available in this demo yet.")}
          className="text-ink-500 transition hover:text-ink-800"
        >
          Forgot password?
        </button>
      </div>

      <DemoCredentials
        onUse={(demoEmail, demoPassword) => {
          setEmail(demoEmail);
          setPassword(demoPassword);
          setTouched(false);
          toast.info("Demo credentials filled in.", { description: "Click Sign In to continue." });
        }}
      />

      <p className="mt-8 text-center text-sm text-ink-500">
        Don&apos;t have an account?{" "}
        <button onClick={onSwitch} className="font-semibold text-brand-600 transition hover:text-brand-700">
          Create account
        </button>
      </p>
    </div>
  );
}

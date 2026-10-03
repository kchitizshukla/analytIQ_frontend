"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "@/components/ui/Logo";
import { APP_NAME, APP_TAGLINE } from "@/lib/branding";
import { useAuth } from "@/lib/auth";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";
import { AuthAnalyticsVisual } from "./AuthAnalyticsVisual";

export type AuthMode = "login" | "signup";

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const { user, loading } = useAuth();
  const router = useRouter();

  // If already authenticated (e.g. landed here via client nav), move on.
  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      {/* ---------- Left: authentication (≈45%) ---------- */}
      <section className="flex w-full flex-col justify-center px-6 py-10 sm:px-10 lg:w-[45%] lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <Logo className="mb-10" markClassName="h-9 w-9" />

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {mode === "login" ? (
                <LoginForm onSwitch={() => setMode("signup")} />
              ) : (
                <SignupForm onSwitch={() => setMode("login")} />
              )}
            </motion.div>
          </AnimatePresence>

          <p className="mt-10 text-center text-xs text-ink-400">
            © {new Date().getFullYear()} {APP_NAME}. {APP_TAGLINE}
          </p>
        </div>
      </section>

      {/* ---------- Right: analytics story (≈55%) ---------- */}
      <section className="relative hidden overflow-hidden bg-[#0b0912] lg:flex lg:w-[55%]">
        <AuthAnalyticsVisual />
      </section>

      {/* ---------- Mobile: compact visual below the form ---------- */}
      <section className="relative overflow-hidden bg-[#0b0912] lg:hidden">
        <AuthAnalyticsVisual compact />
      </section>
    </main>
  );
}

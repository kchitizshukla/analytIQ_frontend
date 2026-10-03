"use client";

import { Palette, ShieldCheck, UserRound } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { ChangePasswordForm } from "@/components/settings/ChangePasswordForm";
import { ThemeSelector } from "@/components/settings/ThemeSelector";
import { useAuth } from "@/lib/auth";

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
          <Icon className="h-4.5 w-4.5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-ink-900">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-ink-500">{description}</p>}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const initials = user?.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase() || "U";

  return (
    <AppShell>
      <PageHeader title="Settings" description="Manage your account, security, and appearance." />

      <div className="grid max-w-3xl gap-6">
        {/* Account */}
        <Section icon={UserRound} title="Account" description="Your profile information.">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-600 text-base font-semibold text-white">
              {initials}
            </span>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-ink-900">{user?.name ?? "—"}</div>
              <div className="truncate text-sm text-ink-500">{user?.email ?? "—"}</div>
            </div>
          </div>
        </Section>

        {/* Security */}
        <Section icon={ShieldCheck} title="Security" description="Change your account password.">
          <ChangePasswordForm />
        </Section>

        {/* Appearance */}
        <Section icon={Palette} title="Appearance" description="Choose how AnalytIQ looks. Changes apply instantly and are remembered on this device.">
          <ThemeSelector />
        </Section>
      </div>
    </AppShell>
  );
}

"use client";

import { useState } from "react";
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { changePassword, errorMessage } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

type FieldKey = "current" | "next" | "confirm";

// Mirrors the backend policy (see schemas/auth.validate_password).
function passwordIssue(pw: string): string | null {
  if (pw.length < 8) return "Password must be at least 8 characters.";
  if (!/[a-z]/.test(pw) || !/[A-Z]/.test(pw) || !/\d/.test(pw)) {
    return "Password must include upper and lower case letters and a number.";
  }
  return null;
}

export function ChangePasswordForm() {
  const toast = useToast();
  const [values, setValues] = useState({ current: "", next: "", confirm: "" });
  const [show, setShow] = useState<Record<FieldKey, boolean>>({ current: false, next: false, confirm: false });
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  const set = (k: FieldKey, v: string) => setValues((s) => ({ ...s, [k]: v }));
  const toggle = (k: FieldKey) => setShow((s) => ({ ...s, [k]: !s[k] }));

  const matches = values.next.length > 0 && values.next === values.confirm;
  const policyIssue = values.next.length > 0 ? passwordIssue(values.next) : null;

  function validate(): string | null {
    if (!values.current) return "Please enter your current password.";
    if (!values.next) return "Please enter a new password.";
    const issue = passwordIssue(values.next);
    if (issue) return issue;
    if (values.next === values.current) return "New password must be different from your current password.";
    if (values.next !== values.confirm) return "New passwords do not match.";
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
      await changePassword(values.current, values.next);
      toast.success("Password changed successfully.");
      setValues({ current: "", next: "", confirm: "" });
      setTouched(false);
    } catch (err) {
      toast.error("Unable to change password.", { description: errorMessage(err, "Please try again.") });
    } finally {
      setSubmitting(false);
    }
  }

  const fields: { key: FieldKey; label: string; autoComplete: string; placeholder: string }[] = [
    { key: "current", label: "Current Password", autoComplete: "current-password", placeholder: "Enter current password" },
    { key: "next", label: "New Password", autoComplete: "new-password", placeholder: "At least 8 characters" },
    { key: "confirm", label: "Confirm New Password", autoComplete: "new-password", placeholder: "Re-enter new password" },
  ];

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4" noValidate>
      {fields.map(({ key, label, autoComplete, placeholder }) => (
        <div key={key}>
          <label htmlFor={`pw-${key}`} className="label">{label}</label>
          <div className="relative mt-1.5">
            <input
              id={`pw-${key}`}
              type={show[key] ? "text" : "password"}
              autoComplete={autoComplete}
              value={values[key]}
              onChange={(e) => set(key, e.target.value)}
              className="input pr-11"
              placeholder={placeholder}
              aria-invalid={
                touched &&
                ((key === "next" && !!policyIssue) || (key === "confirm" && values.confirm.length > 0 && !matches))
              }
            />
            <button
              type="button"
              onClick={() => toggle(key)}
              className="absolute inset-y-0 right-0 grid w-11 place-items-center text-ink-400 transition hover:text-ink-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              aria-label={show[key] ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
            >
              {show[key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {key === "next" && policyIssue && (
            <p className="mt-1 text-xs text-ink-400">{policyIssue}</p>
          )}
          {key === "confirm" && values.confirm.length > 0 && !matches && (
            <p className="mt-1 text-xs text-red-600">New passwords do not match.</p>
          )}
        </div>
      ))}

      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
        {submitting ? "Changing…" : "Change Password"}
      </button>
    </form>
  );
}

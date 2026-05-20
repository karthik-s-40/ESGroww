"use client";

import { useState } from "react";

import Link from "next/link";

import { useRouter } from "next/navigation";

import { ActionButton } from "@/components/layout/action-button";
import { PageWrapper } from "@/components/layout/page-wrapper";

import { SECTOR_OPTIONS } from "@/lib/validation";

import { COUNTRY_OPTIONS } from "@/lib/countries";

import { INDIA_STATE_OPTIONS } from "@/lib/india-states";

import {
  validateEmail,
} from "@/lib/validation";

import {
  validatePasswordStrength,
} from "@/lib/password";

import {
  BarChart3,
  Leaf,
  Sparkles,
} from "lucide-react";

const DEFAULT_COUNTRY =
  COUNTRY_OPTIONS.find(
    (c) => c.code === "IN"
  )?.name ?? "India";

function checkPasswordRules(
  password: string
) {
  return validatePasswordStrength(
    password
  );
}

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",

    email: "",

    password: "",

    confirmPassword: "",

    organizationName: "",

    sectorCode: "",

    country: DEFAULT_COUNTRY,

    state: "",

    acceptTerms: false,
  });

  const [fieldErrors, setFieldErrors] =
    useState<Record<string, string>>(
      {}
    );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const isIndia =
    form.country === "India";

  function updateField(
    key: keyof typeof form,
    value: string | boolean
  ) {
    setForm((prev) => ({
      ...prev,

      [key]: value,

      ...(key === "country" &&
      value !== "India"
        ? {
            state: "",
          }
        : {}),
    }));

    setFieldErrors((prev) => {
      const next = {
        ...prev,
      };

      delete next[key as string];

      return next;
    });
  }

  function runClientValidation(): boolean {
    const next: Record<string, string> =
      {};

    if (
      form.fullName.trim().length < 2
    ) {
      next.fullName =
        "Enter at least 2 characters.";
    }

    if (!validateEmail(form.email)) {
      next.email =
        "Enter a valid email address.";
    }

    const pwCheck =
      checkPasswordRules(
        form.password
      );

    if (!pwCheck.valid) {
      next.password =
        "Min 8 characters, 1 uppercase, 1 number, 1 symbol.";
    }

    if (
      form.password !==
      form.confirmPassword
    ) {
      next.confirmPassword =
        "Passwords must match.";
    }

    if (
      form.organizationName.trim()
        .length < 2
    ) {
      next.organizationName =
        "Enter at least 2 characters.";
    }

    if (!form.sectorCode) {
      next.sectorCode =
        "Select your industry / sector.";
    }

    if (!form.country?.trim()) {
      next.country =
        "Select a country.";
    }

    if (!form.state?.trim()) {
      next.state = isIndia
        ? "Select a state or union territory."
        : "Enter your state or region.";
    }

    if (!form.acceptTerms) {
      next.acceptTerms =
        "You must accept the terms to continue.";
    }

    setFieldErrors(next);

    return (
      Object.keys(next).length === 0
    );
  }

  async function handleRegister() {
    setError("");

    setSuccess("");

    if (!runClientValidation()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/register",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            ...form,

            fullName:
              form.fullName.trim(),

            email: form.email.trim(),

            organizationName:
              form.organizationName.trim(),

            country: form.country.trim(),

            state: form.state.trim(),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Registration failed"
        );

        setLoading(false);

        return;
      }

      setSuccess(data.message);

      setTimeout(() => {
        router.push("/login");
      }, 2800);
    } catch {
      setError(
        "Something went wrong."
      );
    }

    setLoading(false);
  }

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col bg-background">
      <PageWrapper maxWidth="wide" className="grid min-h-0 flex-1 grid-cols-1 items-start gap-6 py-6 sm:gap-8 sm:py-8 lg:grid-cols-2 lg:gap-10">
        <aside className="hidden flex-col justify-center space-y-5 rounded-2xl border border-border bg-card p-7 text-muted-foreground shadow-sm ring-1 ring-foreground/[0.04] lg:flex">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3">
              <Leaf className="h-9 w-9 text-primary" />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
                ESGroww
              </p>

              <h1 className="text-3xl font-semibold leading-tight tracking-tight text-foreground">
                Create your organization profile
              </h1>
            </div>
          </div>

          <p className="text-lg leading-relaxed text-muted-foreground">
            Registration locks in your{" "}
            <strong className="text-foreground">industry / sector</strong> so benchmarks, applicable
            certifications, and governance questions match how your facility
            actually operates — from hospitals and campuses to manufacturing and
            general enterprises.
          </p>

          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

              <span>
                After sign-up, you will receive a verification email (24-hour
                link). Until you verify, your organization stays in{" "}
                <em>Pending Verification</em> status.
              </span>
            </li>

            <li className="flex gap-3">
              <BarChart3 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

              <span>
                One account ties your team to a single organization record — the
                foundation for every assessment and export you run in the
                platform.
              </span>
            </li>
          </ul>

          <p className="border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground">
            SAM Assessment Application provides indicative sustainability and
            certification readiness intelligence. This platform does not replace
            official certification audits, regulatory reviews, accredited
            assessments, or legal compliance advice.
          </p>
        </aside>

        <div className="rounded-2xl border border-border bg-white p-6 shadow-md ring-1 ring-foreground/[0.04] sm:p-8 md:p-9">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <div className="rounded-xl border border-primary/20 bg-primary/10 p-2">
              <Leaf className="h-7 w-7 text-primary" />
            </div>

            <div>
              <h2 className="text-2xl font-bold" style={{ color: "#004958" }}>
                Create account
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Sustainability readiness intelligence
              </p>
            </div>
          </div>

          <div className="mb-6 hidden lg:block">
            <h2 className="text-2xl font-bold" style={{ color: "#004958" }}>
              Registration
            </h2>

            <p className="mt-2 leading-relaxed text-muted-foreground">
              All fields marked with the flow below are required before you can
              start assessments. Already registered?{" "}
              <button
                type="button"
                onClick={() =>
                  router.push("/login")
                }
                className="font-semibold text-primary hover:text-primary/80"
              >
                Log in
              </button>
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm text-foreground">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5" style={{ color: "#004958" }}>
            <InputField
              label="Full name"
              value={form.fullName}
              error={fieldErrors.fullName}
              onChange={(v) =>
                updateField(
                  "fullName",
                  v
                )
              }
            />

            <InputField
              label="Email address"
              type="email"
              autoComplete="email"
              value={form.email}
              error={fieldErrors.email}
              onChange={(v) =>
                updateField("email", v)
              }
            />

            <InputField
              label="Password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              error={fieldErrors.password}
              onChange={(v) =>
                updateField(
                  "password",
                  v
                )
              }
            />

            <InputField
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
              error={
                fieldErrors.confirmPassword
              }
              onChange={(v) =>
                updateField(
                  "confirmPassword",
                  v
                )
              }
            />

            <InputField
              label="Organization name"
              value={
                form.organizationName
              }
              error={
                fieldErrors.organizationName
              }
              onChange={(v) =>
                updateField(
                  "organizationName",
                  v
                )
              }
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Industry / sector
              </label>

              <select
                value={form.sectorCode}
                onChange={(e) =>
                  updateField(
                    "sectorCode",
                    e.target.value
                  )
                }
                className={`w-full rounded-xl border bg-background px-4 py-3 text-foreground ${
                  fieldErrors.sectorCode
                    ? "border-destructive ring-1 ring-destructive/20"
                    : "border-input focus:border-ring focus:ring-2 focus:ring-ring/30"
                }`}
              >
                <option value="">
                  Select sector
                </option>

                {SECTOR_OPTIONS.map(
                  (sector) => (
                    <option
                      key={sector.code}
                      value={sector.code}
                    >
                      {sector.label}
                    </option>
                  )
                )}
              </select>

              {fieldErrors.sectorCode && (
                <p className="mt-1 text-xs text-destructive">
                  {fieldErrors.sectorCode}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Country
              </label>

              <select
                value={form.country}
                onChange={(e) =>
                  updateField(
                    "country",
                    e.target.value
                  )
                }
                className={`w-full rounded-xl border bg-background px-4 py-3 text-foreground ${
                  fieldErrors.country
                    ? "border-destructive ring-1 ring-destructive/20"
                    : "border-input focus:border-ring focus:ring-2 focus:ring-ring/30"
                }`}
              >
                {COUNTRY_OPTIONS.map(
                  (c) => (
                    <option
                      key={c.code}
                      value={c.name}
                    >
                      {c.name}
                    </option>
                  )
                )}
              </select>

              {fieldErrors.country && (
                <p className="mt-1 text-xs text-destructive">
                  {fieldErrors.country}
                </p>
              )}
            </div>

            {isIndia ? (
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  State / union territory
                </label>

                <select
                  value={form.state}
                  onChange={(e) =>
                    updateField(
                      "state",
                      e.target.value
                    )
                  }
                  className={`w-full rounded-xl border bg-background px-4 py-3 text-foreground ${
                    fieldErrors.state
                      ? "border-destructive ring-1 ring-destructive/20"
                      : "border-input focus:border-ring focus:ring-2 focus:ring-ring/30"
                  }`}
                >
                  <option value="">
                    Select state
                  </option>

                  {INDIA_STATE_OPTIONS.map(
                    (s) => (
                      <option
                        key={s}
                        value={s}
                      >
                        {s}
                      </option>
                    )
                  )}
                </select>

                {fieldErrors.state && (
                  <p className="mt-1 text-xs text-destructive">
                    {fieldErrors.state}
                  </p>
                )}
              </div>
            ) : (
              <InputField
                label="State / region"
                value={form.state}
                error={fieldErrors.state}
                onChange={(v) =>
                  updateField(
                    "state",
                    v
                  )
                }
              />
            )}
          </div>

          <div className="mt-5 rounded-xl border border-border bg-muted/50 p-4">
            <div className="flex items-start gap-3">
              <input
                id="terms"
                type="checkbox"
                checked={form.acceptTerms}
                onChange={(e) =>
                  updateField(
                    "acceptTerms",
                    e.target.checked
                  )
                }
                className="mt-1 rounded border-input text-primary focus:ring-ring"
              />

              <label
                htmlFor="terms"
                className="cursor-pointer text-sm leading-relaxed text-foreground"
              >
                I accept the{" "}
                <span className="font-medium text-primary">
                  Terms &amp; Privacy Policy
                </span>{" "}
                and understand that scores and recommendations on ESGroww are{" "}
                <strong>indicative only</strong> and do not replace certification
                audits or legal advice.
              </label>
            </div>

            {fieldErrors.acceptTerms && (
              <p className="mt-2 text-xs text-destructive pl-7">
                {fieldErrors.acceptTerms}
              </p>
            )}
          </div>

          <ActionButton
            type="button"
            onClick={handleRegister}
            disabled={loading}
            className="mt-6 h-12 w-full text-base shadow-sm"
          >
            {loading
              ? "Creating account…"
              : "Create account"}
          </ActionButton>

          <p className="mt-5 text-center text-sm text-muted-foreground lg:hidden">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:text-primary/80"
            >
              Log in
            </Link>
          </p>
        </div>
      </PageWrapper>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-foreground">{label}</label>

      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        className={`w-full rounded-xl border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground ${
          error
            ? "border-destructive ring-1 ring-destructive/20"
            : "border-input focus:border-ring focus:ring-2 focus:ring-ring/30"
        }`}
      />

      {error && (
        <p className="mt-1 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

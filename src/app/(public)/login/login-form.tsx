"use client";

import { useState } from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ActionButton } from "@/components/layout/action-button";
import { FormField } from "@/components/layout/form-field";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import {
  BarChart3,
  Leaf,
  ShieldCheck,
} from "lucide-react";

export default function LoginForm() {
  const router = useRouter();

  const searchParams =
    useSearchParams();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [rememberMe, setRememberMe] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    requiresVerification,
    setRequiresVerification,
  ] = useState(false);

  const [resendBusy, setResendBusy] =
    useState(false);

  const [resendNote, setResendNote] =
    useState("");

  let infoBanner = "";

  let urlError = "";

  if (
    searchParams.get("reset") ===
    "success"
  ) {
    infoBanner =
      "Your password has been reset. Please log in with your new password.";
  } else if (
    searchParams.get("verified") ===
    "true"
  ) {
    infoBanner =
      "Your account has been verified. Please log in to continue.";
  } else {
    const err =
      searchParams.get("error");

    if (err === "expired-token") {
      urlError =
        "That verification link has expired. Sign in with your email and use \"Resend verification email\", or register again.";
    } else if (err === "invalid-token") {
      urlError =
        "That verification or reset link is invalid. Please try again from your email or request a new link.";
    }
  }

  const combinedError =
    error || urlError;

  const handleLogin = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");

    setResendNote("");

    setRequiresVerification(false);

    setLoading(true);

    try {
      const response = await fetch(
        "/api/login",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email,

            password,

            rememberMe,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Login failed"
        );

        setRequiresVerification(
          Boolean(
            data.requiresVerification
          )
        );

        setLoading(false);

        return;
      }

      router.push("/upload");
    } catch {
      setError(
        "Something went wrong. Please try again."
      );
    }

    setLoading(false);
  };

  async function handleResendVerification() {
    if (!email.trim()) {
      setResendNote(
        "Enter your email address above first."
      );

      return;
    }

    setResendBusy(true);

    setResendNote("");

    try {
      const res = await fetch(
        "/api/resend-verification",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        setResendNote(
          data.error ||
            "Could not send email."
        );
      } else {
        setResendNote(
          data.message ||
            "Done."
        );
      }
    } catch {
      setResendNote(
        "Could not send email. Try again later."
      );
    }

    setResendBusy(false);
  }

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col bg-background">
      <PageWrapper maxWidth="wide" className="grid min-h-0 flex-1 grid-cols-1 content-center items-stretch gap-6 py-6 sm:gap-8 sm:py-8 lg:grid-cols-2 lg:gap-10 lg:py-10">
        <section className="order-2 hidden flex-col justify-center rounded-2xl border border-border bg-card p-7 text-muted-foreground shadow-sm ring-1 ring-foreground/[0.04] lg:order-1 lg:flex">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3">
              <Leaf className="h-9 w-9 text-primary" />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
                ESGroww
              </p>

              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Sustainability readiness intelligence
              </h1>
            </div>
          </div>

          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Sign in to upload operational data, run validation and annualization,
            and view certification-style readiness across your sector frameworks.
          </p>

          <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

              <span>
                Secure sessions: 60 minutes by default, or 30 days with Remember
                me — aligned with enterprise assessment workflows.
              </span>
            </li>

            <li className="flex gap-3">
              <BarChart3 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

              <span>
                Benchmarks, emissions, and framework applicability follow the
                industry profile you set at registration.
              </span>
            </li>
          </ul>
        </section>

        <div className="order-1 flex w-full min-w-0 items-center justify-center lg:order-2">
          <Card className="w-full max-w-lg border-border bg-white shadow-md ring-1 ring-foreground/[0.04] lg:max-w-none">
            <CardHeader className="space-y-3 pb-2">
              <div className="mb-1 flex justify-center lg:hidden">
                <div className="rounded-full border border-primary/20 bg-primary/10 p-3">
                  <Leaf className="h-8 w-8 text-primary" />
                </div>
              </div>

              <CardTitle className="text-center text-2xl font-bold" style={{ color: "#004958" }}>
                Welcome back
              </CardTitle>

              <CardDescription className="text-center leading-relaxed text-muted-foreground">
                Log in to ESGroww — your SAM Assessment–style sustainability
                readiness workspace.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form
                onSubmit={handleLogin}
                className="space-y-4"
                style={{ color: "#004958" }}
              >
                {infoBanner && (
                  <div className="rounded-lg border border-primary/25 bg-primary/10 px-3 py-2 text-sm text-foreground">
                    {infoBanner}
                  </div>
                )}

                {combinedError && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {combinedError}
                  </div>
                )}

                <FormField id="email" label="Email address">
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@organization.com"
                    required
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    className="border-input focus-visible:border-ring focus-visible:ring-ring"
                  />
                </FormField>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="password">
                      Password
                    </Label>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          "/forgot-password"
                        )
                      }
                      className="text-sm font-medium text-primary hover:text-primary/80"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }
                    className="border-input focus-visible:border-ring focus-visible:ring-ring"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) =>
                      setRememberMe(
                        e.target.checked
                      )
                    }
                    className="rounded border-input text-primary focus:ring-ring"
                  />

                  <label
                    htmlFor="remember"
                    className="cursor-pointer text-sm text-muted-foreground"
                  >
                    Remember me (extends session to 30 days)
                  </label>
                </div>

                {requiresVerification && (
                  <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-950">
                    <p>
                      Your email is not verified yet. Check your inbox for the
                      link, or send a new one.
                    </p>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-amber-300 text-amber-950 hover:bg-amber-100"
                      disabled={resendBusy}
                      onClick={
                        handleResendVerification
                      }
                    >
                      {resendBusy
                        ? "Sending…"
                        : "Resend verification email"}
                    </Button>

                    {resendNote && (
                      <p className="text-xs text-amber-900/90">
                        {resendNote}
                      </p>
                    )}
                  </div>
                )}

                <ActionButton
                  type="submit"
                  disabled={loading}
                  className="h-11 w-full text-base sm:h-12"
                >
                  {loading
                    ? "Signing in…"
                    : "Log in"}
                </ActionButton>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col gap-2 border-t border-border/80 bg-muted/30 p-4">
              <p className="px-2 text-center text-xs leading-relaxed text-muted-foreground">
                SAM Assessment Application provides indicative sustainability and
                certification readiness intelligence only — not a substitute
                for audits or legal advice.
              </p>

              <p className="text-center text-sm text-muted-foreground">
                New user?{" "}
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/register"
                    )
                  }
                  className="font-semibold text-primary transition hover:text-primary/80"
                >
                  Create an account
                </button>
              </p>
            </CardFooter>
          </Card>
        </div>
      </PageWrapper>
    </div>
  );
}

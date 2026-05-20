"use client";

import { useState } from "react";

import Link from "next/link";

import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ActionButton } from "@/components/layout/action-button";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { ArrowLeft, Leaf } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError("");

    setMessage("");

    setLoading(true);

    try {
      const res = await fetch(
        "/api/forgot-password",
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
        setError(
          data.error ||
            "Request failed."
        );

        setLoading(false);

        return;
      }

      setMessage(
        data.message ||
          "Check your email for next steps."
      );
    } catch {
      setError(
        "Something went wrong."
      );
    }

    setLoading(false);
  }

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md border-border bg-card shadow-md ring-1 ring-foreground/[0.04]">
        <CardHeader className="space-y-2">
          <div className="mb-2 flex justify-center">
            <div className="rounded-full border border-primary/20 bg-primary/10 p-3">
              <Leaf className="h-8 w-8 text-primary" />
            </div>
          </div>

          <CardTitle className="text-center text-2xl font-bold text-foreground">
            Reset password
          </CardTitle>

          <CardDescription className="text-center leading-relaxed text-muted-foreground">
            Enter your registered email address. If an account exists, we will send
            a secure link valid for one hour.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-lg border border-primary/25 bg-primary/10 px-3 py-2 text-sm text-foreground">
                {message}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">
                Email address
              </Label>

              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@organization.com"
                className="border-input focus-visible:border-ring focus-visible:ring-ring"
              />
            </div>

            <ActionButton
              type="submit"
              disabled={loading}
              className="h-11 w-full"
            >
              {loading
                ? "Sending…"
                : "Send reset link"}
            </ActionButton>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 border-t border-border/80 bg-muted/30">
          <button
            type="button"
            onClick={() =>
              router.push("/login")
            }
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />

            Back to log in
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Need an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-primary hover:text-primary/80"
            >
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

"use client";

import {
  Suspense,
  useState,
} from "react";

import Link from "next/link";

import { useRouter, useSearchParams } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Leaf } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();

  const searchParams =
    useSearchParams();

  const token =
    searchParams.get("token") ||
    "";

  const [password, setPassword] =
    useState("");

  const [confirm, setConfirm] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [done, setDone] =
    useState(false);

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError("");

    if (!token) {
      setError(
        "Missing reset token. Open the link from your email again."
      );

      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "/api/reset-password",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            token,

            password,

            confirmPassword: confirm,
          }),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        setError(
          data.error ||
            "Reset failed."
        );

        setLoading(false);

        return;
      }

      setDone(true);

      setTimeout(() => {
        router.push(
          "/login?reset=success"
        );
      }, 2200);
    } catch {
      setError(
        "Something went wrong."
      );
    }

    setLoading(false);
  }

  return (
    <Card className="w-full max-w-md border-slate-200 bg-white shadow-md">
      <CardHeader>
        <div className="flex justify-center mb-2">
          <div className="p-3 bg-emerald-50 rounded-full border border-emerald-100">
            <Leaf className="w-8 h-8 text-emerald-600" />
          </div>
        </div>

        <CardTitle className="text-2xl text-center font-bold text-slate-900">
          Choose a new password
        </CardTitle>

        <CardDescription className="text-center text-slate-600">
          Use at least 8 characters with one uppercase letter, one number, and one
          symbol.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {done ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg px-3 py-3 text-sm text-center">
            Password updated. Redirecting you to log in…
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="pw">
                New password
              </Label>

              <Input
                id="pw"
                type="password"
                required
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                className="focus-visible:ring-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pw2">
                Confirm new password
              </Label>

              <Input
                id="pw2"
                type="password"
                required
                value={confirm}
                onChange={(e) =>
                  setConfirm(
                    e.target.value
                  )
                }
                className="focus-visible:ring-emerald-500"
              />
            </div>

            <Button
              type="submit"
              disabled={
                loading || !token
              }
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {loading
                ? "Saving…"
                : "Update password"}
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="justify-center border-t border-slate-100">
        <Link
          href="/login"
          className="text-sm text-emerald-700 font-medium hover:text-emerald-600"
        >
          Back to log in
        </Link>
      </CardFooter>
    </Card>
  );
}

function ResetFallback() {
  return (
    <div className="h-80 w-full max-w-md animate-pulse rounded-2xl border border-slate-200 bg-white" />
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex w-full min-w-0 flex-1 flex-col items-center justify-center bg-slate-50 px-4 py-10">
      <Suspense fallback={<ResetFallback />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}

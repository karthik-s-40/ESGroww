"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";

export function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "Admin" && password === "admin@123") {
      document.cookie = "admin_auth=true; path=/; max-age=86400"; // 1 day
      router.refresh();
    } else {
      setError(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm rounded-2xl border bg-white p-6 sm:p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <Lock className="h-6 w-6 text-slate-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Admin Portal</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to access the admin dashboard.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Username</label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>

          {error && <p className="text-xs font-medium text-red-600">Invalid username or password.</p>}

          <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800">
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}

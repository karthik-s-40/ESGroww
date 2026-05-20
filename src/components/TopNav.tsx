"use client";

import { usePathname, useRouter } from "next/navigation";

import BackButton from "@/components/BackButton";

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleHomeClick() {
    try {
      const res = await fetch("/api/me");
      if (!res.ok) return;
      const data = await res.json();
      if (data?.authenticated) {
        router.push("/upload");
      }
    } catch (e) {
      // ignore
    }
  }

  const hiddenPaths = ["/"];

  if (hiddenPaths.includes(pathname)) return null;

  return (
    <header className="shrink-0 border-b border-border bg-card">
      <div className="mx-auto flex w-full min-w-0 max-w-none items-center gap-3 px-3 py-2 sm:px-4 lg:px-6 xl:px-8 2xl:px-10">
        {/* Back navigation — unobtrusive ghost button, left of logo */}
        <BackButton />

        {/* Project logo */}
        <button type="button" onClick={handleHomeClick} aria-label="ESGroww home" className="p-0">
          <img src="/logo.svg" alt="ESGroww logo" className="h-8 w-8 rounded-sm object-contain" aria-hidden={false} />
        </button>

        <button type="button" onClick={handleHomeClick} aria-label="ESGroww home" className="text-lg font-bold tracking-tight text-primary sm:text-xl p-0">
          ESGroww
        </button>
      </div>
    </header>
  );
}
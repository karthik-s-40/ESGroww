"use client";

import { usePathname, useRouter } from "next/navigation";

import BackButton from "@/components/BackButton";
import { AssessmentSelector } from "@/components/dashboard/AssessmentSelector";

import { Menu } from "lucide-react";

export default function TopNav({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleHomeClick() {
    try {
      const res = await fetch("/api/me");
      if (!res.ok) return;
      const data = await res.json();
      if (data?.authenticated) {
        router.push("/esg-readiness-platform");
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
        
        {/* Mobile Hamburger Menu */}
        <button 
          className="lg:hidden p-1.5 -ml-1.5 mr-1 text-slate-500 hover:bg-slate-100 rounded-md transition-colors"
          onClick={onMenuClick}
        >
          <Menu size={20} />
        </button>

        {/* Back navigation — unobtrusive ghost button, left of logo */}
        <BackButton />

        {/* Project logo (hidden on desktop because sidebar has it) */}
        <button type="button" onClick={handleHomeClick} aria-label="ESGroww home" className="p-0 lg:hidden">
          <img src="/logo.svg" alt="ESGroww logo" className="h-8 w-8 rounded-sm object-contain" aria-hidden={false} />
        </button>

        <button type="button" onClick={handleHomeClick} aria-label="ESGroww home" className="text-lg font-bold tracking-tight text-primary sm:text-xl p-0 lg:hidden">
          ESGroww
        </button>

        <div className="ml-auto">
          <AssessmentSelector />
        </div>
      </div>
    </header>
  );
}
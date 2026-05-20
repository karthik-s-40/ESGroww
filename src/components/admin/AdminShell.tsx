"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ExternalLink, Radio } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import mark from "@/app/logo.png";
import Image from "next/image";

const TITLE: Record<string, string> = {
  "/admin": "Executive Overview",
  "/admin/uploads": "Upload Intelligence Center",
  "/admin/calculations": "Sustainability Intelligence Engine",
  "/admin/certifications": "Certification Readiness Control Center",
  "/admin/risk-analysis": "ESG Risk Intelligence Center",
  "/admin/hospitals": "Organization Intelligence Hub",
  "/admin/reports": "Assessment & Reporting",
  "/admin/system-config": "ESG Engine Configuration Center",
  "/admin/audit-logs": "Audit & Activity Trail",
};

function titleForPath(path: string | null): string {
  if (!path) return "Admin";
  if (TITLE[path]) return TITLE[path];
  const hit = Object.keys(TITLE)
    .filter((k) => k !== "/admin" && path.startsWith(k))
    .sort((a, b) => b.length - a.length)[0];
  return hit ? TITLE[hit] : "Admin";
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const heading = titleForPath(pathname);

  return (
    <div className="flex h-[100dvh] min-h-0 w-full bg-[#fbfbf3] text-[#15221a]">
      <AdminSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex h-[52px] shrink-0 items-center justify-between border-b border-[#d5ddd6]/90 bg-[#fbfbf3]/90 px-5 backdrop-blur-md">
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-[#3d5248]/80">
              ESGroww Intelligence
            </p>
            <h1 className="truncate text-sm font-semibold text-[#15221a]">{heading}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 rounded-full bg-[#00673F]/10 px-2.5 py-1 text-[11px] font-medium text-[#00673F] sm:inline-flex">
              <Radio className="h-3 w-3 animate-pulse" aria-hidden />
              Live
            </span>
            <Link
              href="/"
              className="inline-flex items-center gap-1 rounded-lg border border-[#d5ddd6] bg-white/70 px-2.5 py-1.5 text-[11px] font-medium text-[#004958] shadow-sm transition hover:border-[#00673F]/40 hover:text-[#00673F]"
            >
              Exit admin
              <ExternalLink className="h-3 w-3 opacity-70" aria-hidden />
            </Link>
          </div>
        </header>

        <div className="relative min-h-0 flex-1 overflow-y-auto">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="relative opacity-[0.035]"
            >
              <Image src={mark} alt="" width={420} height={420} className="max-w-[min(55vw,420px)]" priority={false} />
            </motion.div>
          </div>
          <motion.div
            className="relative z-10 mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-6"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

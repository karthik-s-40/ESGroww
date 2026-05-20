"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Award,
  BarChart3,
  Building2,
  ClipboardList,
  LayoutDashboard,
  ScrollText,
  Settings,
  ShieldAlert,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

const NAV: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/uploads", label: "Upload Intelligence", icon: Upload },
  { href: "/admin/calculations", label: "Calculations Engine", icon: BarChart3 },
  { href: "/admin/certifications", label: "Certifications", icon: Award },
  { href: "/admin/risk-analysis", label: "Risk Analysis", icon: ShieldAlert },
  { href: "/admin/hospitals", label: "Organizations", icon: Building2 },
  { href: "/admin/reports", label: "Reports", icon: ClipboardList },
  { href: "/admin/system-config", label: "System Config", icon: Settings },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-[260px] shrink-0 flex-col border-r border-[#d5ddd6]/80 bg-[#f6f7f1]/95 backdrop-blur-md">
      <div className="border-b border-[#d5ddd6]/80 px-4 py-4">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00673F] text-xs font-bold text-white shadow-sm">
            ESG
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-[#15221a]">ESGroww</p>
            <p className="truncate text-[10px] font-medium uppercase tracking-wider text-[#3d5248]/80">
              Admin Console
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-3">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="block rounded-lg">
              <motion.span
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                  active
                    ? "bg-[#00673F]/12 text-[#00673F] shadow-[inset_0_0_0_1px_rgba(0,103,63,0.18)]"
                    : "text-[#3d5248] hover:bg-white/60 hover:text-[#15221a]"
                )}
                whileHover={{ x: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
              >
                <Icon
                  className={cn("h-4 w-4 shrink-0", active ? "text-[#00673F]" : "text-[#3d5248]/70")}
                  aria-hidden
                />
                <span className="truncate">{item.label}</span>
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#00A86B] shadow-[0_0_8px_rgba(0,168,107,0.65)]" />
                )}
              </motion.span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#d5ddd6]/80 p-3">
        <div className="flex items-center gap-2 rounded-lg bg-white/50 px-2 py-2 ring-1 ring-[#00673F]/10">
          <Activity className="h-3.5 w-3.5 text-[#00673F]" aria-hidden />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#3d5248]">Operations</p>
            <p className="truncate text-[11px] text-[#15221a]">Live platform telemetry</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

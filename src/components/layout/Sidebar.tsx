"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Upload,
  BarChart2,
  PieChart,
  History,
  ShieldAlert,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href?: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  onClick?: () => void;
};

const MAIN_NAV: NavItem[] = [
  { href: "/esg-readiness-platform", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/summary", label: "ESG Readiness", icon: Upload },
  { href: "/where-i-stand", label: "Results", icon: BarChart2 },
  { href: "/kpi", label: "KPIs", icon: PieChart },
  { href: "/metrics", label: "Metrics", icon: ShieldAlert },
  { href: "/history", label: "Assessment History", icon: History },
];

const BOTTOM_NAV: NavItem[] = [
  { href: "/admin", label: "Admin Console", icon: Settings },
  { href: "/profile", label: "Profile", icon: User },
  { label: "Logout", icon: LogOut, onClick: async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/login';
      } catch (e) {
        // ignore
      }
    } 
  },
];

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ isMobileOpen, setIsMobileOpen, isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const renderNavItems = (items: NavItem[]) => (
    <nav className="flex flex-col gap-1 px-3 py-2">
      {items.map((item) => {
        const active = item.href 
          ? (item.exact ? pathname === item.href : pathname === item.href || pathname?.startsWith(item.href + "/"))
          : false;
        
        const Icon = item.icon;
        
        return (
          <button
            key={item.label}
            onClick={() => {
              if (item.onClick) item.onClick();
              else if (item.href) router.push(item.href);
              setIsMobileOpen(false); // Close mobile drawer on navigation
            }}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors relative group",
              active
                ? "bg-[#00673F]/10 text-[#00673F]"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
            title={isCollapsed ? item.label : undefined}
          >
            {active && (
              <motion.div 
                layoutId="active-nav"
                className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full bg-[#00673F]" 
              />
            )}
            <Icon className={cn("h-5 w-5 shrink-0", active ? "text-[#00673F]" : "text-slate-400 group-hover:text-slate-600")} aria-hidden />
            
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap text-sm font-medium"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isCollapsed ? 72 : 260,
          x: typeof window !== "undefined" && window.innerWidth < 1024 
             ? (isMobileOpen ? 0 : -260) 
             : 0 
        }}
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-border bg-white shadow-sm lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out"
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
          <Link href="/esg-readiness-platform" className="flex items-center gap-2 overflow-hidden" onClick={() => setIsMobileOpen(false)}>
            <img src="/logo.svg" alt="ESGroww logo" className="h-8 w-8 shrink-0 rounded-sm object-contain" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap text-lg font-bold tracking-tight text-primary"
                >
                  ESGroww
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          
          {/* Mobile Close Button */}
          <button 
            className="lg:hidden p-1 rounded-md text-slate-500 hover:bg-slate-100"
            onClick={() => setIsMobileOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          <div className="mb-2 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {!isCollapsed && "Platform"}
          </div>
          {renderNavItems(MAIN_NAV)}
        </div>

        <div className="shrink-0 border-t border-border py-4">
          {renderNavItems(BOTTOM_NAV)}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-20 h-6 w-6 items-center justify-center rounded-full border border-border bg-white shadow-sm text-slate-400 hover:text-slate-600 hover:border-slate-300 z-10"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </motion.aside>
    </>
  );
}

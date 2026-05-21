"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import TopNav from "@/components/TopNav";
import { Sidebar } from "@/components/layout/Sidebar";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;
  const isAuth = pathname?.startsWith("/login") || pathname?.startsWith("/register");
  
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isAdmin || isAuth) {
    return (
      <main className="mx-auto flex min-h-0 w-full min-w-0 max-w-none flex-1 flex-col overflow-y-auto min-h-[calc(100dvh-0px)] overflow-hidden p-0">
        {children}
      </main>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen} 
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <TopNav onMenuClick={() => setIsMobileOpen(true)} />
        <main
          className={cn(
            "flex-1 overflow-y-auto px-3 pt-1 pb-5 sm:px-4 sm:pb-6 lg:px-6 xl:px-8 2xl:px-10"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

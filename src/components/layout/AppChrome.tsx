"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import TopNav from "@/components/TopNav";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  return (
    <>
      {!isAdmin && <TopNav />}
      <main
        className={cn(
          "mx-auto flex min-h-0 w-full min-w-0 max-w-none flex-1 flex-col overflow-y-auto",
          isAdmin
            ? "min-h-[calc(100dvh-0px)] overflow-hidden p-0"
            : "px-3 pt-1 pb-5 sm:px-4 sm:pb-6 lg:px-6 xl:px-8 2xl:px-10"
        )}
      >
        {children}
      </main>
    </>
  );
}

"use client";

import { usePathname } from "next/navigation";
import VerticalFloatingMenu from "@/components/ui/VerticalFloatingMenu";

export default function VerticalFloatingMenuWrapper() {
  const pathname = usePathname();

  if (!pathname) return null;

  // hide on auth pages, admin console, and home page
  const hide = ["/login", "/register"];
  if (pathname === "/" || hide.includes(pathname) || hide.some((p) => pathname.startsWith(p + "/"))) return null;
  if (pathname.startsWith("/admin")) return null;

  return <VerticalFloatingMenu />;
}

"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/**
 * Renders a back-navigation button only after the client has mounted.
 * Placed in the TopNav so it's always accessible without touching any page layout.
 * Hidden on login, register, and upload pages.
 */
export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();
  // Avoid hydration mismatch — history length is browser-only.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide back button on login, register, and upload pages
  const hiddenPaths = ["/login", "/register", "/upload"];
  if (!mounted || hiddenPaths.includes(pathname)) return null;

  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="Go back"
      title="Go back"
      className="
        group flex items-center justify-center
        rounded-md px-2 py-1.5
        text-muted-foreground
        transition-colors duration-150
        hover:bg-muted hover:text-foreground
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
      "
    >
      <ArrowLeft
        className="size-4 transition-transform duration-150 group-hover:-translate-x-0.5"
        aria-hidden
      />
    </button>
  );
}

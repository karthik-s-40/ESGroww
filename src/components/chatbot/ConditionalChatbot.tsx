"use client";

import { usePathname } from "next/navigation";
import { MistralChatbot } from "./MistralChatbot";

/**
 * Conditionally renders the chatbot.
 * Hidden on login, register, and forgot-password pages.
 */
export function ConditionalChatbot() {
  const pathname = usePathname();

  // Hide chatbot on public pages.
  const hiddenPaths = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];
  if (hiddenPaths.includes(pathname)) return null;
  if (pathname?.startsWith("/admin")) return null;

  return <MistralChatbot />;
}

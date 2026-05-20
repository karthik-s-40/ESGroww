import type { Metadata } from "next";
import { Geist_Mono, Lexend } from "next/font/google";
import "./globals.css";
import { AppChrome } from "@/components/layout/AppChrome";
import { ConditionalChatbot } from "@/components/chatbot/ConditionalChatbot";
import VerticalFloatingMenuWrapper from "@/components/ui/VerticalFloatingMenuWrapper";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ESGroww - Sustainability Readiness Platform",
  description: "Enterprise ESG Readiness Intelligence Platform. Assessing, calculating, and scoring sustainability data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lexend.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex h-full flex-col bg-background font-sans text-foreground">
        <AppChrome>{children}</AppChrome>
        <ConditionalChatbot />
        <VerticalFloatingMenuWrapper />
      </body>
    </html>
  );
}

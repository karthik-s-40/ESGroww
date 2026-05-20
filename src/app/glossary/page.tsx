"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { glossaryData } from "@/lib/glossaryData";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";
const BookOpen = dynamic(() => import("lucide-react").then((m) => m.BookOpen), { ssr: false, loading: () => null });
const FileText = dynamic(() => import("lucide-react").then((m) => m.FileText), { ssr: false, loading: () => null });
const Cloud = dynamic(() => import("lucide-react").then((m) => m.Cloud), { ssr: false, loading: () => null });
const Key = dynamic(() => import("lucide-react").then((m) => m.Key), { ssr: false, loading: () => null });
const Zap = dynamic(() => import("lucide-react").then((m) => m.Zap), { ssr: false, loading: () => null });
const Droplet = dynamic(() => import("lucide-react").then((m) => m.Droplet), { ssr: false, loading: () => null });
const Layers = dynamic(() => import("lucide-react").then((m) => m.Layers), { ssr: false, loading: () => null });
const FlaskRound = dynamic(() => import("lucide-react").then((m) => m.FlaskRound), { ssr: false, loading: () => null });
const ShieldCheck = dynamic(() => import("lucide-react").then((m) => m.ShieldCheck), { ssr: false, loading: () => null });
const Globe = dynamic(() => import("lucide-react").then((m) => m.Globe), { ssr: false, loading: () => null });
const TrendingUp = dynamic(() => import("lucide-react").then((m) => m.TrendingUp), { ssr: false, loading: () => null });

// Icon map kept outside component to avoid recreation on every render
const ICON_MAP: Record<string, any> = {
  brsr: BookOpen,
  gri: BookOpen,
  issb: BookOpen,
  cdp: Cloud,
  kwh: Zap,
  kl: Droplet,
  "tco₂e": Cloud,
  tco2e: Cloud,
  cpcb: ShieldCheck,
  fssai: ShieldCheck,
  jwt: Key,
  capa: FileText,
  haccp: FlaskRound,
  rohs: FlaskRound,
  zdhc: FlaskRound,
  leed: BookOpen,
  nabh: ShieldCheck,
  "scope 1": Layers,
  "scope 2": Layers,
  "scope 3": Layers,
  stp: Droplet,
  sroi: TrendingUp,
  igbc: Globe,
};

export default function GlossaryPage() {
  // input is bound to the text input; q is the debounced value used for filtering
  const [input, setInput] = useState("");
  const [q, setQ] = useState("");

  // debounce the input -> q to avoid re-filtering on every keystroke
  useEffect(() => {
    const id = setTimeout(() => setQ(input), 250);
    return () => clearTimeout(id);
  }, [input]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return glossaryData;
    return glossaryData.filter((g) => {
      const t = g.term.toLowerCase();
      const a = (g.abbreviation || "").toLowerCase();
      const d = g.definition.toLowerCase();
      return t.includes(term) || a.includes(term) || d.includes(term);
    });
  }, [q]);

  const getIconFor = useCallback((term: string, abbreviation?: string) => {
    const key = (abbreviation || term).toLowerCase();

    for (const k of [key, term.toLowerCase()]) {
      if (ICON_MAP[k]) return ICON_MAP[k];
    }

    // keyword fallbacks
    if (term.toLowerCase().includes("carbon")) return Cloud;
    if (term.toLowerCase().includes("energy") || term.toLowerCase().includes("kwh")) return Zap;
    if (term.toLowerCase().includes("water") || term.toLowerCase().includes("kl")) return Droplet;
    if (term.toLowerCase().includes("building") || term.toLowerCase().includes("leed") || term.toLowerCase().includes("green")) return BookOpen;

    return null;
  }, []);

  // prepare processed items with resolved Icon to avoid recomputing during render
  const processed = useMemo(() => filtered.map((g) => ({ g, Icon: getIconFor(g.term, g.abbreviation) })), [filtered, getIconFor]);

  return (
    <div className="min-h-screen">
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#3d5248]/80">Resources</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#15221a]">Glossary & Abbreviations</h1>
          <p className="mt-2 text-sm leading-relaxed text-[#3d5248]">Common terms and abbreviations used across the platform.</p>
        </div>

        <div className="mb-6">
          <Input placeholder="Search terms or definitions..." value={input} onChange={(e) => setInput(e.target.value)} className="h-9 w-full max-w-2xl bg-white/80 text-sm" />
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {processed.map(({ g, Icon }) => (
            <GlossaryCard key={g.term} g={g} Icon={Icon} />
          ))}
        </section>
      </main>
    </div>
  );
}

// memoized card to avoid re-rendering unchanged cards
const GlossaryCard = React.memo(function GlossaryCard({ g, Icon }: { g: any; Icon: any }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#00673F]/10 text-[#00673F] font-semibold">
            {Icon ? <Icon className="h-5 w-5" /> : <span className="text-sm font-semibold">{g.term.charAt(0)}</span>}
          </div>
          <CardTitle className="text-base">{g.term}</CardTitle>
          {g.abbreviation && <Badge variant="outline" className="ml-auto text-[11px] uppercase">{g.abbreviation}</Badge>}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription>{g.definition}</CardDescription>
      </CardContent>
    </Card>
  );
});

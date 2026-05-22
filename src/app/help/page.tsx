"use client";

import { useState, type ElementType } from "react";
import {
  BookOpen,
  Bot,
  ChevronDown,
  CircleHelp,
  Gauge,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound,
  X,
  ZoomIn,
} from "lucide-react";

import { PageWrapper } from "../../components/layout/page-wrapper";
import { SectionCard } from "../../components/layout/section-card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { BodyText, PageTitle, SectionTitle } from "../../components/ui/typography";
import type { GuideSection } from "../../components/help/HelpComponents";
import { GuideSectionCard, StatCard } from "../../components/help/HelpComponents";
import { guideSections } from "../../components/help/guideSections";

// `guideSections` is extracted to a dedicated data file: see components/help/guideSections.ts

const totalSteps = guideSections.reduce((count, section) => count + section.steps.length, 0);

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ---------------------------------------------------------------------------
// Lightbox — image viewer overlay
// ---------------------------------------------------------------------------
interface LightboxState { src: string; alt: string }

function Lightbox({ image, onClose }: { image: LightboxState | null; onClose: () => void }) {
  if (!image) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="truncate pr-4 text-sm font-medium text-foreground">{image.alt}</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <img src={image.src} alt={image.alt} className="max-h-[75vh] w-full object-contain" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Accordion section — wraps GuideSectionCard with collapse + image lightbox
// ---------------------------------------------------------------------------
function AccordionSectionCard({
  section,
  onImageOpen,
}: {
  section: GuideSection;
  onImageOpen: (img: LightboxState) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div id={section.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Clickable header */}
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/40"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{section.title}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{section.eyebrow}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge variant="outline" className="rounded-full px-2 text-[10px]">
            {section.steps.length} steps
          </Badge>
          <ChevronDown
            className={[
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              open ? "rotate-180" : "",
            ].join(" ")}
          />
        </div>
      </button>

      {/* Body — delegated to your existing GuideSectionCard, wrapped for image click interception */}
      {open && (
        <div
          className="border-t border-border"
          onClick={(e) => {
            // Intercept clicks on <img> elements anywhere inside the section body
            const target = e.target as HTMLElement;
            const img = target.closest("img") as HTMLImageElement | null;
            if (img) {
              e.preventDefault();
              onImageOpen({ src: img.src, alt: img.alt || section.title });
            }
          }}
        >
          {/* Cursor pointer on images so users know they're clickable */}
          <style>{`#${section.id} img { cursor: zoom-in; }`}</style>
          <GuideSectionCard section={section} />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function HelpPage() {
  const [activeSection] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<LightboxState | null>(null);

  return (
    <>
      <PageWrapper maxWidth="wide" className="pb-14 pt-6">
        <div className="space-y-5">

          {/* ── Hero ─────────────────────────────────────────────────────── */}
          <div className="rounded-3xl border border-border bg-gradient-to-br from-card via-background to-muted/40 px-6 py-6 shadow-sm sm:px-7 sm:py-7">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div className="max-w-3xl space-y-3">
                <PageTitle>ESGroww user manual</PageTitle>
                <BodyText className="max-w-2xl">
                  This manual covers the user-side workflow from account access to uploads,
                  reporting, analytics, reference screens, and the chatbot.
                </BodyText>
                <BodyText className="max-w-2xl text-muted-foreground text-sm">
                  Use the table of contents to jump to any section, then follow the steps in order.
                </BodyText>
              </div>

              <div className="flex gap-3 shrink-0 sm:flex-col lg:flex-row">
                <StatCard label="Sections" value={String(guideSections.length)} note="Topics covered in this manual" />
                <StatCard label="Steps" value={String(totalSteps)} note="Actions listed in order" />
              </div>
            </div>
          </div>

          {/* ── How the guide works ──────────────────────────────────────── */}
          <SectionCard
            title={
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" aria-hidden />
                <span>How the guide works</span>
              </div>
            }
            description="Organized as a manual — read top to bottom or jump to the part you need."
            size="sm"
          >
            <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Access",  detail: "Sign up, verify, and recover access.",          icon: UserRound     },
                { label: "Assess",  detail: "Upload data and complete governance.",           icon: Upload        },
                { label: "Report",  detail: "Read the summary, results, and exports.",        icon: BookOpen      },
                { label: "Support", detail: "Use glossary, history, and the chatbot.",        icon: Bot           },
              ].map(({ label, detail, icon: Icon }) => (
                <div key={label} className="flex items-start gap-3 rounded-xl border border-border bg-background px-3.5 py-3">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <div>
                    <SectionTitle className="text-sm">{label}</SectionTitle>
                    <BodyText className="mt-0.5 text-xs text-muted-foreground leading-snug">{detail}</BodyText>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* ── Two-column layout ────────────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">

            {/* Sidebar */}
            <aside className="lg:sticky lg:top-6 lg:self-start space-y-4">
              <Card className="border-border shadow-sm">
                <CardHeader className="border-b border-border/60 pb-3">
                  <CardTitle className="text-foreground">On this page</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Jump to a section using the sticky table of contents.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-1.5 px-3 py-3">
                  {guideSections.map((section) => (
                    <Button
                      key={section.id}
                      type="button"
                      variant={activeSection === section.id ? "default" : "ghost"}
                      className="h-auto w-full justify-start rounded-xl border border-border/60 px-3 py-2.5 text-left"
                      onClick={() => scrollToSection(section.id)}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-foreground">{section.title}</p>
                          <p className="truncate text-[11px] text-muted-foreground leading-snug">{section.eyebrow}</p>
                        </div>
                        <Badge variant="outline" className="shrink-0 rounded-full px-1.5 text-[10px]">
                          {section.steps.length}
                        </Badge>
                      </div>
                    </Button>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border shadow-sm">
                <CardHeader className="border-b border-border/60 pb-3">
                  <CardTitle className="text-foreground">Quick reminder</CardTitle>
                </CardHeader>
                <CardContent className="pt-3">
                  <BodyText className="text-sm">
                    Use this page as the normal-user handbook. It does not document admin workflows or admin routes.
                  </BodyText>
                </CardContent>
              </Card>
            </aside>

            {/* Main content — accordion sections */}
            <main className="space-y-3">
              {guideSections.map((section) => (
                <AccordionSectionCard
                  key={section.id}
                  section={section}
                  onImageOpen={setLightboxImage}
                />
              ))}

              {/* Footer nudge */}
              <div className="flex items-start gap-3 rounded-2xl border border-border bg-card px-5 py-4">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <div>
                  <SectionTitle>Need a quick reset?</SectionTitle>
                  <BodyText className="mt-1 max-w-3xl text-sm text-muted-foreground">
                    If you lose track of where you are, start with the summary, then open results,
                    analytics, glossary, or the chatbot for the next step in plain language.
                  </BodyText>
                </div>
              </div>
            </main>
          </div>

          <p className="text-[11px] leading-relaxed text-muted-foreground">
            This help center is written for normal users and the user-side workflow only.
          </p>
        </div>
      </PageWrapper>

      {/* Lightbox rendered outside PageWrapper so it overlays everything */}
      <Lightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
    </>
  );
}
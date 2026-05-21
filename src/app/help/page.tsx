"use client";

import { useState, type ElementType } from "react";
import {
  BookOpen,
  Bot,
  CircleHelp,
  Gauge,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound,
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
const totalScreenshots = guideSections.reduce(
  (count, section) => count + section.steps.reduce((stepCount, step) => stepCount + step.screenshots.length, 0),
  0
);

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function HelpPage() {
  const [activeSection] = useState<string | null>(null);

  return (
    <PageWrapper maxWidth="wide" className="pb-14 pt-6">
      <div className="space-y-6">
        <div className="rounded-3xl border border-border bg-gradient-to-br from-card via-background to-muted/40 p-6 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-3xl space-y-4">
              <PageTitle>ESGroww help center</PageTitle>
              <BodyText className="max-w-3xl">
                This walkthrough covers the full user-side workflow from account access to uploads, reporting,
                analytics, reference screens, and the chatbot. Every step includes a real screenshot from the app.
              </BodyText>
              <BodyText className="max-w-3xl">
                Use the sticky table of contents to jump to any section, then follow the step cards in order for a
                plain-language guide to the platform.
              </BodyText>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[360px] lg:grid-cols-1">
              <StatCard label="Walkthrough sections" value={String(guideSections.length)} note="The main user flows" />
              <StatCard label="Step-by-step screens" value={String(totalSteps)} note="Every major action covered" />
              <StatCard label="Screenshots included" value={String(totalScreenshots)} note="Real captures from the app" />
            </div>
          </div>
        </div>

        <SectionCard
          title={
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" aria-hidden />
              <span>How the guide works</span>
            </div>
          }
          description="The page is organized around the normal user journey, so you can read it top to bottom or jump to the part you need."
          size="sm"
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-border bg-background p-4">
              <SectionTitle className="text-base">Access</SectionTitle>
              <BodyText className="mt-2">Sign up, verify, and recover access.</BodyText>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <SectionTitle className="text-base">Assess</SectionTitle>
              <BodyText className="mt-2">Upload data and complete governance.</BodyText>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <SectionTitle className="text-base">Report</SectionTitle>
              <BodyText className="mt-2">Read the summary, results, and exports.</BodyText>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <SectionTitle className="text-base">Support</SectionTitle>
              <BodyText className="mt-2">Use glossary, history, and the chatbot.</BodyText>
            </div>
          </div>
        </SectionCard>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <Card className="border-border shadow-sm">
              <CardHeader className="border-b border-border/60 pb-3">
                <CardTitle className="text-foreground">On this page</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Jump to a section using the sticky table of contents.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-2 pt-4">
                {guideSections.map((section) => (
                  <Button
                    key={section.id}
                    type="button"
                    variant={activeSection === section.id ? "default" : "ghost"}
                    className="h-auto w-full justify-start rounded-2xl border border-border/70 px-3 py-3 text-left"
                    onClick={() => scrollToSection(section.id)}
                  >
                    <div className="flex w-full items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <p className="text-sm font-medium text-foreground">{section.title}</p>
                        <p className="text-xs leading-snug text-muted-foreground">{section.eyebrow}</p>
                      </div>
                      <Badge variant="outline" className="rounded-full">
                        {section.steps.length}
                      </Badge>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card className="mt-4 border-border shadow-sm">
              <CardHeader className="border-b border-border/60 pb-3">
                <CardTitle className="text-foreground">Quick reminder</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <BodyText>
                  Use this page as the normal-user handbook. It does not document admin workflows or admin routes.
                </BodyText>
              </CardContent>
            </Card>
          </aside>

          <main className="space-y-6">
            {guideSections.map((section) => (
              <GuideSectionCard key={section.id} section={section} />
            ))}
          </main>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <SectionTitle>Need a quick reset?</SectionTitle>
              <BodyText className="mt-2 max-w-3xl">
                If you lose track of where you are, start with the summary, then open results, analytics, glossary, or
                the chatbot for the next step in plain language.
              </BodyText>
            </div>
          </div>
        </div>

        <p className="text-[11px] leading-relaxed text-muted-foreground">
          This help center is written for normal users and the user-side workflow only.
        </p>
      </div>
    </PageWrapper>
  );
}

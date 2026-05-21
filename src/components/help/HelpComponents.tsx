"use client";

import React, { type ElementType } from "react";
import { CircleHelp, ShieldCheck } from "lucide-react";

import { Badge } from "../ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { BodyText, HelperText, MetricValue, SectionTitle } from "../ui/typography";

export type Screenshot = {
  src: string;
  alt: string;
};

export type GuideStep = {
  step: string;
  title: string;
  description: string;
  result: string;
  screenshots: Screenshot[];
};

export type GuideSection = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: ElementType;
  steps: GuideStep[];
  tips: string[];
  mistakes: string[];
};

export function ScreenshotGallery({ screenshots }: { screenshots: Screenshot[] }) {
  return (
    <div className={`grid gap-3 ${screenshots.length > 1 ? "sm:grid-cols-2" : ""}`}>
      {screenshots.map((shot) => (
        <figure key={shot.src} className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
          <img src={shot.src} alt={shot.alt} className="aspect-[16/10] w-full object-cover" loading="lazy" />
        </figure>
      ))}
    </div>
  );
}

export function StepCard({ step }: { step: GuideStep }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <Card size="sm" className="border-border shadow-sm">
        <CardHeader className="border-b border-border/60 pb-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <Badge variant="outline" className="w-fit rounded-full">
                Step {step.step}
              </Badge>
              <CardTitle className="mt-2 text-foreground">{step.title}</CardTitle>
              <CardDescription className="mt-1 text-muted-foreground">{step.description}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pt-4">
          <BodyText className="text-foreground">{step.result}</BodyText>
          <HelperText>
            Read this step as the expected user action and the result you should see after the screen loads.
          </HelperText>
        </CardContent>
      </Card>

      <ScreenshotGallery screenshots={step.screenshots} />
    </div>
  );
}

export function GuideSectionCard({ section }: { section: GuideSection }) {
  const Icon = section.icon;

  return (
    <details id={section.id} open className="scroll-mt-24 rounded-3xl border border-border bg-card shadow-sm">
      <summary className="list-none cursor-pointer px-5 py-5 sm:px-6 [&::-webkit-details-marker]:hidden">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
            <Icon className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-full">
                {section.eyebrow}
              </Badge>
              <Badge variant="outline" className="rounded-full">
                {section.steps.length} steps
              </Badge>
            </div>
            <SectionTitle className="mt-2">{section.title}</SectionTitle>
            <BodyText className="mt-2 max-w-3xl">{section.description}</BodyText>
          </div>
        </div>
      </summary>

      <div className="border-t border-border/70 px-5 py-5 sm:px-6">
        <div className="space-y-4">
          {section.steps.map((step) => (
            <StepCard key={`${section.id}-${step.step}`} step={step} />
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Card size="sm" className="border-primary/15 bg-primary/5 shadow-sm">
            <CardHeader className="border-b border-primary/10 pb-3">
              <CardTitle className="text-foreground">Helpful tips</CardTitle>
              <CardDescription className="text-muted-foreground">Small reminders that make the workflow easier to follow.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2">
                {section.tips.map((tip) => (
                  <li key={tip} className="flex gap-2 text-sm leading-relaxed text-foreground">
                    <CircleHelp className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card size="sm" className="border-destructive/15 bg-destructive/5 shadow-sm">
            <CardHeader className="border-b border-destructive/10 pb-3">
              <CardTitle className="text-foreground">Common mistakes</CardTitle>
              <CardDescription className="text-muted-foreground">Frequent issues that can interrupt the flow or distort the result.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2">
                {section.mistakes.map((mistake) => (
                  <li key={mistake} className="flex gap-2 text-sm leading-relaxed text-foreground">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </details>
  );
}

type StatVariant = "default" | "primary" | "destructive";

export function StatCard({
  label,
  value,
  note,
  variant = "default",
}: {
  label: string;
  value: string;
  note: string;
  variant?: StatVariant;
}) {
  const base = "size=\"sm\" shadow-sm";
  const variantClass =
    variant === "primary"
      ? "border-primary/15 bg-primary/5"
      : variant === "destructive"
      ? "border-destructive/15 bg-destructive/5"
      : "border-border";

  return (
    // kept as Card wrapper so outer visual system remains consistent
    <Card size="sm" className={`${variantClass} shadow-sm`}>
      <CardContent className="space-y-1 px-4 py-4">
        <HelperText className="uppercase tracking-[0.16em] text-muted-foreground">{label}</HelperText>
        <MetricValue className="text-foreground">{value}</MetricValue>
        <HelperText>{note}</HelperText>
      </CardContent>
    </Card>
  );
}

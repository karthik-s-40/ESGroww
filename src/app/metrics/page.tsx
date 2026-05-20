"use client";

import { useEffect, useState } from "react";
import CategoryCard from "@/components/metrics/CategoryCard";
import OverallMetricsChart from "@/components/metrics/OverallMetricsChart";
import CategoryComparisonChart from "@/components/metrics/CategoryComparisonChart";
import ConfidenceChart from "@/components/metrics/ConfidenceChart";
import PageLayout from "@/components/shared/PageLayout";

type AssessmentResponse = {
  success: boolean;
  data: any;
};

export default function MetricsPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/assessment")
      .then((r) => r.json())
      .then((res: AssessmentResponse) => {
        if (!mounted) return;
        if (res.success) setData(res.data);
        else setError("Failed to load assessment data.");
      })
      .catch((e) => {
        if (!mounted) return;
        setError(String(e));
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <PageLayout
        title="Completeness & Confidence"
        description="Data completeness and confidence breakdowns by category"
        loading
      >
        <div />
      </PageLayout>
    );
  }

  if (error || !data) {
    return (
      <PageLayout
        title="Completeness & Confidence"
        description="Data completeness and confidence breakdowns by category"
        error={error ?? "No data available"}
      >
        <div />
      </PageLayout>
    );
  }

  const completeness = data.completeness;
  const confidence = (data.confidence ?? 0) * 100;
  const categoryScores = data.categoryScores || {};
  const categoryConfidence = data.categoryConfidence || [];
  const months = data.annualizedValues?.monthsUploaded || {};
  const messages = data.metadata?.messages || {};

  const safeCompleteness = Math.min(100, Math.max(0, completeness || 0));
  const safeConfidence = Math.min(100, Math.max(0, confidence || 0));

  const categories = [
    {
      key: "energy",
      title: "Energy",
      score: categoryScores.energy,
      conf: categoryConfidence.find((c: any) => c.category === "Energy"),
      monthKey: "electricity",
    },
    {
      key: "water",
      title: "Water",
      score: categoryScores.water,
      conf: categoryConfidence.find((c: any) => c.category === "Water"),
      monthKey: "water",
    },
    {
      key: "waste",
      title: "Waste",
      score: categoryScores.waste,
      conf: categoryConfidence.find((c: any) => c.category === "Waste"),
      monthKey: "waste",
    },
    {
      key: "governance",
      title: "Governance",
      score: categoryScores.governance,
      conf: categoryConfidence.find((c: any) => c.category === "Governance"),
      monthKey: "governance",
    },
  ];

  return (
    <PageLayout
      title="Completeness & Confidence"
      description="Data completeness and confidence breakdowns by category"
    >
      {/* Stat summary row */}
      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-center">
          <p className="text-[10px] font-medium uppercase tracking-wide text-emerald-700">
            Completeness
          </p>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-emerald-900">
            {Math.round(safeCompleteness)}%
          </p>
        </div>
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-center">
          <p className="text-[10px] font-medium uppercase tracking-wide text-blue-700">
            Confidence
          </p>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-blue-900">
            {Math.round(safeConfidence)}%
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-center">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
            Categories
          </p>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-slate-900">
            {categories.length}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-center">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
            Data points
          </p>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-slate-900">
            {categoryConfidence.length}
          </p>
        </div>
      </div>

      {/* Charts row */}
      <div className="mb-3 grid grid-cols-1 gap-3 xl:grid-cols-12">
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm xl:col-span-8">
          <div className="border-b border-slate-100 px-3 py-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Score Overview
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-px bg-slate-100 lg:grid-cols-2">
            <div className="bg-white p-3">
              <OverallMetricsChart categoryScores={categoryScores} />
            </div>
            <div className="bg-white p-3">
              <CategoryComparisonChart
                data={categories.map((c) => ({
                  name: c.title,
                  score: Math.min(100, Math.max(0, c.score || 0)),
                  completeness: Math.min(
                    100,
                    Math.max(0, months[c.monthKey] ? (months[c.monthKey] / 12) * 100 : 0)
                  ),
                }))}
              />
            </div>
          </div>
        </section>

        <aside className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm xl:col-span-4">
          <div className="border-b border-slate-100 px-3 py-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Confidence by Category
            </h2>
          </div>
          <div className="p-3">
            <ConfidenceChart data={categoryConfidence} />
          </div>
        </aside>
      </div>

      {/* Category cards */}
      <section className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((c) => (
          <CategoryCard
            key={c.key}
            title={c.title}
            score={c.score}
            monthsUploaded={months[c.monthKey]}
            confidence={c.conf?.confidence ?? 0}
            confidenceMonths={c.conf?.months}
            message={messages[c.key]}
          />
        ))}
      </section>
    </PageLayout>
  );
}

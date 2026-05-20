"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";

import {
  getGovernanceQuestionnaire,
  saveGovernanceQuestionnaire,
  type GovernanceFormState,
} from "@/actions/governance.actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ITEMS: { key: keyof GovernanceFormState; label: string; description: string }[] = [
  {
    key: "hasEsgPolicy",
    label: "ESG / sustainability policy",
    description: "Formal documented policy covering environmental and social commitments.",
  },
  {
    key: "hasSustainabilityCommittee",
    label: "Sustainability committee or owner",
    description: "Named governance body or role accountable for sustainability performance.",
  },
  {
    key: "hasAuditReports",
    label: "Internal / external audit reports",
    description: "Recent audits relevant to operations, energy, water, waste, or ESG.",
  },
  {
    key: "hasComplianceDocs",
    label: "Regulatory & compliance register",
    description: "Permits, licences, and compliance documentation on file.",
  },
];

export default function GovernanceQuestionnairePage() {
  const [values, setValues] = useState<GovernanceFormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await getGovernanceQuestionnaire();
      if (!cancelled) {
        setValues(data);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values) return;
    setSaving(true);
    setMessage(null);
    const res = await saveGovernanceQuestionnaire(values);
    setSaving(false);
    if (res.ok) {
      setMessage({ type: "ok", text: "Questionnaire saved." });
    } else {
      setMessage({ type: "err", text: res.error });
    }
  }

  if (loading || !values) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" aria-hidden />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl pb-16">
      <Link
        href="/upload"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Data Load
      </Link>

      <div className="mb-8 flex items-start gap-3">
        <div className="rounded-xl bg-emerald-100 p-3">
          <ShieldCheck className="h-6 w-6 text-emerald-800" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Governance questionnaire</h1>
          <p className="mt-1 text-sm text-slate-600">
            Confirm documentation and governance signals for your facility. Responses are stored with your hospital
            record.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {ITEMS.map((item) => (
          <label
            key={item.key}
            className="flex cursor-pointer gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 hover:bg-slate-50"
          >
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              checked={values[item.key]}
              onChange={(e) => setValues((v) => (v ? { ...v, [item.key]: e.target.checked } : v))}
            />
            <span>
              <span className="block text-sm font-medium text-slate-900">{item.label}</span>
              <span className="mt-0.5 block text-xs text-slate-500">{item.description}</span>
            </span>
          </label>
        ))}

        {message && (
          <p
            className={`text-sm ${message.type === "ok" ? "text-emerald-700" : "text-rose-600"}`}
            role="status"
          >
            {message.text}
          </p>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save questionnaire"
            )}
          </Button>
          <Link href="/upload" className={cn(buttonVariants({ variant: "outline" }))}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

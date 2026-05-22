"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DownloadReportButton } from "@/components/shared/DownloadReportButton";
// ReportPdfCapture removed from import
import { Link2, Mail, Phone } from "lucide-react";
import { type KPIBenchmark } from "@/lib/kpiUtils";
import { formatWithUnit, UNIT } from "@/lib/calculations";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AssessmentData {
  orgName?: string;
  sector?: string;
  overallScore: number;
  readinessStage: string;
  completeness: number;
  confidence: number;
  totalEmissions: number;
  annualizedValues: { electricity: number; water: number; fuel: number; waste: number };
  certificationReadiness?: { name: string; score: number; status: string }[];
  categoryScores?: { energy: number; water: number; waste: number; governance: number };
  emissions?: { scope1: number; scope2: number; scope3: number };
  strengths?: string[];
  gaps?: { text: string; severity: "High" | "Medium" | "Low" }[];
  regulatoryReadiness?: { regulation: string; readiness: number; risk: "Low" | "Medium" | "Medium-High" | "High" }[];
  roadmap?: { action: string; timeline: string; impact: string }[];
  builtUpArea?: number;
  orgBuiltUpArea?: number;
  percentages?: { renewableEnergy?: number; waterRecycling?: number; wasteRecycling?: number };
  evaluatedKpis?: Record<string, KPIBenchmark>;
}
 
// ─── Helpers ──────────────────────────────────────────────────────────────────
const stageColor = (score: number) => {
  if (score >= 90) return "#16a34a";
  if (score >= 75) return "#22c55e";
  if (score >= 60) return "#ca8a04";
  if (score >= 40) return "#ea580c";
  return "#dc2626";
};
 
const stageLabel = (score: number) => {
  if (score >= 90) return "Advanced";
  if (score >= 75) return "Strong";
  if (score >= 60) return "Possible";
  if (score >= 40) return "Foundational";
  return "Not Ready";
};
 
const riskColor: Record<string, string> = {
  Low: "#16a34a", Medium: "#ca8a04", "Medium-High": "#ea580c", High: "#dc2626",
};
const sevColor: Record<string, string> = {
  High: "#dc2626", Medium: "#ea580c", Low: "#ca8a04",
};

const formatCertName = (name: string): string => {
  // Format certification names for display
  const nameMap: Record<string, string> = {
    ISO14001: "ISO 14001",
    ISO50001: "ISO 50001",
    NABH: "NABH",
    IGBC: "IGBC Healthcare",
    LEED: "LEED",
    WELL: "WELL",
    BRSR: "BRSR",
    GRI: "GRI",
    CDP: "CDP",
  };
  return nameMap[name] || name;
};
 
 
// ─── Gauge SVG ────────────────────────────────────────────────────────────────
function Gauge({ value, size = 88 }: { value: number; size?: number }) {
  const r = 34; const cx = 44;
  const circ = Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const color = stageColor(value);
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 88 56">
      <path d={`M10,44 A34,34 0 0,1 78,44`} fill="none" stroke="#e2e8f0" strokeWidth="7" strokeLinecap="round" />
      <path d={`M10,44 A34,34 0 0,1 78,44`} fill="none" stroke={color} strokeWidth="7"
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1s ease" }} />
      <text x={cx} y={42} textAnchor="middle" fontSize="13" fontWeight="700" fill={color}>{value}</text>
    </svg>
  );
}
 
// ─── Mini bar ─────────────────────────────────────────────────────────────────
function Bar({ value, color = "#3b82f6" }: { value: number; color?: string }) {
  return (
    <div style={{ background: "#f1f5f9", borderRadius: 4, height: 5, overflow: "hidden" }}>
      <div style={{ width: `${value}%`, background: color, height: "100%", borderRadius: 4, transition: "width 0.8s ease" }} />
    </div>
  );
}
 
// ─── Radar chart (SVG) ────────────────────────────────────────────────────────
function Radar({ scores }: { scores: { label: string; value: number }[] }) {
  const cx = 80; const cy = 80; const r = 60;
  const n = scores.length;
  const pts = scores.map((s, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const rv = (s.value / 100) * r;
    return { x: cx + rv * Math.cos(angle), y: cy + rv * Math.sin(angle) };
  });
  const gridPts = (frac: number) =>
    scores.map((_, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      return `${cx + frac * r * Math.cos(angle)},${cy + frac * r * Math.sin(angle)}`;
    }).join(" ");
  const polyPts = pts.map(p => `${p.x},${p.y}`).join(" ");
  const labelPts = scores.map((s, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const lv = r + 14;
    return { x: cx + lv * Math.cos(angle), y: cy + lv * Math.sin(angle), label: s.label, value: s.value };
  });
  return (
    <svg width={160} height={160} viewBox="0 0 160 160">
      {[0.25, 0.5, 0.75, 1].map(f => (
        <polygon key={f} points={gridPts(f)} fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
      ))}
      {scores.map((_, i) => {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(angle)} y2={cy + r * Math.sin(angle)} stroke="#e2e8f0" strokeWidth="0.8" />;
      })}
      <polygon points={polyPts} fill="rgba(59,130,246,0.18)" stroke="#3b82f6" strokeWidth="1.5" />
      {labelPts.map((p, i) => (
        <text key={i} x={p.x} y={p.y} textAnchor="middle" fontSize="7" fill="#64748b" fontWeight="600">
          {p.label}
        </text>
      ))}
    </svg>
  );
}
 
// ─── Mock fallback data ────────────────────────────────────────────────────────
const MOCK: AssessmentData = {
  orgName: "Loading...",
  sector: "Healthcare",
  overallScore: 0,
  readinessStage: "Loading...",
  completeness: 0,
  confidence: 0,
  totalEmissions: 0,
  annualizedValues: { electricity: 0, water: 0, fuel: 0, waste: 0 },
  certificationReadiness: [],
  categoryScores: { energy: 0, water: 0, waste: 0, governance: 0 },
  emissions: { scope1: 0, scope2: 0, scope3: 0 },
  strengths: [],
  gaps: [],
  regulatoryReadiness: [],
  roadmap: [],
};
 
// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ResultsPage() {
  const [data, setData] = useState<AssessmentData>(MOCK);
  const [loaded, setLoaded] = useState(false);
  const [consultationOpen, setConsultationOpen] = useState(false);
 
  useEffect(() => {
    fetch("/api/assessment", { cache: "no-store" })
      .then(r => r.json())
      .then(r => { 
        if (r?.data) {
          setData(r.data);
        }
      })
      .catch(err => {
        console.error("Failed to fetch assessment:", err);
      })
      .finally(() => setLoaded(true));
    setTimeout(() => setLoaded(true), 800);
  }, []);
 
  const catScores = data.categoryScores ?? { energy: 0, water: 0, waste: 0, governance: 0 };
  const emis = data.emissions ?? { scope1: 0, scope2: 0, scope3: 0 };
  const certEntries = Array.isArray(data.certificationReadiness)
  ? data.certificationReadiness
  : [];
  const score = Math.round(data.overallScore);
  const color = stageColor(score);
 
  const radarData = [
    { label: "Energy", value: catScores.energy },
    { label: "Water", value: catScores.water },
    { label: "Waste", value: catScores.waste },
    { label: "Gov.", value: catScores.governance },
    { label: "Data", value: Math.round(data.confidence * 100) },
  ];
 
  const timelineGroups: Record<string, typeof MOCK.roadmap> = {};
  (data.roadmap ?? []).forEach(r => {
    if (!timelineGroups[r.timeline]) timelineGroups[r.timeline] = [];
    timelineGroups[r.timeline]!.push(r);
  });

  // ── KPI derivations from existing data ──
  const annEl   = data.annualizedValues.electricity ?? 0;
  const annWa   = data.annualizedValues.water       ?? 0;
  const sqft    = data.builtUpArea ?? data.orgBuiltUpArea ?? 0;
  const renPct  = data.percentages?.renewableEnergy  ?? 0;
  const wRePct  = data.percentages?.waterRecycling   ?? 0;
  const wsePct  = data.percentages?.wasteRecycling   ?? 0;

  const evalKpis = data.evaluatedKpis || {
    energyIntensity: { value: null, status: "Insufficient Data", range: "N/A", threshold: "N/A", scoreImpact: "Zero" },
    waterIntensity: { value: null, status: "Insufficient Data", range: "N/A", threshold: "N/A", scoreImpact: "Zero" },
    recyclingRate: { value: null, status: "Insufficient Data", range: "N/A", threshold: "N/A", scoreImpact: "Zero" },
    wasteSegregation: { value: null, status: "Insufficient Data", range: "N/A", threshold: "N/A", scoreImpact: "Zero" },
    renewableEnergy: { value: null, status: "Insufficient Data", range: "N/A", threshold: "N/A", scoreImpact: "Zero" },
    tankerDependency: { value: null, status: "Insufficient Data", range: "N/A", threshold: "N/A", scoreImpact: "Zero" },
    waterReuse: { value: null, status: "Insufficient Data", range: "N/A", threshold: "N/A", scoreImpact: "Zero" },
    powerFactor: { value: null, status: "Insufficient Data", range: "N/A", threshold: "N/A", scoreImpact: "Zero" },
    dgDependency: { value: null, status: "Insufficient Data", range: "N/A", threshold: "N/A", scoreImpact: "Zero" },
  } as Record<string, KPIBenchmark>;

  const kpiItems = [
    { title: "Energy Intensity",    kpi: evalKpis.energyIntensity,   unit: "kWh/sqft/yr", icon: "⚡" },
    { title: "Water Intensity",     kpi: evalKpis.waterIntensity,   unit: "KL/sqft/yr", icon: "💧" },
    { title: "Renewable Energy",    kpi: evalKpis.renewableEnergy,     unit: "%", icon: "☀️" },
    { title: "Water Reuse",         kpi: evalKpis.waterReuse,          unit: "%", icon: "🔄" },
    { title: "Recycling Rate",      kpi: evalKpis.recyclingRate,       unit: "%", icon: "♻️" },
    { title: "Waste Segregation",   kpi: evalKpis.wasteSegregation,    unit: "%", icon: "🗑️" },
    { title: "Tanker Dependency",   kpi: evalKpis.tankerDependency,    unit: "%", icon: "🚛" },
    { title: "Power Factor",        kpi: evalKpis.powerFactor,           unit: "", icon: "🔌" },
    { title: "DG Dependency",       kpi: evalKpis.dgDependency,             unit: "%", icon: "🛢️" },
  ];
 
  const glassCardClass = "bg-white/70 backdrop-blur-md border-white/20 shadow-xl";
  const glassCardStyle: Record<string, string> = {
    background: "rgba(255, 255, 255, 0.78)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid rgba(255, 255, 255, 0.45)",
    boxShadow: "0 20px 45px rgba(15, 23, 42, 0.08)",
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col px-3 py-3.5 sm:px-4 sm:py-4 box-border overflow-x-hidden transition-opacity duration-500 ease-in-out"
      style={{
        background: "linear-gradient(180deg, #f8fafc 0%, #ecfdf5 100%)",
        opacity: loaded ? 1 : 0,
      }}
    >
      <div
        id="results-report-capture"
        className="flex flex-col flex-1 min-h-0 w-full max-w-full"
      >
      {/* ── Header ── */}
      <div className="flex shrink-0 flex-wrap items-end justify-between gap-x-3 gap-y-2 border-b border-border pb-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-7 rounded-sm" style={{ background: color }} />
            <div>
              <h1 className="m-0 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                ESG Intelligence Dashboard
              </h1>
              <p className="m-0 text-xs text-muted-foreground mt-0.5">
                {data.orgName ?? "Organization"} · {data.sector ?? "Healthcare"} · Assessment Reference
              </p>
            </div>
          </div>
        </div>
        <div data-html2canvas-ignore="true" className="flex w-full flex-wrap gap-2 items-center sm:w-auto sm:flex-nowrap">
          <DownloadReportButton
            data={data}
            captureRootId="pdf-report-capture"
            label={loaded ? "Download Report" : "Loading report..."}
            className="min-w-[140px] flex-1 sm:flex-none bg-slate-900 text-white hover:bg-slate-800"
            disabled={!loaded}
          />
          <Button
            variant="outline"
            className="min-w-[140px] flex-1 sm:flex-none border-slate-200 text-slate-700 hover:bg-slate-100"
            onClick={() => setConsultationOpen((prev) => !prev)}
          >
            Book Consultation
          </Button>
        </div>
      </div>
 
      {consultationOpen && (
        <div className="mb-3 rounded-2xl bg-card border border-border p-4 shadow-md">
          <div className="flex justify-between items-start gap-3 mb-3.5">
            <div>
              <p className="m-0 text-xs font-bold text-emerald-500 uppercase tracking-wider">
                Consultation Request
              </p>
              <h2 className="m-0 mt-2 text-lg font-bold text-slate-900">
                Book your ESG consultation with ESGroww
              </h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setConsultationOpen(false)}>
              Close
            </Button>
          </div>
          <p className="m-0 text-sm leading-relaxed text-muted-foreground">
            Get a personalized review of your ESG assessment, customized action plans, and expert guidance to accelerate sustainability readiness. Share your details and we will connect you with our specialist team.
          </p>
          <div className="grid gap-3 mt-4 grid-cols-1 md:grid-cols-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-border">
              <p className="m-0 text-xs font-bold text-slate-900">Email</p>
              <p className="m-0 mt-2 text-sm text-muted-foreground"><Mail className="inline-block" style={{ marginRight: 8, verticalAlign: "middle" }} /> hello@samcorporate.com</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-border">
              <p className="m-0 text-xs font-bold text-slate-900">Phone</p>
              <p className="m-0 mt-2 text-sm text-muted-foreground"><Phone className="inline-block" style={{ marginRight: 8, verticalAlign: "middle" }} /> +91 22 1234 5678</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-border">
              <p className="m-0 text-xs font-bold text-slate-900">Connect</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <a href="https://www.linkedin.com/company/sam-corporate/posts/?feedView=all" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold no-underline"><Link2 size={16} /> LinkedIn</a>
                <a href="https://www.facebook.com/samcorporate/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-slate-50 text-slate-800 hover:bg-slate-100 text-xs font-semibold no-underline"><Link2 size={16} /> Facebook</a>
                <a href="https://x.com/SamCorporate" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-slate-50 text-slate-900 hover:bg-slate-100 text-xs font-semibold no-underline"><Link2 size={16} /> X</a>
                <a href="https://www.instagram.com/samcorporate/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 text-xs font-semibold no-underline"><Link2 size={16} /> Instagram</a>
                <a href="https://www.youtube.com/channel/UCPSzEWs8GN8RIG5lzHbjCAg" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-slate-50 text-red-600 hover:bg-red-50 text-xs font-semibold no-underline"><Link2 size={16} /> YouTube</a>
              </div>
            </div>
          </div>
        </div>
      )}
 
      {/* ── Main grid: single col on phones, 2 cols tablet, 4 cols lg+ (locks the exact 80% layout design) ── */}
      <div className="flex-1 min-h-0 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
 
        {/* ── Col 1: Overall Hero (spans 2 rows on lg+) ── */}
        <div className={`${glassCardClass} flex flex-col gap-4 rounded-2xl p-4 sm:p-4.5 md:col-span-2 lg:col-span-1 lg:row-span-2`} style={glassCardStyle}>
          <div className="text-center w-full shrink-0">
            <p className="m-0 text-xs font-bold text-muted-foreground uppercase tracking-wider">Overall Readiness</p>
            <div className="my-1.5 mx-auto w-fit">
              <Gauge value={score} size={120} />
            </div>
            <div className="mt-1 text-sm font-bold" style={{ color }}>
              {stageLabel(score)}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">{data.readinessStage}</div>
          </div>
 
          <div className="w-full mt-2 flex justify-center shrink-0">
            <Radar scores={radarData} />
          </div>
 
          <div className="w-full mt-2 shrink-0">
            {[
              { label: "Completeness", val: Math.round(data.completeness), col: "#3b82f6" },
              { label: "Confidence", val: Math.round(data.confidence * 100), col: "#8b5cf6" },
            ].map(m => (
              <div key={m.label} className="mb-2">
                <div className="flex justify-between text-xs text-slate-500 mb-0.5">
                  <span>{m.label}</span><span className="font-bold">{m.val}%</span>
                </div>
                <Bar value={m.val} color={m.col} />
              </div>
            ))}
            <div className="bg-slate-50 rounded-xl p-2.5 mt-2.5 border border-border">
              <p className="m-0 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Total Emissions</p>
              <p className="m-0 mt-0.5 text-lg font-black text-slate-900">{data.formattedEmissions?.total ?? formatWithUnit(data.totalEmissions, UNIT.EMISSIONS_KG)}</p>
              <p className="m-0 text-[10px] text-muted-foreground font-medium">per year</p>
            </div>
          </div>
        </div>
 
        {/* ── Row 1 Col 2: Certification Readiness ── */}
        <div className={`${glassCardClass} rounded-2xl p-4 sm:p-4.5 overflow-hidden flex flex-col min-w-0`} style={glassCardStyle}>
          <p className="m-0 mb-3 text-xs font-bold text-slate-900 uppercase tracking-wider">Certification Readiness</p>
          <div className="flex-1 flex flex-col gap-2 overflow-visible">
            {certEntries.map((cert) => {
              const s = cert.score;
              const c = stageColor(s);
              return (
                <div key={cert.name} className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                  <div className="basis-[70px] flex-[0_0_70px] lg:basis-[85px] lg:flex-[0_0_85px] text-xs font-semibold text-slate-700 break-words leading-tight">{formatCertName(cert.name)}</div>
                  <div className="flex-1 min-w-[30px]"><Bar value={s} color={c} /></div>
                  <div className="basis-[20px] flex-[0_0_20px] text-xs font-bold text-right" style={{ color: c }}>{s}</div>
                  <div className="basis-[55px] flex-[0_0_55px] lg:basis-[68px] lg:flex-[0_0_68px] text-[9px] lg:text-[10px] font-bold rounded-md py-0.5 px-1 text-center whitespace-nowrap overflow-hidden text-ellipsis" style={{ background: `${c}18`, color: c }}>{cert.status}</div>
                </div>
              );
            })}
          </div>
          <p className="m-0 mt-3 text-[10px] text-muted-foreground italic">
            ESGroww  Assessment provides indicative readiness scores only — not a certification guarantee.
          </p>
        </div>
 
        {/* ── Row 1 Col 3: Category Scores + Emissions ── */}
        <div className={`${glassCardClass} rounded-2xl p-4 sm:p-4.5 flex flex-col min-w-0`} style={glassCardStyle}>
          <p className="m-0 mb-3 text-xs font-bold text-slate-900 uppercase tracking-wider">Category Performance</p>
          <div className="grid grid-cols-2 gap-2 flex-1">
            {[
              { label: "Energy", val: catScores.energy, color: "#f59e0b", icon: "⚡" },
              { label: "Water", val: catScores.water, color: "#3b82f6", icon: "💧" },
              { label: "Waste", val: catScores.waste, color: "#22c55e", icon: "♻️" },
              { label: "Governance", val: catScores.governance, color: "#8b5cf6", icon: "🏛" },
            ].map(c => (
              <div key={c.label} className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-slate-500 font-bold flex-1 truncate mr-1" title={c.label}>{c.icon} {c.label}</span>
                  <span className="text-sm font-black shrink-0" style={{ color: stageColor(c.val) }}>{Math.round(c.val)}</span>
                </div>
                <Bar value={c.val} color={c.color} />
              </div>
            ))}
          </div>
 
          <div className="mt-2.5 border-t border-slate-100 pt-2.5">
            <p className="m-0 mb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Emissions Breakdown</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { label: "Scope 1", val: emis.scope1, color: "#dc2626" },
                { label: "Scope 2", val: emis.scope2, color: "#ea580c" },
                { label: "Scope 3", val: emis.scope3, color: "#ca8a04" },
              ].map(s => (
                <div key={s.label} className="flex-1 rounded-xl p-2 text-center border" style={{ background: `${s.color}10`, borderColor: `${s.color}30` }}>
                  <p className="m-0 text-[10px] font-bold" style={{ color: s.color }}>{s.label}</p>
                  <p className="m-0 mt-0.5 text-base font-black" style={{ color: s.color }}>{data.formattedEmissions?.[s.label.toLowerCase().replace(/\s+/g, '') as "scope1" | "scope2" | "scope3"] ?? formatWithUnit(s.val, UNIT.EMISSIONS_KG)}</p>
                  <p className="m-0 text-[9px] text-muted-foreground">per year</p>
                </div>
              ))}
            </div>
          </div>
        </div>
 
        {/* ── Row 1 Col 4: Annualized KPIs ── */}
        <div className={`${glassCardClass} rounded-2xl p-4 sm:p-4.5 flex flex-col min-w-0`} style={glassCardStyle}>
          <p className="m-0 mb-3 text-xs font-bold text-slate-900 uppercase tracking-wider">Annualized Metrics</p>
          <div className="grid grid-cols-2 gap-2 flex-1">
            {[
              { label: "Electricity", value: data.annualizedValues.electricity ?? 0, formatted: data.formattedAnnualizedValues?.electricity, unit: UNIT.ELECTRICITY, icon: "⚡", color: "#f59e0b" },
              { label: "Water", value: data.annualizedValues.water ?? 0, formatted: data.formattedAnnualizedValues?.water, unit: UNIT.WATER, icon: "💧", color: "#3b82f6" },
              { label: "Fuel / DG", value: data.annualizedValues.fuel ?? 0, formatted: data.formattedAnnualizedValues?.fuel, unit: UNIT.DIESEL, icon: "🛢", color: "#ef4444" },
              { label: "Waste", value: data.annualizedValues.waste ?? 0, formatted: data.formattedAnnualizedValues?.waste, unit: UNIT.WASTE, icon: "♻️", color: "#22c55e" },
            ].map(m => (
              <div key={m.label} className="rounded-xl p-2.5 flex flex-col justify-between border" style={{ background: `${m.color}0a`, borderColor: `${m.color}25` }}>
                <p className="m-0 text-[10px] text-muted-foreground font-bold">{m.icon} {m.label}</p>
                <p className="m-0 mt-1 text-base font-black text-slate-900 leading-none">{m.formatted ?? formatWithUnit(m.value, m.unit)}</p>
                <p className="m-0 mt-1 text-[9px] font-bold" style={{ color: m.color }}>Est. annual</p>
              </div>
            ))}
          </div>
          <div className="mt-2.5 bg-amber-50/50 border border-amber-200 rounded-xl p-2.5">
            <p className="m-0 text-[9px] text-amber-800 font-semibold">ℹ Annualized values estimated from {Math.round(data.completeness / 8.33)} months of uploaded data. Confidence modifier applied.</p>
          </div>
        </div>
 
        {/* ── Row 2 Col 2: Strengths + Gaps ── */}
        <div className={`${glassCardClass} rounded-2xl p-4 sm:p-4.5 flex flex-col overflow-hidden min-w-0`} style={glassCardStyle}>
          <div className="flex flex-col lg:flex-row gap-3 flex-1 min-h-0">
            {/* Strengths */}
            <div className="flex-1 overflow-visible flex flex-col">
              <p className="m-0 mb-2 text-xs font-bold text-emerald-600 uppercase tracking-wider">✓ Strengths</p>
              <div className="flex-1 overflow-visible flex flex-col gap-1.5">
                {(data.strengths ?? []).slice(0, 4).map((s, i) => (
                  <div key={i} className="bg-emerald-50/50 rounded-lg p-2 border border-emerald-150">
                    <p className="m-0 text-xs text-emerald-900 leading-normal">{s}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Gaps */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <p className="m-0 mb-2 text-xs font-bold text-red-600 uppercase tracking-wider">⚠ Critical Gaps</p>
              <div className="flex-1 overflow-hidden flex flex-col gap-1.5">
                {(data.gaps ?? []).slice(0, 4).map((g, i) => (
                  <div key={i} className="rounded-lg p-2 border flex gap-1.5 items-start" style={{ background: `${sevColor[g.severity]}0a`, borderColor: `${sevColor[g.severity]}30` }}>
                    <span className="text-[9px] font-bold text-white rounded px-1.5 py-0.5 shrink-0 mt-0.5" style={{ background: sevColor[g.severity] }}>{g.severity}</span>
                    <p className="m-0 text-xs text-slate-700 leading-normal">{g.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
 
        {/* ── Row 2 Col 3: Regulatory Readiness ── */}
        <div className={`${glassCardClass} rounded-2xl p-4 sm:p-4.5 flex flex-col overflow-hidden min-w-0`} style={glassCardStyle}>
          <p className="m-0 mb-2.5 text-xs font-bold text-slate-900 uppercase tracking-wider">Regulatory Readiness</p>
          <div className="flex-1 flex flex-col gap-2">
            {(data.regulatoryReadiness ?? []).map((reg, i) => (
              <div key={i} className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                <div className="basis-full min-w-0 sm:basis-[120px] sm:flex-[0_0_120px] text-xs font-semibold text-slate-700 break-words sm:truncate">{reg.regulation}</div>
                <div className="flex-1"><Bar value={reg.readiness} color={riskColor[reg.risk]} /></div>
                <div className="flex-[0_0_24px] text-xs font-bold text-slate-955 text-right">{reg.readiness}</div>
                <div className="flex-[0_0_72px] text-[10px] font-bold rounded-md py-0.5 px-1.5 text-center" style={{ background: `${riskColor[reg.risk]}15`, color: riskColor[reg.risk] }}>
                  {reg.risk} Risk
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2.5 border-t border-slate-100 pt-2.5">
            <p className="m-0 mb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Certification Pathway</p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {certEntries
                .sort((a, b) => b.score - a.score)
                .slice(0, 4)
                .map((cert, idx) => (
                  <div key={cert.name} className="flex items-center gap-1">
                    <div className="rounded-lg px-2.5 py-1 text-xs font-bold" style={{ background: `${stageColor(cert.score)}15`, border: `1px solid ${stageColor(cert.score)}40`, color: stageColor(cert.score) }}>
                      {idx + 1}. {formatCertName(cert.name)}
                    </div>
                    {idx < 3 && <span className="text-slate-300 text-xs">→</span>}
                  </div>
                ))}
            </div>
          </div>
        </div>
 
        {/* ── Row 2 Col 4: Priority Action Roadmap ── */}
        <div className={`${glassCardClass} rounded-2xl p-4 sm:p-4.5 flex flex-col overflow-hidden min-w-0`} style={glassCardStyle}>
          <p className="m-0 mb-2.5 text-xs font-bold text-slate-900 uppercase tracking-wider">Priority Action Roadmap</p>
          <div className="flex-1 flex flex-col gap-2 overflow-visible">
            {(data.roadmap ?? []).slice(0, 5).map((r, i) => {
              const tlColors: Record<string, string> = {
                "Immediate": "#dc2626", "0–3 Months": "#ea580c", "3–6 Months": "#ca8a04", "6–12 Months": "#2563eb", "12+ Months": "#7c3aed",
              };
              const c = tlColors[r.timeline] ?? "#64748b";
              return (
                <div key={i} className="flex gap-2 items-start">
                  <div className="flex-[0_0_68px] text-[9px] font-bold rounded border py-1.5 px-1 text-center" style={{ background: `${c}12`, color: c, borderColor: `${c}30` }}>
                    {r.timeline}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="m-0 text-xs font-semibold text-slate-900 leading-snug">{r.action}</p>
                    <p className="m-0 mt-0.5 text-[10px] text-muted-foreground">{r.impact}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-2.5 bg-blue-50/50 border border-blue-200 rounded-xl p-2.5">
            <p className="m-0 text-[10px] text-blue-900 font-semibold leading-relaxed">
              <strong className="font-bold text-blue-900">Executive Summary:</strong> {data.orgName} demonstrates {score >= 75 ? "strong" : score >= 60 ? "moderate" : "foundational"} sustainability fundamentals.
              {certEntries.filter((c) => c.score >= 60).length > 0 ? ` Strong potential for ${certEntries.filter((c) => c.score >= 60).map((c) => formatCertName(c.name)).slice(0, 2).join(" and ")}.` : ""}
              {(data.gaps && data.gaps.length > 0) ? ` Immediate priorities include ${data.gaps.slice(0, 1).map(g => g.text.toLowerCase()).join("")}.` : " Keep up the good work."}
            </p>
          </div>
        </div>
 
        {/* ── Row 3: KPI Dashboard (full width) ── */}
        <div className={`${glassCardClass} rounded-3xl p-4 sm:p-5 md:p-6 flex flex-col gap-4.5 min-w-0 md:col-span-2 lg:col-span-4`} style={glassCardStyle}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="m-0 text-sm font-extrabold text-slate-900 uppercase tracking-wider">KPI Scorecards</p>
              <p className="m-0 mt-0.5 text-xs text-muted-foreground">Benchmarked against {data.sector?.toLowerCase() ?? "healthcare"} industry standards</p>
            </div>
            <div className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg">
              {kpiItems.length} Metrics Analyzed
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3">
            {kpiItems.map((item) => {
              const kpi = item.kpi;
              const isInsufficient = kpi.status === "Insufficient Data";
              const scoreImpactLabel = isInsufficient ? "Data Req" : kpi.scoreImpact === "Full" ? "Optimal" : kpi.scoreImpact === "Partial" ? "Moderate" : "Action Req";
              const scoreImpactColor = isInsufficient ? "#94a3b8" : kpi.scoreImpact === "Full" ? "#10b981" : kpi.scoreImpact === "Partial" ? "#f59e0b" : "#ef4444";
              const statusBg = isInsufficient ? "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)" : kpi.scoreImpact === "Full" ? "linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)" : kpi.scoreImpact === "Partial" ? "linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)" : "linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)";
              const statusBorder = isInsufficient ? "#e2e8f0" : kpi.scoreImpact === "Full" ? "#a7f3d0" : kpi.scoreImpact === "Partial" ? "#fde68a" : "#fecaca";
              
              return (
                <div key={item.title} className="group hover:-translate-y-1 hover:shadow-md transition-all duration-300 border rounded-2xl p-3.5 flex flex-col gap-1.5 relative overflow-hidden cursor-default" style={{ background: statusBg, borderColor: statusBorder }}>
                  <div className="flex items-center justify-between gap-1 z-10">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-sm shrink-0">{item.icon}</span>
                      <p className="m-0 text-[10px] font-bold text-slate-700 line-clamp-2 sm:truncate">{item.title}</p>
                    </div>
                    <span className="text-[9px] font-bold text-white rounded-md px-1.5 py-0.5 shrink-0" style={{ background: scoreImpactColor }}>{scoreImpactLabel}</span>
                  </div>
                  
                  <div className="z-10 mt-1 flex-1">
                    <p className="m-0 text-lg font-black text-slate-900 leading-none">
                      {kpi.value !== null ? `${kpi.value.toFixed(1)}` : "N/A"}
                      {kpi.value !== null && <span className="text-[9px] font-bold text-muted-foreground ml-0.5">{item.unit}</span>}
                    </p>
                    <p className="m-0 mt-1 text-[9px] leading-snug text-slate-600 line-clamp-2">
                      {kpi.status}
                    </p>
                  </div>

                  {/* Decorative background circle */}
                  <div className="transition-transform duration-300 group-hover:scale-110" style={{ position: "absolute", right: -15, top: -15, width: 60, height: 60, borderRadius: "50%", background: `${scoreImpactColor}15`, zIndex: 0 }} />
                </div>
              );
            })}
          </div>
        </div>

      </div>
      </div>
 
      {/* Footer removed per user request */}
    </div>
  );
}
 
 
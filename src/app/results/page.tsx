"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DownloadReportButton } from "@/components/shared/DownloadReportButton";
import { ReportPdfCapture } from "@/components/pdf/ReportPdfCapture";
import { Link2, Mail, Phone } from "lucide-react";
import {
  evaluateEnergyIntensity,
  evaluateWaterIntensity,
  evaluateRecyclingRate,
  evaluateRenewableEnergy,
  evaluatePowerFactor,
  evaluateDGDependency,
  evaluateWaterReuse,
  evaluateTankerWaterDependency,
  evaluateWasteSegregation,
} from "@/lib/kpiUtils";

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

  const kpiItems = [
    { title: "Energy Intensity",    kpi: evaluateEnergyIntensity(annEl  > 0 && sqft > 0 ? annEl / sqft : null),   unit: "kWh/sqft/yr", icon: "⚡" },
    { title: "Water Intensity",     kpi: evaluateWaterIntensity(annWa   > 0 && sqft > 0 ? annWa / sqft : null),   unit: "KL/sqft/yr", icon: "💧" },
    { title: "Renewable Energy",    kpi: evaluateRenewableEnergy(renPct),     unit: "%", icon: "☀️" },
    { title: "Water Reuse",         kpi: evaluateWaterReuse(wRePct),          unit: "%", icon: "🔄" },
    { title: "Recycling Rate",      kpi: evaluateRecyclingRate(wsePct),       unit: "%", icon: "♻️" },
    { title: "Waste Segregation",   kpi: evaluateWasteSegregation(wsePct),    unit: "%", icon: "🗑️" },
    { title: "Tanker Dependency",   kpi: evaluateTankerWaterDependency(0),    unit: "%", icon: "🚛" },
    { title: "Power Factor",        kpi: evaluatePowerFactor(0.85),           unit: "", icon: "🔌" },
    { title: "DG Dependency",       kpi: evaluateDGDependency(0),             unit: "%", icon: "🛢️" },
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
    <div style={{
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      background: "linear-gradient(180deg, #f8fafc 0%, #ecfdf5 100%)",
      minHeight: "100vh",
      width: "100%",
      overflowY: "auto",
      overflowX: "hidden",
      display: "flex",
      flexDirection: "column",
      padding: "10px 14px 20px",
      boxSizing: "border-box",
      opacity: loaded ? 1 : 0,
      transition: "opacity 0.4s ease",
    }}>
      <ReportPdfCapture data={data} />
      <div
        id="results-report-capture"
        style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, width: "100%", maxWidth: "100%" }}
      >
      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 7, height: 28, background: color, borderRadius: 4 }} />
            <div>
              <h1 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.3px" }}>
                ESG Intelligence Dashboard
              </h1>
              <p style={{ margin: 0, fontSize: 10, color: "#94a3b8", marginTop: 1 }}>
                {data.orgName ?? "Organization"} · {data.sector ?? "Healthcare"} · Assessment Reference
              </p>
            </div>
          </div>
        </div>
        <div data-html2canvas-ignore="true" style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <DownloadReportButton
            data={data}
            captureRootId="pdf-report-capture"
            label={loaded ? "Download Report" : "Loading report..."}
            className="min-w-[140px] bg-slate-900 text-white hover:bg-slate-800"
            disabled={!loaded}
          />
          <Button
            variant="outline"
            className="min-w-[140px] border-slate-200 text-slate-700 hover:bg-slate-100"
            onClick={() => setConsultationOpen((prev) => !prev)}
          >
            Book Consultation
          </Button>
        </div>
      </div>
 
      {consultationOpen && (
        <div style={{ marginBottom: 8, borderRadius: 14, background: "#ffffff", border: "1px solid #e2e8f0", padding: 16, boxShadow: "0 8px 30px rgba(15, 23, 42, 0.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
            <div>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Consultation Request
              </p>
              <h2 style={{ margin: "8px 0 0", fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
                Book your ESG consultation with SAM Corporate
              </h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setConsultationOpen(false)}>
              Close
            </Button>
          </div>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: "#475569" }}>
            Get a personalized review of your ESG assessment, customized action plans, and expert guidance to accelerate sustainability readiness. Share your details and we will connect you with our specialist team.
          </p>
          <div style={{ display: "grid", gap: 8, marginTop: 16, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            <div style={{ padding: 14, borderRadius: 14, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#0f172a" }}>Email</p>
              <p style={{ margin: "8px 0 0", fontSize: 14, color: "#475569" }}><Mail className="inline-block" style={{ marginRight: 8, verticalAlign: "middle" }} /> hello@samcorporate.com</p>
            </div>
            <div style={{ padding: 14, borderRadius: 14, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#0f172a" }}>Phone</p>
              <p style={{ margin: "8px 0 0", fontSize: 14, color: "#475569" }}><Phone className="inline-block" style={{ marginRight: 8, verticalAlign: "middle" }} /> +91 22 1234 5678</p>
            </div>
            <div style={{ padding: 14, borderRadius: 14, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#0f172a" }}>Connect</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                <a href="https://www.linkedin.com/company/sam-corporate/posts/?feedView=all" target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 10px", borderRadius: 10, background: "#eef2ff", color: "#4338ca", textDecoration: "none", fontSize: 13 }}><Link2 size={16} /> LinkedIn</a>
                <a href="https://www.facebook.com/samcorporate/" target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 10px", borderRadius: 10, background: "#f8fafc", color: "#1f2937", textDecoration: "none", fontSize: 13 }}><Link2 size={16} /> Facebook</a>
                <a href="https://x.com/SamCorporate" target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 10px", borderRadius: 10, background: "#f8fafc", color: "#0f172a", textDecoration: "none", fontSize: 13 }}><Link2 size={16} /> X</a>
                <a href="https://www.instagram.com/samcorporate/" target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 10px", borderRadius: 10, background: "#fff7ed", color: "#c2410c", textDecoration: "none", fontSize: 13 }}><Link2 size={16} /> Instagram</a>
                <a href="https://www.youtube.com/channel/UCPSzEWs8GN8RIG5lzHbjCAg" target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 10px", borderRadius: 10, background: "#f8fafc", color: "#dc2626", textDecoration: "none", fontSize: 13 }}><Link2 size={16} /> YouTube</a>
              </div>
            </div>
          </div>
        </div>
      )}
 
      {/* ── Main grid ── */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "minmax(220px, 240px) minmax(140px, 1fr) minmax(140px, 1fr) minmax(140px, 1fr)", gridAutoRows: "minmax(220px, auto)", gridTemplateRows: "minmax(240px, auto) minmax(240px, auto) auto", gap: 14, minHeight: 0 }}>
 
        {/* ── Col 1: Overall Hero (spans 2 rows) ── */}
        <div className={glassCardClass} style={{ ...glassCardStyle, gridRow: "1 / 3", borderRadius: 16, padding: "18px 16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ textAlign: "center", width: "100%" }}>
            <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>Overall Readiness</p>
            <div style={{ margin: "6px auto 0" }}>
              <Gauge value={score} size={120} />
            </div>
            <div style={{ marginTop: 4, fontSize: 11, fontWeight: 800, color }}>
              {stageLabel(score)}
            </div>
            <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 2 }}>{data.readinessStage}</div>
          </div>
 
          <div style={{ width: "100%", marginTop: 8 }}>
            <Radar scores={radarData} />
          </div>
 
          <div style={{ width: "100%", marginTop: 4 }}>
            {[
              { label: "Completeness", val: Math.round(data.completeness), col: "#3b82f6" },
              { label: "Confidence", val: Math.round(data.confidence * 100), col: "#8b5cf6" },
            ].map(m => (
              <div key={m.label} style={{ marginBottom: 7 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#64748b", marginBottom: 2 }}>
                  <span>{m.label}</span><span style={{ fontWeight: 700 }}>{m.val}%</span>
                </div>
                <Bar value={m.val} color={m.col} />
              </div>
            ))}
            <div style={{ background: "#f8fafc", borderRadius: 8, padding: "7px 8px", marginTop: 6, border: "1px solid #e2e8f0" }}>
              <p style={{ margin: 0, fontSize: 8, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>Total Emissions</p>
              <p style={{ margin: "2px 0 0", fontSize: 16, fontWeight: 800, color: "#0f172a" }}>{data.totalEmissions.toFixed(1)}</p>
              <p style={{ margin: 0, fontSize: 8, color: "#94a3b8" }}>tCO₂e / year</p>
            </div>
          </div>
        </div>
 
        {/* ── Row 1 Col 2: Certification Readiness ── */}
        <div className={glassCardClass} style={{ ...glassCardStyle, borderRadius: 16, padding: "14px 16px", overflow: "visible", display: "flex", flexDirection: "column" }}>
          <p style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: 0.8 }}>Certification Readiness</p>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5, overflow: "visible" }}>
            {certEntries.map((cert) => {
              const s = cert.score;
              const c = stageColor(s);
              return (
                <div key={cert.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: "0 0 90px", fontSize: 10, fontWeight: 600, color: "#334155", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{formatCertName(cert.name)}</div>
                  <div style={{ flex: 1 }}><Bar value={s} color={c} /></div>
                  <div style={{ flex: "0 0 24px", fontSize: 10, fontWeight: 700, color: c, textAlign: "right" }}>{s}</div>
                  <div style={{ flex: "0 0 68px", background: `${c}18`, color: c, fontSize: 8, fontWeight: 700, borderRadius: 4, padding: "2px 5px", textAlign: "center" }}>{cert.status}</div>
                </div>
              );
            })}
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 8, color: "#cbd5e1", fontStyle: "italic" }}>
            SAM Assessment provides indicative readiness scores only — not a certification guarantee.
          </p>
        </div>
 
        {/* ── Row 1 Col 3: Category Scores + Emissions ── */}
        <div className={glassCardClass} style={{ ...glassCardStyle, borderRadius: 16, padding: "14px 16px", display: "flex", flexDirection: "column" }}>
          <p style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: 0.8 }}>Category Performance</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, flex: 1 }}>
            {[
              { label: "Energy", val: catScores.energy, color: "#f59e0b", icon: "⚡" },
              { label: "Water", val: catScores.water, color: "#3b82f6", icon: "💧" },
              { label: "Waste", val: catScores.waste, color: "#22c55e", icon: "♻️" },
              { label: "Governance", val: catScores.governance, color: "#8b5cf6", icon: "🏛" },
            ].map(c => (
              <div key={c.label} style={{ background: "#f8fafc", borderRadius: 8, padding: "8px 10px", border: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 9, color: "#64748b", fontWeight: 600 }}>{c.icon} {c.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: stageColor(c.val) }}>{Math.round(c.val)}</span>
                </div>
                <Bar value={c.val} color={c.color} />
              </div>
            ))}
          </div>
 
          <div style={{ marginTop: 8, borderTop: "1px solid #f1f5f9", paddingTop: 8 }}>
            <p style={{ margin: "0 0 6px", fontSize: 9, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Emissions Breakdown</p>
            <div style={{ display: "flex", gap: 6 }}>
              {[
                { label: "Scope 1", val: emis.scope1, color: "#dc2626" },
                { label: "Scope 2", val: emis.scope2, color: "#ea580c" },
                { label: "Scope 3", val: emis.scope3, color: "#ca8a04" },
              ].map(s => (
                <div key={s.label} style={{ flex: 1, background: `${s.color}10`, borderRadius: 8, padding: "6px 8px", border: `1px solid ${s.color}30`, textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: 8, color: s.color, fontWeight: 700 }}>{s.label}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 800, color: s.color }}>{s.val.toFixed(1)}</p>
                  <p style={{ margin: 0, fontSize: 7, color: "#94a3b8" }}>tCO₂e</p>
                </div>
              ))}
            </div>
          </div>
        </div>
 
        {/* ── Row 1 Col 4: Annualized KPIs ── */}
        <div className={glassCardClass} style={{ ...glassCardStyle, borderRadius: 16, padding: "14px 16px", display: "flex", flexDirection: "column" }}>
          <p style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: 0.8 }}>Annualized Metrics</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, flex: 1 }}>
            {[
              { label: "Electricity", val: Math.round(data.annualizedValues.electricity).toLocaleString(), unit: "kWh", icon: "⚡", color: "#f59e0b" },
              { label: "Water", val: Math.round(data.annualizedValues.water).toLocaleString(), unit: "KL", icon: "💧", color: "#3b82f6" },
              { label: "Fuel / DG", val: Math.round(data.annualizedValues.fuel).toLocaleString(), unit: "Litres", icon: "🛢", color: "#ef4444" },
              { label: "Waste", val: Math.round(data.annualizedValues.waste).toLocaleString(), unit: "kg", icon: "♻️", color: "#22c55e" },
            ].map(m => (
              <div key={m.label} style={{ background: `${m.color}0a`, borderRadius: 8, padding: "8px 10px", border: `1px solid ${m.color}25` }}>
                <p style={{ margin: 0, fontSize: 9, color: "#94a3b8", fontWeight: 600 }}>{m.icon} {m.label}</p>
                <p style={{ margin: "3px 0 0", fontSize: 15, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{m.val}</p>
                <p style={{ margin: "2px 0 0", fontSize: 8, color: m.color, fontWeight: 600 }}>Est. annual {m.unit}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, background: "#fef9ec", border: "1px solid #fde68a", borderRadius: 8, padding: "6px 10px" }}>
            <p style={{ margin: 0, fontSize: 8, color: "#92400e", fontWeight: 600 }}>ℹ Annualized values estimated from {Math.round(data.completeness / 8.33)} months of uploaded data. Confidence modifier applied.</p>
          </div>
        </div>
 
        {/* ── Row 2 Col 2: Strengths + Gaps ── */}
        <div className={glassCardClass} style={{ ...glassCardStyle, borderRadius: 16, padding: "14px 16px", display: "flex", flexDirection: "column", overflow: "visible" }}>
          <div style={{ display: "flex", gap: 12, flex: 1, minHeight: 0 }}>
            {/* Strengths */}
            <div style={{ flex: 1, overflow: "visible", display: "flex", flexDirection: "column" }}>
              <p style={{ margin: "0 0 7px", fontSize: 10, fontWeight: 700, color: "#16a34a", textTransform: "uppercase", letterSpacing: 0.8 }}>✓ Strengths</p>
              <div style={{ flex: 1, overflow: "visible", display: "flex", flexDirection: "column", gap: 4 }}>
                {(data.strengths ?? []).slice(0, 4).map((s, i) => (
                  <div key={i} style={{ background: "#f0fdf4", borderRadius: 6, padding: "5px 8px", border: "1px solid #bbf7d0" }}>
                    <p style={{ margin: 0, fontSize: 9, color: "#166534", lineHeight: 1.3 }}>{s}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Gaps */}
            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <p style={{ margin: "0 0 7px", fontSize: 10, fontWeight: 700, color: "#dc2626", textTransform: "uppercase", letterSpacing: 0.8 }}>⚠ Critical Gaps</p>
              <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", gap: 4 }}>
                {(data.gaps ?? []).slice(0, 4).map((g, i) => (
                  <div key={i} style={{ background: `${sevColor[g.severity]}0a`, borderRadius: 6, padding: "5px 8px", border: `1px solid ${sevColor[g.severity]}30`, display: "flex", gap: 6, alignItems: "flex-start" }}>
                    <span style={{ background: sevColor[g.severity], color: "#fff", fontSize: 7, fontWeight: 700, borderRadius: 3, padding: "1px 4px", flexShrink: 0, marginTop: 1 }}>{g.severity}</span>
                    <p style={{ margin: 0, fontSize: 9, color: "#334155", lineHeight: 1.3 }}>{g.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
 
        {/* ── Row 2 Col 3: Regulatory Readiness ── */}
        <div className={glassCardClass} style={{ ...glassCardStyle, borderRadius: 16, padding: "14px 16px", display: "flex", flexDirection: "column", overflow: "visible" }}>
          <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: 0.8 }}>Regulatory Readiness</p>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
            {(data.regulatoryReadiness ?? []).map((reg, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: "0 0 120px", fontSize: 10, fontWeight: 600, color: "#334155", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{reg.regulation}</div>
                <div style={{ flex: 1 }}><Bar value={reg.readiness} color={riskColor[reg.risk]} /></div>
                <div style={{ flex: "0 0 24px", fontSize: 10, fontWeight: 700, color: "#0f172a", textAlign: "right" }}>{reg.readiness}</div>
                <div style={{ flex: "0 0 72px", background: `${riskColor[reg.risk]}15`, color: riskColor[reg.risk], fontSize: 8, fontWeight: 700, borderRadius: 4, padding: "2px 5px", textAlign: "center" }}>
                  {reg.risk} Risk
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, borderTop: "1px solid #f1f5f9", paddingTop: 8 }}>
            <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>Certification Pathway</p>
            <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
              {certEntries
                .sort((a, b) => b.score - a.score)
                .slice(0, 4)
                .map((cert, idx) => (
                  <div key={cert.name} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ background: `${stageColor(cert.score)}15`, border: `1px solid ${stageColor(cert.score)}40`, borderRadius: 6, padding: "3px 7px", fontSize: 9, fontWeight: 700, color: stageColor(cert.score) }}>
                      {idx + 1}. {formatCertName(cert.name)}
                    </div>
                    {idx < 3 && <span style={{ color: "#cbd5e1", fontSize: 10 }}>→</span>}
                  </div>
                ))}
            </div>
          </div>
        </div>
 
        {/* ── Row 2 Col 4: Priority Action Roadmap ── */}
        <div className={glassCardClass} style={{ ...glassCardStyle, borderRadius: 16, padding: "14px 16px", display: "flex", flexDirection: "column", overflow: "visible" }}>
          <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: 0.8 }}>Priority Action Roadmap</p>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5, overflow: "visible" }}>
            {(data.roadmap ?? []).slice(0, 5).map((r, i) => {
              const tlColors: Record<string, string> = {
                "Immediate": "#dc2626", "0–3 Months": "#ea580c", "3–6 Months": "#ca8a04", "6–12 Months": "#2563eb", "12+ Months": "#7c3aed",
              };
              const c = tlColors[r.timeline] ?? "#64748b";
              return (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <div style={{ flex: "0 0 68px", background: `${c}12`, color: c, fontSize: 8, fontWeight: 700, borderRadius: 4, padding: "3px 5px", textAlign: "center", border: `1px solid ${c}30` }}>
                    {r.timeline}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: "#0f172a", lineHeight: 1.3 }}>{r.action}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 8, color: "#94a3b8" }}>{r.impact}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 8, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "7px 10px" }}>
            <p style={{ margin: 0, fontSize: 8, color: "#1e40af", fontWeight: 600, lineHeight: 1.4 }}>
              <strong>Executive Summary:</strong> {data.orgName} demonstrates {score >= 75 ? "strong" : score >= 60 ? "moderate" : "foundational"} sustainability fundamentals. Strong potential for {certEntries.filter((c) => c.score >= 60).map((c) => c.name).slice(0, 2).join(", ")}. Priority: renewable energy integration and governance formalization.
            </p>
          </div>
        </div>
 
        {/* ── Row 3: KPI Dashboard (full width) ── */}
        <div className={glassCardClass} style={{ ...glassCardStyle, gridColumn: "1 / -1", borderRadius: 20, border: "1px solid rgba(255,255,255,0.45)", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: 0.8 }}>KPI Scorecards</p>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "#64748b" }}>Benchmarked against healthcare industry standards</p>
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#3b82f6", background: "#eff6ff", padding: "5px 12px", borderRadius: 6 }}>
              {kpiItems.length} Metrics Analyzed
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
            {kpiItems.map((item) => {
              const kpi = item.kpi;
              const isInsufficient = kpi.status === "Insufficient Data";
              const scoreImpactLabel = isInsufficient ? "Data Req" : kpi.scoreImpact === "Full" ? "Optimal" : kpi.scoreImpact === "Partial" ? "Moderate" : "Action Req";
              const scoreImpactColor = isInsufficient ? "#94a3b8" : kpi.scoreImpact === "Full" ? "#10b981" : kpi.scoreImpact === "Partial" ? "#f59e0b" : "#ef4444";
              const statusBg = isInsufficient ? "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)" : kpi.scoreImpact === "Full" ? "linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)" : kpi.scoreImpact === "Partial" ? "linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)" : "linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)";
              const statusBorder = isInsufficient ? "#e2e8f0" : kpi.scoreImpact === "Full" ? "#a7f3d0" : kpi.scoreImpact === "Partial" ? "#fde68a" : "#fecaca";
              
              return (
                <div key={item.title} className="group hover:-translate-y-1 hover:shadow-md transition-all duration-300" style={{ background: statusBg, border: `1px solid ${statusBorder}`, borderRadius: 12, padding: "14px", display: "flex", flexDirection: "column", gap: 6, position: "relative", overflow: "hidden", cursor: "default" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4, zIndex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 14 }}>{item.icon}</span>
                      <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#334155", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</p>
                    </div>
                    <span style={{ background: scoreImpactColor, color: "#fff", fontSize: 8, fontWeight: 700, borderRadius: 4, padding: "2px 6px", flexShrink: 0 }}>{scoreImpactLabel}</span>
                  </div>
                  
                  <div style={{ zIndex: 1, marginTop: 4 }}>
                    <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
                      {kpi.value !== null ? `${kpi.value.toFixed(1)}` : "N/A"}
                      {kpi.value !== null && <span style={{ fontSize: 10, fontWeight: 600, color: "#64748b", marginLeft: 3 }}>{item.unit}</span>}
                    </p>
                    <p style={{ margin: "4px 0 0", fontSize: 9, color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>{kpi.status}</p>
                  </div>
                  
                  <div style={{ height: 4, background: "#e2e8f0", borderRadius: 2, overflow: "hidden", marginTop: "auto", zIndex: 1 }}>
                    <div style={{ height: "100%", background: scoreImpactColor, borderRadius: 2, width: isInsufficient ? "0%" : kpi.scoreImpact === "Full" ? "100%" : kpi.scoreImpact === "Partial" ? "50%" : "15%", transition: "width 1s ease-out" }} />
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
 
 
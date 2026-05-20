"use client";

import {
  X, Building2, Users, Bed, Clock3, Layers3, MapPin,
  Activity, ShieldCheck, FileBarChart2, Upload, Leaf,
  Pencil, Save, CheckCircle2, AlertTriangle, TrendingUp, CalendarDays,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getWhereIStandData } from "@/actions/whereIStand.action";
import { updateHospitalProfile } from "@/actions/updateHospitalProfile.actions";
import { Card as BaseCard } from "@/components/ui/card";
import BentoGrid from "@/components/shared/BentoGrid";

const BRAND = {
  bg: "#FBFBF3",
  primary: "#00673F",
  secondary: "#004958",
  tertiary: "#004D7C",
  border: "#d1d1c4",
  cardBg: "#F7F7EF",
};

/* ─── EDIT PROFILE MODAL ─── */
function EditProfileModal({ open, data, onClose, onSaved }: {
  open: boolean; data: any; onClose: () => void; onSaved: (u: any) => void;
}) {
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (open && data?.organization) {
      setForm({ ...data.organization });
      setSaveSuccess(false);
    }
  }, [open, data]);

  const fields = [
    { label: "Hospital Name", key: "hospitalName", icon: Building2, type: "text", span: 2 },
    { label: "Industry", key: "industry", icon: Activity, type: "text", span: 2 },
    { label: "Country", key: "country", icon: MapPin, type: "text", span: 1 },
    { label: "State", key: "state", icon: MapPin, type: "text", span: 1 },
    { label: "Built-up Area (sqft)", key: "builtUpArea", icon: Layers3, type: "number", span: 1 },
    { label: "Number of Beds", key: "numberOfBeds", icon: Bed, type: "number", span: 1 },
    { label: "Employees (FTE)", key: "numberOfEmployees", icon: Users, type: "number", span: 1 },
    { label: "Avg Daily Occupancy %", key: "averageDailyOccupancy", icon: TrendingUp, type: "number", span: 1 },
    { label: "Operating Hours / Day", key: "operatingHours", icon: Clock3, type: "number", span: 1 },
    { label: "Number of Floors", key: "numberOfFloors", icon: Layers3, type: "number", span: 1 },
    { label: "Year Established", key: "yearEstablished", icon: ShieldCheck, type: "number", span: 2 },
  ];

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateHospitalProfile({
        hospitalName: form.hospitalName,
        industry: form.industry,
        country: form.country,
        state: form.state,
        builtUpArea: Number(form.builtUpArea),
        numberOfBeds: Number(form.numberOfBeds),
        numberOfEmployees: Number(form.numberOfEmployees),
        averageDailyOccupancy: Number(form.averageDailyOccupancy),
        operatingHours: Number(form.operatingHours),
        numberOfFloors: Number(form.numberOfFloors),
        yearEstablished: Number(form.yearEstablished),
      });
      setSaveSuccess(true);
      onSaved(form);
      setTimeout(() => { setSaveSuccess(false); onClose(); }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.38)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl border shadow-2xl flex flex-col"
        style={{ background: BRAND.bg, borderColor: BRAND.border, maxHeight: "88vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b shrink-0" style={{ borderColor: BRAND.border }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${BRAND.primary}12`, color: BRAND.primary }}>
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: BRAND.primary }}>Organization Profile</p>
              <h2 className="text-xl font-black text-slate-900 leading-tight">Edit Details</h2>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-2xl flex items-center justify-center hover:opacity-70" style={{ background: `${BRAND.primary}10`, color: BRAND.primary }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-7 py-6">
          <div className="grid grid-cols-2 gap-4">
            {fields.map((field) => {
              const Icon = field.icon;
              return (
                <div key={field.key} className={field.span === 2 ? "col-span-2" : "col-span-1"}>
                  <label className="flex items-center gap-1.5 mb-2">
                    <Icon className="w-3.5 h-3.5" style={{ color: BRAND.primary }} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{field.label}</span>
                  </label>
                  <input
                    type={field.type}
                    value={String(form[field.key] ?? "")}
                    onChange={(e) => setForm((p: any) => ({ ...p, [field.key]: e.target.value }))}
                    className="w-full h-11 rounded-2xl border px-4 text-sm font-semibold text-slate-800 outline-none bg-white transition-all"
                    style={{ borderColor: BRAND.border }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = BRAND.primary; e.currentTarget.style.boxShadow = `0 0 0 3px ${BRAND.primary}18`; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = BRAND.border; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-7 py-5 border-t shrink-0" style={{ borderColor: BRAND.border }}>
          <p className="text-xs text-slate-400">Changes are saved directly to your organization record.</p>
          <div className="flex items-center gap-3">
            {saveSuccess && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold" style={{ background: `${BRAND.primary}12`, color: BRAND.primary }}>
                <CheckCircle2 className="w-4 h-4" /> Saved!
              </div>
            )}
            <button onClick={onClose} className="px-5 h-10 rounded-2xl text-sm font-semibold border hover:opacity-70" style={{ borderColor: BRAND.border, color: "#64748b" }}>
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || saveSuccess}
              className="px-6 h-10 rounded-2xl text-sm text-white font-semibold flex items-center gap-2 disabled:opacity-60 hover:opacity-80"
              style={{ background: BRAND.primary }}
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving…" : saveSuccess ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── PAGE ─── */
export default function WhereIStandPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [timelineExpanded, setTimelineExpanded] = useState(false);

  useEffect(() => {
    getWhereIStandData()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Periodic refetch so readiness (and other computed values) stay updated dynamically
  useEffect(() => {
    const id = setInterval(() => {
      getWhereIStandData()
        .then((fresh) => {
          if (fresh) setData(fresh);
        })
        .catch(console.error);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  const handleProfileSaved = (updatedOrg: any) => {
    setData((prev: any) => ({ ...prev, organization: { ...prev.organization, ...updatedOrg } }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BRAND.bg }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full border-[3px] animate-spin" style={{ borderColor: `${BRAND.primary}30`, borderTopColor: BRAND.primary }} />
          <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: BRAND.primary }}>Loading ESG Command Center</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <>
      <EditProfileModal open={editModalOpen} data={data} onClose={() => setEditModalOpen(false)} onSaved={handleProfileSaved} />

      <div className="w-full overflow-x-hidden" style={{ background: BRAND.bg }}>
        <div className="flex flex-col p-3 gap-3">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 rounded-2xl border shrink-0" style={{ borderColor: BRAND.border, background: BRAND.bg }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${BRAND.primary}15` }}>
                <Leaf className="w-4 h-4" style={{ color: BRAND.primary }} />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.22em]" style={{ color: BRAND.primary }}>ESG Command Center</p>
                <h1 className="text-lg font-black text-slate-900 leading-tight">Where I Stand</h1>
              </div>
              <div className="h-7 w-px mx-1" style={{ background: BRAND.border }} />
              <p className="text-xs text-slate-400 hidden lg:block">ESG readiness · upload maturity · certifications · organization profile</p>
            </div>
            <button onClick={() => router.back()} className="w-9 h-9 rounded-xl flex items-center justify-center hover:opacity-70" style={{ background: `${BRAND.primary}10`, color: BRAND.primary }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Bento Grid */}
          <BentoGrid
            left={
              <div className="flex flex-col gap-3 min-h-0">

              {/* Organization */}
              <Card className="shrink-0">
                <div className="flex items-start justify-between mb-4">
                  <SectionTitle icon={Building2} title="Organization" />
                  <div className="flex items-center gap-2">
                    <StatusPill label={data.organization?.accountStatus || "Active"} color="#16a34a" />
                    <button
                      onClick={() => setEditModalOpen(true)}
                      title="Edit organization profile"
                      className="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-80 shrink-0"
                      style={{ background: `${BRAND.primary}12`, color: BRAND.primary }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">Hospital</p>
                  <h2 className="text-base font-black text-slate-900 leading-snug">{data.organization?.hospitalName || "—"}</h2>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <MiniInfo label="Industry" value={data.organization?.industry} />
                  <MiniInfo label="Sector" value={data.organization?.sectorCode} />
                  <MiniInfo label="Country" value={data.organization?.country} />
                  <MiniInfo label="State" value={data.organization?.state} />
                  <MiniInfo label="Beds" value={data.organization?.numberOfBeds} />
                  <MiniInfo label="Employees" value={data.organization?.numberOfEmployees} />
                  <MiniInfo label="Floors" value={data.organization?.numberOfFloors} />
                  <MiniInfo label="Est." value={data.organization?.yearEstablished} />
                </div>

                <button
                  onClick={() => setEditModalOpen(true)}
                  className="mt-4 w-full h-9 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 hover:opacity-80 transition-opacity"
                  style={{ borderColor: `${BRAND.primary}30`, color: BRAND.primary, background: `${BRAND.primary}06` }}
                >
                  <Pencil className="w-3 h-3" /> Edit Organization Profile
                </button>
              </Card>

              {/* Current Status */}
              <Card className="flex flex-col overflow-y-auto max-h-[36rem]">
                <SectionTitle icon={Activity} title="Current Status" />
                <div className="mt-4 space-y-2">
                  {data.currentStatus?.length > 0 ? data.currentStatus.map((item: any, idx: number) => {
                    const isSuccess = item.type === "success";
                    const color = isSuccess ? "#16a34a" : item.type === "warning" ? "#ca8a04" : "#dc2626";
                    const Icon = isSuccess ? CheckCircle2 : AlertTriangle;
                    return (
                      <div key={idx} className="rounded-2xl border p-3 flex gap-2.5 items-start" style={{ borderColor: `${color}20`, background: `${color}07` }}>
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${color}15`, color }}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <p className="text-xs font-medium text-slate-700 leading-relaxed">{item.message}</p>
                      </div>
                    );
                  }) : <p className="text-xs text-slate-400 text-center mt-8">No signals yet. Upload data to begin.</p>}
                </div>
              </Card>
              </div>
            }
            center={
              <div className="flex flex-col gap-3 min-h-0">

              {/* Readiness + Certifications row */}
              <div className="grid grid-cols-2 gap-3 shrink-0">
                <Card>
                  <SectionTitle icon={ShieldCheck} title="Readiness" />
                  <div className="mt-4 flex items-center gap-4">
                    <CircularProgress value={Math.round(data.readiness?.overall || 0)} />
                    <div className="flex-1 space-y-3">
                      <MetricBar label="Profile" value={data.profileCompletion} color={BRAND.primary} />
                      <MetricBar label="Uploads" value={data.uploadCompletion} color={BRAND.secondary} />
                      <MetricBar label={`Confidence (${data.readiness?.confidenceLabel || "Low"})`} value={data.readiness?.confidence || 0} color={BRAND.tertiary} />
                    </div>
                  </div>
                </Card>

                <Card className="flex flex-col">
                  <SectionTitle icon={FileBarChart2} title="Certifications" />
                  <div className="mt-4 space-y-4">
                    {data.certifications?.map((cert: any) => (
                      <div key={cert.name}>
                        <div className="flex justify-between items-center mb-1.5">
                          <p className="text-xs font-bold text-slate-800">{cert.name}</p>
                          <p className="text-xs font-black" style={{ color: cert.readiness >= 75 ? "#16a34a" : cert.readiness >= 50 ? "#ca8a04" : "#dc2626" }}>{cert.readiness}%</p>
                        </div>
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${cert.readiness}%`, background: cert.readiness >= 75 ? "#16a34a" : cert.readiness >= 50 ? "#ca8a04" : "#dc2626" }} />
                        </div>
                        <div className="flex justify-between mt-1">
                          <p className="text-[10px] text-slate-500">{cert.status}</p>
                          {cert.timeline && <p className="text-[10px] text-slate-400">{cert.timeline}</p>}
                        </div>
                        {cert.gap && <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{cert.gap}</p>}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Upload Readiness — fills remaining */}
              <Card className="flex flex-col overflow-y-auto max-h-[36rem]">
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <SectionTitle icon={Upload} title="Upload Readiness" />
                  <StatusPill label="1M Upload · 3M Ann · 6M ESG · 12M Max" color={BRAND.primary} />
                </div>
                <div>
                  <div className="grid grid-cols-2 gap-3">
                    {data.uploadReadiness?.map((upload: any) => {
                      const pct = Math.min((upload.uploaded / upload.recommended) * 100, 100);
                      const stageLabel = upload.uploaded < 1 ? "Not started" : upload.uploaded < 3 ? "Uploads active · Annualization locked" : upload.uploaded < 6 ? "Annualization active · ESG locked" : upload.uploaded < 12 ? "ESG scoring active · Confidence improving" : "Maximum confidence achieved";
                      const stageColor = upload.uploaded >= 12 ? "#16a34a" : upload.uploaded >= 6 ? BRAND.primary : upload.uploaded >= 3 ? BRAND.tertiary : "#94a3b8";
                      return (
                        <div key={upload.category} className="rounded-2xl border p-3" style={{ borderColor: BRAND.border, background: `${BRAND.primary}04` }}>
                          <div className="flex justify-between items-center">
                            <p className="text-xs font-bold text-slate-800">{upload.category}</p>
                            <p className="text-xs font-black text-slate-500">{upload.uploaded}/{upload.recommended}</p>
                          </div>
                          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mt-2">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: stageColor }} />
                          </div>
                          <p className="text-[10px] mt-2 leading-relaxed font-medium" style={{ color: stageColor }}>{stageLabel}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
              </div>
            }
            right={
              <div className="flex flex-col gap-3 min-h-0">

              {/* Roadmap */}
              <Card className="flex flex-col">
                <SectionTitle icon={TrendingUp} title="Roadmap" />
                <div className="mt-2 space-y-2">
                  {data.roadmap?.length > 0 ? data.roadmap.map((action: any, idx: number) => {
                    const pColor = action.priority === "Critical" ? "#dc2626" : action.priority === "High" ? "#ca8a04" : "#2563eb";
                    return (
                      <div key={idx} className="rounded-2xl border p-3 flex gap-3" style={{ borderColor: BRAND.border, background: BRAND.cardBg }}>
                        <div className="w-6 h-6 rounded-xl flex items-center justify-center shrink-0 text-[10px] font-black mt-0.5" style={{ background: `${BRAND.primary}12`, color: BRAND.primary }}>{idx + 1}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 leading-relaxed">{action.action}</p>
                          <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{action.impact}</p>
                          <div className="inline-flex mt-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest" style={{ background: `${pColor}12`, color: pColor }}>{action.priority}</div>
                        </div>
                      </div>
                    );
                  }) : <p className="text-xs text-slate-400 text-center mt-8">No roadmap actions. Great ESG hygiene!</p>}
                </div>
              </Card>

              {/* Timeline */}
              <Card className="flex flex-col">
                <SectionTitle icon={CalendarDays} title="Upload Timeline" />
                <div className="mt-2">
                  {data.timeline?.length > 0 ? (
                    <div>
                      <div className="relative pl-5">
                        <div className="absolute left-[7px] top-2 bottom-2 w-px" style={{ background: BRAND.border }} />
                        <div className="space-y-4">
                          {(timelineExpanded ? data.timeline : (data.timeline || []).slice(0, 4)).map((item: any, idx: number) => (
                            <div key={idx} className="flex gap-3 items-start relative">
                              <div className="absolute -left-5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 z-10" style={{ background: BRAND.primary, boxShadow: `0 0 0 3px ${BRAND.bg}` }}>
                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                              </div>
                              <div className="flex-1 pb-1">
                                <p className="text-xs font-semibold text-slate-800 leading-snug">{item.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full" style={{ background: `${BRAND.primary}12`, color: BRAND.primary }}>{item.category}</span>
                                  <span className="text-[10px] text-slate-400">{new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* View more / collapse toggle */}
                      {data.timeline.length > 4 && (
                        <div className="mt-2 flex justify-center">
                          <button
                            onClick={() => setTimelineExpanded((s) => !s)}
                            className="text-[12px] font-semibold text-slate-700 px-3 py-1 rounded-full border hover:opacity-90"
                            style={{ borderColor: BRAND.border, background: `${BRAND.primary}04` }}
                          >
                            {timelineExpanded ? "View less" : `View more (${data.timeline.length - 4})`}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : <p className="text-xs text-slate-400 text-center mt-8">No upload history yet.</p>}
                </div>
              </Card>
              </div>
            }
          />
        </div>
      </div>
    </>
  );
}

/* ─── SUB-COMPONENTS ─── */
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <BaseCard
      className={`gap-0 rounded-2xl border p-0 shadow-sm ${className}`}
      style={{ background: "#ffffff", borderColor: BRAND.border }}
    >
      <div className="p-4">
      {children}
      </div>
    </BaseCard>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="flex items-center gap-2.5 shrink-0">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${BRAND.primary}12`, color: BRAND.primary }}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-sm font-black text-slate-900">{title}</p>
    </div>
  );
}

function StatusPill({ label, color }: { label: string; color: string }) {
  return (
    <div className="px-2.5 h-6 rounded-full text-[9px] font-bold flex items-center whitespace-nowrap" style={{ background: `${color}12`, color }}>
      {label}
    </div>
  );
}

function MiniInfo({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="rounded-xl p-2.5" style={{ background: `${BRAND.primary}06` }}>
      <p className="text-[9px] text-slate-400 uppercase tracking-wide font-semibold">{label}</p>
      <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">{value ?? "—"}</p>
    </div>
  );
}

function MetricBar({ label, value, color }: { label: string; value: number; color: string }) {
  const safe = Number(value || 0);
  return (
    <div>
      <div className="flex justify-between mb-1">
        <p className="text-[11px] font-medium text-slate-600">{label}</p>
        <p className="text-[11px] font-black" style={{ color }}>{safe}%</p>
      </div>
      <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${safe}%`, background: color }} />
      </div>
    </div>
  );
}

function CircularProgress({ value }: { value: number }) {
  const safe = Number(value || 0);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safe / 100) * circumference;
  return (
    <div className="relative w-[100px] h-[100px] flex items-center justify-center shrink-0">
      <svg width="100" height="100" className="-rotate-90">
        <circle cx="50" cy="50" r={radius} stroke="#e2e8f0" strokeWidth="8" fill="none" />
        <circle cx="50" cy="50" r={radius} stroke={BRAND.primary} strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      </svg>
      <div className="absolute text-center">
        <p className="text-2xl font-black text-slate-900">{safe}</p>
        <p className="text-[8px] text-slate-400 uppercase tracking-wide font-bold">Score</p>
      </div>
    </div>
  );
}
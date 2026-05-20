"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Check, Zap, BarChart2, Map, Building2, Factory, GraduationCap, Shirt, Utensils, Truck, Globe, Building, Activity } from "lucide-react";

// ---------------------------------------------------------------------------
// Tiny utility: fade-up observer hook
// ---------------------------------------------------------------------------
function useFadeUp() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("opacity-100", "translate-y-0");
          el.classList.remove("opacity-0", "translate-y-6");
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-[#004958]/10 text-[#004958] border border-[#004958]/20">
      {children}
    </span>
  );
}

function StepCard({
  number,
  title,
  desc,
  delay,
}: {
  number: string;
  title: string;
  desc: string;
  delay: string;
}) {
  return (
    <div
      className="group relative flex flex-col gap-3 p-5 rounded-2xl border border-[#004D7C]/12 bg-white/60 backdrop-blur-sm
                 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-out"
      style={{ animationDelay: delay }}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#00673F]/10 text-[#00673F] font-bold text-sm shrink-0">
        {number}
      </div>
      <div>
        <h3 className="font-semibold text-[#004958] text-base leading-snug mb-1">{title}</h3>
        <p className="text-sm text-[#004958]/65 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div
      className="group flex gap-3.5 p-4 rounded-xl border border-[#004D7C]/10 bg-white/50 backdrop-blur-sm
                 hover:border-[#00673F]/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ease-out"
    >
      <div className="w-5 h-5 rounded-lg flex items-center justify-center text-[#00673F] shrink-0 mt-0.5 group-hover:text-[#004958] transition-colors text-lg">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-[#004958] text-sm mb-0.5">{title}</h4>
        <p className="text-xs text-[#004958]/60 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function WhyCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div
      className="group flex flex-col gap-4 p-6 rounded-2xl border border-[#004D7C]/12 bg-white/60 backdrop-blur-sm
                 hover:shadow-lg hover:-translate-y-1.5 hover:border-[#004D7C]/25 transition-all duration-300 ease-out"
    >
      <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#004958]/10 text-[#004958] group-hover:bg-[#00673F]/15 group-hover:text-[#00673F] transition-colors duration-300 text-lg">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-[#004958] text-base mb-2">{title}</h3>
        <p className="text-sm text-[#004958]/65 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main HomeScreen
// ---------------------------------------------------------------------------
export default function HomePage() {

  const heroRef = useFadeUp();
  const howRef = useFadeUp();
  const builtRef = useFadeUp();
  const featRef = useFadeUp();
  const whyRef = useFadeUp();

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: "#FBFBF3" }}
    >
      {/* Lexend font import & animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Lexend', sans-serif; }
        .fade-section { opacity: 0; transform: translateY(24px); transition: opacity 0.65s ease, transform 0.65s ease; }
        .fade-section.opacity-100 { opacity: 1; transform: translateY(0); }
        @keyframes shimmer { 0%,100% { opacity:0.6 } 50% { opacity:1 } }
        .dot-pulse { animation: shimmer 2.4s ease-in-out infinite; }
      `}</style>

      {/* ── HEADER + HERO (ONE SECTION) ────────────────────────── */}
      <section className="relative overflow-hidden px-4 py-8 min-h-[80vh] flex flex-col">
        {/* Sticky top nav inside hero */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="ESGroww" className="h-7 w-7 rounded object-contain" />
            <h1 className="text-lg font-bold text-[#00673F]">ESGroww</h1>
          </div>
          <div className="flex gap-1.5">
            <Link href="/login" className="px-3 py-1 rounded text-xs font-semibold text-[#004958] hover:bg-[#004958]/8 transition-colors">Log In</Link>
            <Link href="/register" className="px-3 py-1 rounded text-xs bg-[#00673F] text-white font-semibold hover:bg-[#005535] transition-colors">Sign Up</Link>
          </div>
        </div>

        {/* Subtle background blobs */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#00673F]/6 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-[#004D7C]/6 blur-3xl pointer-events-none" />

        <div 
          ref={heroRef as React.RefObject<HTMLDivElement>}
          className="fade-section max-w-6xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 flex-1"
        >
          {/* Left */}
          <div className="flex-1 max-w-2xl">
            <Badge>
              <span className="w-1 h-1 rounded-full bg-[#00673F] dot-pulse inline-block" />
              Certification Readiness
            </Badge>

            <h2 className="text-3xl sm:text-4xl font-bold text-[#004D7C] my-2 leading-tight">
              Transform Sustainability Data into Strategic Intelligence
            </h2>

            <p className="text-sm font-semibold text-[#00673F] mb-1">
              Your Certification Readiness, Decoded in Minutes
            </p>

            <p className="text-sm text-[#004D7C] mb-4 leading-relaxed">
              Upload your utility bills. Answer key questions. Get a consulting-grade sustainability readiness report across 10+ frameworks—instantly.
            </p>

            <Link
              href="/register"
              className="inline-block px-5 py-2 rounded-lg bg-[#00673F] text-white text-sm font-bold hover:bg-[#005535] transition-colors"
            >
              Get Started Free
            </Link>
          </div>

          {/* Right: compact card */}
          <div className="lg:w-64 shrink-0">
            <div className="rounded-xl border border-[#004D7C]/14 bg-white/90 backdrop-blur p-4 space-y-3 text-xs shadow-lg">
              <div className="flex justify-between items-center pb-3 border-b border-[#004D7C]/10">
                <span className="font-bold text-[#004958] text-sm">What's Inside</span>
                <span className="px-2 py-0.5 rounded-full bg-[#00673F]/10 text-[#00673F] text-[10px] font-bold">Complete</span>
              </div>
              <div className="space-y-2">
                <p className="text-[#004958] font-medium flex items-center gap-1.5"><Check className="w-4 h-4 text-[#00673F]" /> Multi-Framework Scores</p>
                <p className="text-[#004958]/80 text-[11px] pl-5.5">IGBC, ISO 14001, LEED, NABH, BRSR & more</p>
              </div>
              <div className="space-y-2">
                <p className="text-[#004958] font-medium flex items-center gap-1.5"><Zap className="w-4 h-4 text-[#00673F]" /> Emissions Calculation</p>
                <p className="text-[#004958]/80 text-[11px] pl-5.5">Scope 1, 2, 3 with methodology</p>
              </div>
              <div className="space-y-2">
                <p className="text-[#004958] font-medium flex items-center gap-1.5"><BarChart2 className="w-4 h-4 text-[#00673F]" /> Performance Benchmark</p>
                <p className="text-[#004958]/80 text-[11px] pl-5.5">Compare against your sector</p>
              </div>
              <div className="space-y-2">
                <p className="text-[#004958] font-medium flex items-center gap-1.5"><Map className="w-4 h-4 text-[#00673F]" /> Action Roadmap</p>
                <p className="text-[#004958]/80 text-[11px] pl-5.5">Prioritized improvement plan</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS + CONTENT ────────────────────────────── */}
      <section className="py-6 px-4 bg-white/50">
        <div className="max-w-5xl mx-auto">
          {/* How It Works */}
          <div
            ref={howRef as React.RefObject<HTMLDivElement>}
            className="fade-section mb-8"
          >
            <h3 className="text-2xl font-bold text-[#004D7C] mb-6 text-center">How It Works</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-[#004D7C]/12 bg-white/60">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#00673F]/10 text-[#00673F] font-bold text-lg mb-2">1</div>
                <h4 className="font-bold text-[#004D7C] text-base mb-2">Upload & Answer</h4>
                <p className="text-sm text-[#004D7C]">Share 6-12 months of energy, water, and waste data. Complete a quick governance questionnaire.</p>
              </div>
              <div className="p-4 rounded-xl border border-[#004D7C]/12 bg-white/60">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#00673F]/10 text-[#00673F] font-bold text-lg mb-2">2</div>
                <h4 className="font-bold text-[#004D7C] text-base mb-2">Intelligent Analysis</h4>
                <p className="text-sm text-[#004D7C]">Our engine validates, annualizes partial data, calculates emissions, and benchmarks your performance—transparently.</p>
              </div>
              <div className="p-4 rounded-xl border border-[#004D7C]/12 bg-white/60">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#00673F]/10 text-[#00673F] font-bold text-lg mb-2">3</div>
                <h4 className="font-bold text-[#004D7C] text-base mb-2">Strategic Roadmap</h4>
                <p className="text-sm text-[#004D7C]">Receive certification scores (IGBC, ISO 14001, LEED, NABH, BRSR & more), operational gaps, and a prioritized action plan.</p>
              </div>
            </div>
          </div>

          {/* Built For */}
          <div
            ref={builtRef as React.RefObject<HTMLDivElement>}
            className="fade-section mb-8"
          >
            <h3 className="text-2xl font-bold text-[#004958] mb-4 text-center">Built For</h3>
            <div className="flex flex-wrap gap-3 justify-center">
              {[
                { icon: <Activity className="w-4 h-4 text-[#00673F]" />, text: "Hospitals" },
                { icon: <Building className="w-4 h-4 text-[#00673F]" />, text: "Commercial Buildings" },
                { icon: <Factory className="w-4 h-4 text-[#00673F]" />, text: "Manufacturing" },
                { icon: <GraduationCap className="w-4 h-4 text-[#00673F]" />, text: "Educational Institutions" },
                { icon: <Shirt className="w-4 h-4 text-[#00673F]" />, text: "Textile Units" },
                { icon: <Utensils className="w-4 h-4 text-[#00673F]" />, text: "Food & Beverage" },
                { icon: <Truck className="w-4 h-4 text-[#00673F]" />, text: "Logistics" },
                { icon: <Globe className="w-4 h-4 text-[#00673F]" />, text: "NGOs" },
                { icon: <Building2 className="w-4 h-4 text-[#00673F]" />, text: "General Organizations" }
              ].map((item) => (
                <span key={item.text} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 border border-[#004D7C]/15 text-sm font-semibold text-[#004958]">
                  {item.icon}
                  {item.text}
                </span>
              ))}
            </div>
          </div>

          {/* What You Get */}
          <div
            ref={featRef as React.RefObject<HTMLDivElement>}
            className="fade-section mb-8"
          >
            <h3 className="text-2xl font-bold text-[#004958] mb-4 text-center">What You Get</h3>
            <div className="space-y-3 max-w-3xl mx-auto">
              <div className="flex gap-3 p-3 rounded-lg bg-white/70">
                <span className="text-lg shrink-0 text-[#00673F]"><Check className="w-5 h-5 mt-0.5" /></span>
                <div>
                  <h4 className="font-bold text-[#004958]">Multi-Framework Readiness Scores</h4>
                  <p className="text-sm text-[#004958]/70">One upload, 10+ certification assessments</p>
                </div>
              </div>
              <div className="flex gap-3 p-3 rounded-lg bg-white/70">
                <span className="text-lg shrink-0 text-[#00673F]"><Check className="w-5 h-5 mt-0.5" /></span>
                <div>
                  <h4 className="font-bold text-[#004958]">Emissions Intelligence</h4>
                  <p className="text-sm text-[#004958]/70">Scope 1, 2, 3 calculations with full transparency</p>
                </div>
              </div>
              <div className="flex gap-3 p-3 rounded-lg bg-white/70">
                <span className="text-lg shrink-0 text-[#00673F]"><Check className="w-5 h-5 mt-0.5" /></span>
                <div>
                  <h4 className="font-bold text-[#004958]">Benchmark Comparison</h4>
                  <p className="text-sm text-[#004958]/70">See where you stand vs. sector standards</p>
                </div>
              </div>
              <div className="flex gap-3 p-3 rounded-lg bg-white/70">
                <span className="text-lg shrink-0 text-[#00673F]"><Check className="w-5 h-5 mt-0.5" /></span>
                <div>
                  <h4 className="font-bold text-[#004958]">Executive-Grade Reports</h4>
                  <p className="text-sm text-[#004958]/70">Download PDF summaries anytime</p>
                </div>
              </div>
              <div className="flex gap-3 p-3 rounded-lg bg-white/70">
                <span className="text-lg shrink-0 text-[#00673F]"><Check className="w-5 h-5 mt-0.5" /></span>
                <div>
                  <h4 className="font-bold text-[#004958]">Confidence-Rated Results</h4>
                  <p className="text-sm text-[#004958]/70">Honest assessments, even with partial data</p>
                </div>
              </div>
            </div>
          </div>

          {/* Why ESGroww */}
          <div
            ref={whyRef as React.RefObject<HTMLDivElement>}
            className="fade-section"
          >
            <h3 className="text-2xl font-bold text-[#004958] mb-4 text-center">Why ESGroww?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl border border-[#004D7C]/12 bg-white/60">
                <h4 className="font-bold text-[#004958] text-base mb-2">No Guesswork. No Black Boxes.</h4>
                <p className="text-sm text-[#004958]/70">Every score shows you the data behind it, the assumptions made, and the confidence level applied.</p>
              </div>
              <div className="p-5 rounded-xl border border-[#004D7C]/12 bg-white/60">
                <h4 className="font-bold text-[#004958] text-base mb-2">Strategic, Not Just Compliant.</h4>
                <p className="text-sm text-[#004958]/70">Built for COOs, sustainability leads, and decision-makers—not just auditors.</p>
              </div>
              <div className="p-5 rounded-xl border border-[#004D7C]/12 bg-white/60">
                <h4 className="font-bold text-[#004958] text-base mb-2">From Readiness to Action.</h4>
                <p className="text-sm text-[#004958]/70">Get a sequenced certification pathway and timeline-based improvement roadmap.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA + FOOTER ─────────────────────────────────────────── */}
      <section className="py-6 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-xl border border-[#00673F]/20 bg-white/70 p-6 shadow-sm text-center">
            <h3 className="text-xl font-bold text-[#004958] mb-2">Ready to transform your organization?</h3>
            <p className="text-sm text-[#004958]/70 mb-4">Join leading organizations gaining clarity on their sustainability readiness.</p>
            <Link
              href="/register"
              className="inline-block px-6 py-2.5 rounded-lg bg-[#00673F] text-white text-sm font-bold hover:bg-[#005535] transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-4 px-4 border-t border-[#004958]/8 bg-white/50 text-center">
        <p className="text-xs text-[#004958]/60 max-w-3xl mx-auto leading-relaxed">
          ESGroww provides indicative sustainability intelligence. This platform does not replace official certification audits or regulatory compliance reviews.
        </p>
      </footer>
    </div>
  );
}

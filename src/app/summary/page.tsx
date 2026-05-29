import { getSummaryData } from "@/actions/summary.actions";
import { GoToResultsButton } from "@/components/shared/GoToResultsButton";
import { DownloadSummaryButton } from "@/components/summary/DownloadSummaryButton";
import { PageWrapper } from "@/components/layout/page-wrapper";
import BentoGrid from "@/components/shared/BentoGrid";
import { PageTitle, SectionTitle, CardTitle, BodyText, MetricValue, HelperText } from "@/components/ui/typography";
import { Info } from "lucide-react";

export const dynamic = "force-dynamic";

type DriverType = "positive" | "negative";

type DriverCardData = {
  type: DriverType;
  title: string;
  impact: string;
  detail: string;
};

export default async function SummaryPage() {
  try {
    const data = await getSummaryData();
    const { getESGConfiguration } = await import("@/lib/config-engine");
    const config = await getESGConfiguration();

    const formatTCO2e = (value: number) =>
      value.toLocaleString(undefined, { maximumFractionDigits: 3 });

    const emissionFactors = config?.emissionFactors ?? {};
    const defaultFactors = config?.defaultFactors ?? {
      electricity: 0.72,
      diesel: 2.68,
      ambulanceFuel: 2.68,
      wasteKg: 0.8,
      totalWaterConsumptionKl: 0.5,
      refrigerants: {},
    };

    const efElectricity = emissionFactors.electricity ?? defaultFactors.electricity;
    const efDiesel = emissionFactors.diesel ?? defaultFactors.diesel;
    const efTransport = emissionFactors.ambulancefuel ?? defaultFactors.ambulanceFuel;

  const environmentalScore = data.scores.environmentalScore;
  const socialScore        = data.scores.socialScore;
  const governanceScore    = data.scores.governanceScore;
  const overallScore       = data.scores.overallScore;
  const readiness          = data.readinessStage;

  const confidence = data.confidence;
  const totalEmissions = data.totals.totalEmissions;
  const dieselEmissionShare =
    totalEmissions > 0
      ? Math.round((data.emissions.dieselEmissions / totalEmissions) * 100)
      : 0;

  const scoreImpact = (delta: number) => {
    const magnitude = Math.max(1, Math.round(Math.abs(delta) / 5));
    return `${delta >= 0 ? "+" : "-"}${magnitude} ESG`;
  };

  const insights: string[] = [];
  if (data.totals.totalDiesel > 0) insights.push("High diesel dependency detected in operational activities.");
  if (data.coverage.electricityMonths < 6) insights.push("Electricity tracking coverage is below ESG reporting standards.");
  if (data.percentages.waterRecyclePercentage > 40) insights.push("Water recycling performance indicates positive sustainability adoption.");
  if (confidence < 70) insights.push("Low data completeness affects ESG reporting confidence.");

  const drivers: DriverCardData[] = [
    {
      type: data.percentages.renewablePercentage >= 30 ? "positive" : "negative",
      title: "Renewable Energy Mix",
      impact: scoreImpact(data.percentages.renewablePercentage - 30),
      detail: `${data.percentages.renewablePercentage}% renewable electricity against a 30% target.`,
    },
    {
      type: data.percentages.waterRecyclePercentage >= 25 ? "positive" : "negative",
      title: "Water Recycling",
      impact: scoreImpact(data.percentages.waterRecyclePercentage - 25),
      detail: `${data.percentages.waterRecyclePercentage}% recycled water against a 25% target.`,
    },
    {
      type: confidence >= 70 ? "positive" : "negative",
      title: "Reporting Coverage",
      impact: scoreImpact(confidence - 70),
      detail: `${confidence}% confidence from category coverage across the uploaded data.`,
    },
    {
      type: dieselEmissionShare <= 25 ? "positive" : "negative",
      title: "Diesel Dependency",
      impact: scoreImpact(25 - dieselEmissionShare),
      detail: `${dieselEmissionShare}% of total emissions comes from diesel consumption.`,
    },
  ];

  const recommendations: { title: string; desc: string; }[] = [];
  if (data.totals.totalDiesel > 0) {
    recommendations.push({ title: "Install Solar Infrastructure", desc: "Reduce dependency on diesel operations." });
  }
  if (data.percentages.waterRecyclePercentage < 40) {
    recommendations.push({ title: "Improve Water Recycling", desc: "Increase sustainability efficiency." });
  }
  if (confidence < 80) {
    recommendations.push({ title: "Improve ESG Reporting", desc: "Increase data confidence and compliance." });
  }

    return (
    <PageWrapper maxWidth="ultra" dense id="summary-report">

      {/* HERO SECTION — matches Assessment page header style: plain white bg, dark text, green accent only on score */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <PageTitle>ESG Intelligence Center</PageTitle>
          <BodyText className="text-muted-foreground mt-1 max-w-xl">
            Real-time sustainability readiness, operational analytics, carbon intelligence, and ESG scoring insights.
          </BodyText>
          <div className="mt-4 flex flex-wrap items-center gap-2" data-html2canvas-ignore="true">
            <GoToResultsButton />
            <DownloadSummaryButton targetId="summary-report" />
          </div>
        </div>

        {/* Score card — uses green accent sparingly, same as the "OK" badge style on assessment */}
        <div className="bg-white rounded-xl border border-border px-5 py-4 shadow-sm shrink-0 min-w-[160px]">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">ESG Readiness Score</span>
            <InfoTooltip text="Calculated using Environmental, Social, and Governance scores derived from emissions, water recycling, and reporting completeness." />
          </div>
          <MetricValue className="text-4xl text-foreground">{overallScore}</MetricValue>
          <HelperText className="text-emerald-600 font-medium mt-0.5">{readiness}</HelperText>
        </div>
      </div>

      {/* METRICS HEADER */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mt-1">
        <ScoreBreakdownCard title="ENV Score" score={environmentalScore} />
        <ScoreBreakdownCard title="SOC Score" score={socialScore} />
        <ScoreBreakdownCard title="GOV Score" score={governanceScore} />
        <MetricCard label="Electricity" value={`${Math.round(data.totals.totalElectricity)} kWh`} />
        <MetricCard label="Diesel" value={`${Math.round(data.totals.totalDiesel)} L`} />
        <MetricCard label="Water" value={`${Math.round(data.totals.totalWater)} KL`} />
        <MetricCard label="Waste" value={`${Math.round(data.totals.totalWaste)} kg`} />
        <MetricCard label="Total CO₂" value={`${formatTCO2e(totalEmissions)} tCO2e`} />
      </div>

      {/* BENTO GRID CONTENT */}
      <BentoGrid
        leftClassName="lg:col-span-1 xl:col-span-3"
        centerClassName="lg:col-span-1 xl:col-span-5"
        rightClassName="lg:col-span-2 xl:col-span-4"
        left={
          <div className="bg-white rounded-xl border border-border p-4 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5">
                <SectionTitle>Data Coverage</SectionTitle>
                <InfoTooltip text="Shows how many months of ESG operational data are available across each reporting category." />
              </div>
              {/* Confidence badge — neutral style matching assessment page badges */}
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-slate-200">
                {confidence}% Conf.
              </span>
            </div>
            <div className="space-y-3 flex-1">
              <CoverageBar label="Electricity" value={data.coverage.electricityMonths} />
              <CoverageBar label="Water" value={data.coverage.waterMonths} />
              <CoverageBar label="Fuel" value={data.coverage.fuelMonths} />
              <CoverageBar label="Waste" value={data.coverage.wasteMonths} />
              <CoverageBar label="Transport" value={data.coverage.transportMonths} />
              <CoverageBar label="Refrigerants" value={data.coverage.refrigerantMonths} />
            </div>
          </div>
        }
        center={
          <div className="bg-white rounded-xl border border-border p-4 shadow-sm flex flex-col h-full gap-4">
            <div>
              <SectionTitle className="mb-3">AI ESG Insights</SectionTitle>
              <div className="space-y-2">
                {insights.map((item, index) => <InsightCard key={index} text={item} />)}
              </div>
            </div>
            <div>
              <SectionTitle className="mb-3">ESG Drivers</SectionTitle>
              <div className="space-y-2">
                {drivers.map((driver, index) => (
                  <DriverCard key={index} title={driver.title} impact={driver.impact} type={driver.type} detail={driver.detail} />
                ))}
              </div>
            </div>
          </div>
        }
        right={
          <div className="flex flex-col gap-3 h-full">
            <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
              <div className="flex items-center gap-1.5 mb-3">
                <SectionTitle>Emissions Breakdown</SectionTitle>
                <InfoTooltip text="Calculated from annualized operational activity using shared emission factors." />
              </div>
              <div className="space-y-2">
                <EmissionRow 
                  label="Electricity" 
                  detail={`${formatTCO2e(data.emissions?.annualizedElectricity ?? data.totals.totalElectricity)} kWh`} 
                  value={`${formatTCO2e(data.emissions?.electricityEmissions ?? ((data.totals.totalElectricity ?? 0) * efElectricity / 1000))} tCO2e`} 
                  formula={`${formatTCO2e(data.emissions?.annualizedElectricity ?? data.totals.totalElectricity)} kWh × ${efElectricity}`}
                />
                <EmissionRow 
                  label="Diesel" 
                  detail={`${formatTCO2e(data.emissions?.annualizedDiesel ?? data.totals.totalDiesel)} L`} 
                  value={`${formatTCO2e(data.emissions?.dieselEmissions ?? ((data.totals.totalDiesel ?? 0) * efDiesel / 1000))} tCO2e`} 
                  formula={`${formatTCO2e(data.emissions?.annualizedDiesel ?? data.totals.totalDiesel)} L × ${efDiesel}`}
                />
                <EmissionRow 
                  label="Transport" 
                  detail={`${formatTCO2e(data.emissions?.annualizedTransportFuel ?? data.totals.totalTransportFuel)} L`} 
                  value={`${formatTCO2e(data.emissions?.transportEmissions ?? 0)} tCO2e`} 
                  formula={`${formatTCO2e(data.emissions?.annualizedTransportFuel ?? data.totals.totalTransportFuel)} L × ${efTransport}`}
                />
                <EmissionRow 
                  label="Refrigerants" 
                  detail={`${formatTCO2e(data.emissions?.annualizedRefrigerantEmissions ?? 0)} kg leaked`} 
                  value={`${formatTCO2e(data.emissions?.refrigerantEmissions ?? 0)} tCO2e`} 
                />
                <div className="pt-2 mt-2 border-t border-border flex justify-between items-center font-bold">
                  <span className="text-sm text-foreground">Total</span>
                  <span className="text-sm text-emerald-600">{formatTCO2e(totalEmissions)} tCO2e</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-border p-4 shadow-sm flex-1">
              <SectionTitle className="mb-3">Recommended Actions</SectionTitle>
              <div className="space-y-2">
                {recommendations.map((item, index) => (
                  <RecommendationCard key={index} title={item.title} desc={item.desc} />
                ))}
              </div>
            </div>
          </div>
        }
      />
    </PageWrapper>
    );
  } catch (error) {
    console.error("[summary.page] Failed to render summary page:", error);
    return (
      <PageWrapper maxWidth="wide" dense>
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-900 shadow-sm">
          <PageTitle className="text-rose-900">Summary unavailable</PageTitle>
          <BodyText className="mt-2 text-rose-800">
            The ESG summary could not be loaded right now. Please refresh the page or try again later.
          </BodyText>
        </div>
      </PageWrapper>
    );
  }
}

function InfoTooltip({ text }: { text: string }) {
  return (
    <div className="relative group inline-flex items-center justify-center">
      <Info className="size-3.5 text-muted-foreground hover:text-foreground cursor-help transition-colors" />
      <div className="absolute z-50 hidden group-hover:block w-56 bg-slate-900 text-white text-[11px] leading-snug rounded-lg p-2.5 shadow-xl bottom-full mb-1 left-1/2 -translate-x-1/2">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-border p-3 shadow-sm flex flex-col justify-center transition-all duration-200 hover:shadow-md hover:border-slate-300">
      <HelperText>{label}</HelperText>
      <div className="text-sm font-bold text-foreground mt-0.5 truncate">{value}</div>
    </div>
  );
}

function ScoreBreakdownCard({ title, score }: { title: string; score: number }) {
  return (
    <div className="bg-white rounded-xl border border-border p-3 shadow-sm flex flex-col justify-center">
      <div className="flex items-center justify-between">
        <HelperText className="font-semibold">{title}</HelperText>
        <span className="text-sm font-bold text-foreground">{score}</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function CoverageBar({ label, value }: { label: string; value: number }) {
  const percentage = (value / 12) * 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-xs font-medium text-foreground">{label}</span>
        <span className="text-[10px] text-muted-foreground">{value}/12</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function InsightCard({ text }: { text: string }) {
  return (
    <div className="border border-border bg-slate-50 rounded-lg p-2">
      <HelperText className="text-foreground">{text}</HelperText>
    </div>
  );
}

function DriverCard({ title, impact, type, detail }: { title: string; impact: string; type: DriverType; detail?: string; }) {
  return (
    <div className={`rounded-lg p-2.5 border ${type === "positive" ? "bg-slate-50 border-border" : "bg-slate-50 border-border"}`}>
      <div className="flex items-center justify-between">
        <span className="font-semibold text-foreground text-xs">{title}</span>
        <span className={`font-bold text-xs ${type === "positive" ? "text-emerald-600" : "text-rose-500"}`}>{impact}</span>
      </div>
      {detail && <HelperText className="mt-1">{detail}</HelperText>}
    </div>
  );
}

function RecommendationCard({ title, desc }: { title: string; desc: string; }) {
  return (
    <div className="bg-slate-50 rounded-lg p-2.5 border border-border">
      <CardTitle>{title}</CardTitle>
      <HelperText className="mt-0.5">{desc}</HelperText>
    </div>
  );
}

function EmissionRow({ label, detail, value, formula }: { label: string; detail: string; value: string; formula?: string }) {
  return (
    <div className="bg-slate-50 rounded-lg p-2.5 flex items-center justify-between transition-colors hover:bg-slate-100 group border border-transparent hover:border-slate-200">
      <div>
        <div className="text-xs font-semibold text-foreground">{label}</div>
        <div className="text-[10px] text-muted-foreground">{detail}</div>
      </div>
      <div className="text-right">
        <div className="text-xs font-bold text-emerald-600">{value}</div>
        {formula && <div className="text-[9.5px] font-medium text-slate-400 mt-0.5 group-hover:text-slate-500 transition-colors">{formula} = {value}</div>}
      </div>
    </div>
  );
}
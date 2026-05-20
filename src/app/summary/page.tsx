import { getSummaryData } from "@/actions/summary.actions";
import { GoToResultsButton } from "@/components/shared/GoToResultsButton";

type DriverType =
  | "positive"
  | "negative";

type DriverCardData = {
  type: DriverType;
  title: string;
  impact: string;
  detail: string;
};

export default async function SummaryPage() {
  const data = await getSummaryData();

  /* ========================= */
  /* CALCULATIONS              */
  /* ========================= */

  const environmentalScore = data.scores.environmentalScore;
  const socialScore        = data.scores.socialScore;
  const governanceScore    = data.scores.governanceScore;
  const overallScore       = data.scores.overallScore;
  const readiness          = data.readinessStage;

  const confidence = data.confidence;
  const totalEmissions = data.totals.totalEmissions;
  const dieselEmissionShare =
    totalEmissions > 0
      ? Math.round(
          (data.emissions.dieselEmissions /
            totalEmissions) *
            100
        )
      : 0;

  const scoreImpact = (delta: number) => {
    const magnitude = Math.max(
      1,
      Math.round(Math.abs(delta) / 5)
    );

    return `${delta >= 0 ? "+" : "-"}${magnitude} ESG`;
  };

  /* ========================= */
  /* DYNAMIC INSIGHTS          */
  /* ========================= */

  const insights: string[] = [];

  if (data.totals.totalDiesel > 0) {
    insights.push(
      "High diesel dependency detected in operational activities."
    );
  }

  if (data.coverage.electricityMonths < 6) {
    insights.push(
      "Electricity tracking coverage is below ESG reporting standards."
    );
  }

  if (
    data.percentages.waterRecyclePercentage >
    40
  ) {
    insights.push(
      "Water recycling performance indicates positive sustainability adoption."
    );
  }

  if (confidence < 70) {
    insights.push(
      "Low data completeness affects ESG reporting confidence."
    );
  }

  /* ========================= */
  /* DRIVERS                   */
  /* ========================= */

  const drivers: DriverCardData[] = [
    {
      type:
        data.percentages.renewablePercentage >= 30
          ? "positive"
          : "negative",
      title: "Renewable Energy Mix",
      impact: scoreImpact(
        data.percentages.renewablePercentage - 30
      ),
      detail: `${data.percentages.renewablePercentage}% renewable electricity against a 30% target.`,
    },

    {
      type:
        data.percentages.waterRecyclePercentage >= 25
          ? "positive"
          : "negative",
      title: "Water Recycling",
      impact: scoreImpact(
        data.percentages.waterRecyclePercentage - 25
      ),
      detail: `${data.percentages.waterRecyclePercentage}% recycled water against a 25% target.`,
    },

    {
      type:
        confidence >= 70
          ? "positive"
          : "negative",
      title: "Reporting Coverage",
      impact: scoreImpact(confidence - 70),
      detail: `${confidence}% confidence from category coverage across the uploaded data.`,
    },

    {
      type:
        dieselEmissionShare <= 25
          ? "positive"
          : "negative",
      title: "Diesel Dependency",
      impact: scoreImpact(25 - dieselEmissionShare),
      detail: `${dieselEmissionShare}% of total emissions comes from diesel consumption.`,
    },
  ];

  /* ========================= */
  /* RECOMMENDATIONS           */
  /* ========================= */

  const recommendations: {
    title: string;
    desc: string;
  }[] = [];

  if (data.totals.totalDiesel > 0) {
    recommendations.push({
      title: "Install Solar Infrastructure",
      desc:
        "Reduce dependency on diesel operations.",
    });
  }

  if (
    data.percentages.waterRecyclePercentage <
    40
  ) {
    recommendations.push({
      title: "Improve Water Recycling",
      desc:
        "Increase sustainability efficiency.",
    });
  }

  if (confidence < 80) {
    recommendations.push({
      title: "Improve ESG Reporting",
      desc:
        "Increase data confidence and compliance.",
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100">

      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-4 space-y-4">

        {/* HERO */}
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-500 rounded-2xl p-5 text-white shadow-lg">

          <div className="flex items-center justify-between">

            <div>

              <h1 className="text-3xl font-bold">
                ESG Intelligence Center
              </h1>

              <p className="mt-2 text-sm text-emerald-50 max-w-2xl">
                Real-time sustainability
                readiness, operational
                analytics, carbon intelligence,
                and ESG scoring insights.
              </p>

              <div className="mt-4">
                <GoToResultsButton />
              </div>

            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20">

              <div className="flex items-center">

                <p className="text-sm text-emerald-100">
                  ESG Readiness Score
                </p>

                <InfoTooltip text="Calculated using Environmental, Social, and Governance scores derived from emissions, water recycling, and reporting completeness." />

              </div>

              <h2 className="text-5xl font-bold mt-1">
                {overallScore}
              </h2>

              <p className="mt-1 text-sm text-emerald-50">
                {readiness}
              </p>

            </div>

          </div>
        </div>

        {/* SCORE + METRICS */}
        <div className="grid grid-cols-12 gap-3">

          {/* SCORES */}
          <div className="col-span-4 grid grid-cols-3 gap-3">

            <ScoreBreakdownCard
              title="ENV"
              score={environmentalScore}
            />

            <ScoreBreakdownCard
              title="SOC"
              score={socialScore}
            />

            <ScoreBreakdownCard
              title="GOV"
              score={governanceScore}
            />

          </div>

          {/* METRICS */}
          <div className="col-span-8 grid grid-cols-5 gap-3">

            <MetricCard
              label="Electricity"
              value={`${Math.round(
                data.totals.totalElectricity
              )} kWh`}
            />

            <MetricCard
              label="Diesel"
              value={`${Math.round(
                data.totals.totalDiesel
              )} L`}
            />

            <MetricCard
              label="Water"
              value={`${Math.round(
                data.totals.totalWater
              )} KL`}
            />

            <MetricCard
              label="Waste"
              value={`${Math.round(
                data.totals.totalWaste
              )} kg`}
            />

            <MetricCard
              label="CO₂"
              value={`${Math.round(
                totalEmissions
              )} kg`}
            />

          </div>

        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-12 gap-4">

          {/* COVERAGE */}
          <div className="col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm overflow-hidden">

            <div className="flex items-center justify-between mb-4">

              <div className="flex items-center">

                <h2 className="text-xl font-bold text-slate-900">
                  Coverage
                </h2>

                <InfoTooltip text="Shows how many months of ESG operational data are available across each reporting category." />

              </div>

              <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-sm font-semibold">
                {confidence}%
              </div>

            </div>

            <div className="space-y-4">

              <CoverageBar
                label="Electricity"
                value={
                  data.coverage.electricityMonths
                }
              />

              <CoverageBar
                label="Water"
                value={data.coverage.waterMonths}
              />

              <CoverageBar
                label="Fuel"
                value={data.coverage.fuelMonths}
              />

              <CoverageBar
                label="Waste"
                value={data.coverage.wasteMonths}
              />

              <CoverageBar
                label="Transport"
                value={
                  data.coverage.transportMonths
                }
              />

              <CoverageBar
                label="Refrigerants"
                value={
                  data.coverage.refrigerantMonths
                }
              />

            </div>
          </div>

          {/* INSIGHTS */}
          <div className="col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm overflow-hidden">

            <h2 className="text-xl font-bold text-slate-900 mb-4">
              AI ESG Insights
            </h2>

            <div className="space-y-3">

              {insights.map((item, index) => (
                <InsightCard
                  key={index}
                  text={item}
                />
              ))}

            </div>

            <h2 className="text-xl font-bold text-slate-900 mt-5 mb-4">
              ESG Drivers
            </h2>

            <div className="space-y-3">

              {drivers.map((driver, index) => (
                <DriverCard
                  key={index}
                  title={driver.title}
                  impact={driver.impact}
                  type={driver.type}
                  detail={driver.detail}
                />
              ))}

            </div>

          </div>

          {/* EMISSIONS + ACTIONS */}
          <div className="col-span-4 space-y-4">

            {/* EMISSIONS */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

              <div className="flex items-center mb-4">

                <h2 className="text-xl font-bold text-slate-900">Emissions</h2>

                <InfoTooltip text="Calculated from annualized electricity, diesel, transport fuel, and refrigerant activity using shared emission factors." />

              </div>

              <div className="space-y-3">

                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="font-semibold text-slate-900">Electricity</p>
                  <p className="mt-1 text-slate-600">
                    {Math.round(data.emissions?.annualizedElectricity ?? data.totals.totalElectricity)} kWh × factor
                  </p>
                  <p className="mt-1 text-emerald-700 font-bold">
                    {data.emissions?.electricityEmissions ?? Math.round((data.totals.totalElectricity ?? 0) * 0.82)} kgCO₂e
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="font-semibold text-slate-900">Diesel</p>
                  <p className="mt-1 text-slate-600">
                    {Math.round(data.emissions?.annualizedDiesel ?? data.totals.totalDiesel)} L × 2.68
                  </p>
                  <p className="mt-1 text-emerald-700 font-bold">
                    {data.emissions?.dieselEmissions ?? Math.round((data.totals.totalDiesel ?? 0) * 2.68)} kgCO₂e
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="font-semibold text-slate-900">Transport</p>
                  <p className="mt-1 text-slate-600">
                    {Math.round(data.emissions?.annualizedTransportFuel ?? data.totals.totalTransportFuel)} L × factor
                  </p>
                  <p className="mt-1 text-emerald-700 font-bold">
                    {data.emissions?.transportEmissions ?? 0} kgCO₂e
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="font-semibold text-slate-900">Refrigerants</p>
                  <p className="mt-1 text-slate-600">
                    {Math.round(data.emissions?.annualizedRefrigerantEmissions ?? 0)} kg (leaked)
                  </p>
                  <p className="mt-1 text-emerald-700 font-bold">
                    {data.emissions?.refrigerantEmissions ?? 0} kgCO₂e
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="font-semibold text-slate-900">Total</p>
                  <p className="mt-1 text-emerald-700 font-bold">
                    {data.emissions
                      ? (data.emissions.electricityEmissions ?? 0) +
                        (data.emissions.dieselEmissions ?? 0) +
                        (data.emissions.transportEmissions ?? 0) +
                        (data.emissions.refrigerantEmissions ?? 0)
                      : totalEmissions}{" "}
                    kgCO₂e
                  </p>
                </div>

              </div>

            </div>

            {/* RECOMMENDATIONS */}
            <div className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-sm">

              <h2 className="text-xl font-bold text-slate-900 mb-4">
                ESG Actions
              </h2>

              <div className="space-y-3">

                {recommendations.map(
                  (item, index) => (
                    <RecommendationCard
                      key={index}
                      title={item.title}
                      desc={item.desc}
                    />
                  )
                )}

              </div>

            </div>

          </div>

        </div>

      </main>
    </div>
  );
}

/* ======================= */
/* TOOLTIP                 */
/* ======================= */

function InfoTooltip({
  text,
}: {
  text: string;
}) {
  return (
    <div className="relative group inline-block ml-2">

      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 text-[10px] flex items-center justify-center cursor-pointer font-bold">
        i
      </div>

      <div className="absolute z-50 hidden group-hover:block w-64 bg-slate-900 text-white text-xs rounded-xl p-3 shadow-xl -top-2 left-6">
        {text}
      </div>

    </div>
  );
}

/* ======================= */
/* COMPONENTS              */
/* ======================= */

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="text-lg font-bold text-slate-900 mt-2">
        {value}
      </p>

    </div>
  );
}

function ScoreBreakdownCard({
  title,
  score,
}: {
  title: string;
  score: number;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">

      <div className="flex items-center justify-between">

        <div className="flex items-center">

          <h3 className="font-semibold text-slate-900 text-sm">
            {title}
          </h3>

          <InfoTooltip
            text={`This score is derived from ESG operational metrics related to ${title}.`}
          />

        </div>

        <span className="text-xl font-bold text-emerald-600">
          {score}
        </span>

      </div>

      <div className="w-full bg-slate-200 rounded-full h-2 mt-4">

        <div
          className="bg-gradient-to-r from-emerald-500 to-emerald-700 h-2 rounded-full"
          style={{
            width: `${score}%`,
          }}
        />

      </div>
    </div>
  );
}

function CoverageBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const percentage = (value / 12) * 100;

  return (
    <div>

      <div className="flex items-center justify-between mb-1">

        <p className="font-medium text-slate-700 text-sm">
          {label}
        </p>

        <p className="text-xs text-slate-500">
          {value}/12
        </p>

      </div>

      <div className="w-full bg-slate-200 rounded-full h-2">

        <div
          className="bg-gradient-to-r from-emerald-500 to-emerald-700 h-2 rounded-full"
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

    </div>
  );
}

function InsightCard({
  text,
}: {
  text: string;
}) {
  return (
    <div className="border border-emerald-100 bg-emerald-50 rounded-xl p-3">

      <p className="text-slate-700 text-sm">
        {text}
      </p>

    </div>
  );
}

function DriverCard({
  title,
  impact,
  type,
  detail,
}: {
  title: string;
  impact: string;
  type: DriverType;
  detail?: string;
}) {
  return (
    <div
      className={`rounded-xl p-3 border ${
        type === "positive"
          ? "bg-emerald-50 border-emerald-200"
          : "bg-red-50 border-red-200"
      }`}
    >

      <div className="flex items-center justify-between">

        <p className="font-semibold text-slate-900 text-sm">{title}</p>

        <p
          className={`font-bold text-sm ${
            type === "positive" ? "text-emerald-700" : "text-red-600"
          }`}
        >
          {impact}
        </p>

      </div>

      {detail && <p className="mt-2 text-sm text-slate-600">{detail}</p>}

    </div>
  );
}

function RecommendationCard({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">

      <h3 className="font-semibold text-sm text-slate-900">
        {title}
      </h3>

      <p className="text-slate-600 mt-1 text-xs">
        {desc}
      </p>

    </div>
  );
}
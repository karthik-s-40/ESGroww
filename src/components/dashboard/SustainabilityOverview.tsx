interface CoverageData {
  averageCoverage: number;
}

interface Percentages {
  renewablePercentage: string;
  waterRecyclingPercentage: string;
  wasteDiversionPercentage: string;
}

interface DashboardData {
  readinessScore: number;
  hospitalName: string;
  industry: string;
  percentages: Percentages;
  coverage?: CoverageData;
}

interface Props {
  data: DashboardData;
}

export default function SustainabilityOverview({
  data,
}: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">
            ESG Readiness Score
          </p>

          <h1 className="text-5xl font-bold text-emerald-600 mt-2">
            {data.readinessScore}%
          </h1>
        </div>

        <div className="text-right">
          <p className="text-sm text-slate-500">
            Hospital
          </p>

          <h2 className="text-2xl font-semibold text-slate-900">
            {data.hospitalName}
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            {data.industry}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">
            Renewable Energy
          </p>

          <h3 className="text-2xl font-bold text-slate-900 mt-2">
            {
              data.percentages
                .renewablePercentage
            }
            %
          </h3>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">
            Water Recycling
          </p>

          <h3 className="text-2xl font-bold text-slate-900 mt-2">
            {
              data.percentages
                .waterRecyclingPercentage
            }
            %
          </h3>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">
            Waste Diversion
          </p>

          <h3 className="text-2xl font-bold text-slate-900 mt-2">
            {
              data.percentages
                .wasteDiversionPercentage
            }
            %
          </h3>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">
            Data Coverage
          </p>

          <h3 className="text-2xl font-bold text-slate-900 mt-2">
            {data.coverage?.averageCoverage ?? 0}%
          </h3>
        </div>
      </div>
    </div>
  );
}
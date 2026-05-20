"use client";

export function CalculationsSummary() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">3. Annualized Calculations Summary</h2>
      <div className="border rounded-lg bg-white overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-3 font-medium">Metric</th>
              <th className="px-6 py-3 font-medium">Uploaded Data</th>
              <th className="px-6 py-3 font-medium">Annualized Value Used</th>
              <th className="px-6 py-3 font-medium">Calculation Logic</th>
            </tr>
          </thead>
          <tbody className="divide-y text-slate-700">
            <tr className="hover:bg-slate-50">
              <td className="px-6 py-3 font-medium text-slate-900">Electricity (kWh)</td>
              <td className="px-6 py-3">88,000</td>
              <td className="px-6 py-3 font-semibold text-slate-900">150,857</td>
              <td className="px-6 py-3 text-slate-500">88,000 ÷ 7 × 12</td>
            </tr>
            <tr className="hover:bg-slate-50">
              <td className="px-6 py-3 font-medium text-slate-900">Renewable Energy (kWh)</td>
              <td className="px-6 py-3">0</td>
              <td className="px-6 py-3 font-semibold text-slate-900">0</td>
              <td className="px-6 py-3 text-slate-500">Actual</td>
            </tr>
            <tr className="hover:bg-slate-50">
              <td className="px-6 py-3 font-medium text-slate-900">DG Diesel (Litres)</td>
              <td className="px-6 py-3">1,200</td>
              <td className="px-6 py-3 font-semibold text-slate-900">1,200</td>
              <td className="px-6 py-3 text-slate-500">Actual</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

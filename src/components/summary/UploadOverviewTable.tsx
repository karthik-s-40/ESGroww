"use client";

export function UploadOverviewTable() {
  const rows = [
    { cat: "Electricity", months: "7 / 12", comp: "58%", conf: "Medium", confColor: "text-amber-500", stat: "Partial", statColor: "text-amber-500" },
    { cat: "Water", months: "12 / 12", comp: "100%", conf: "High", confColor: "text-emerald-500", stat: "Complete", statColor: "text-emerald-500" },
    { cat: "Fuel", months: "12 / 12", comp: "100%", conf: "High", confColor: "text-emerald-500", stat: "Complete", statColor: "text-emerald-500" },
    { cat: "Waste", months: "12 / 12", comp: "100%", conf: "High", confColor: "text-emerald-500", stat: "Complete", statColor: "text-emerald-500" },
    { cat: "Refrigerants", months: "8 / 12", comp: "67%", conf: "Medium", confColor: "text-amber-500", stat: "Partial", statColor: "text-amber-500" },
    { cat: "Transport", months: "6 / 12", comp: "50%", conf: "Medium", confColor: "text-amber-500", stat: "Partial", statColor: "text-amber-500" },
    { cat: "Governance", months: "-", comp: "85%", conf: "High", confColor: "text-emerald-500", stat: "Complete", statColor: "text-emerald-500" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">1. Upload Overview</h2>
      <div className="border rounded-lg bg-white overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-3 font-medium">Category</th>
              <th className="px-6 py-3 font-medium">Months Uploaded</th>
              <th className="px-6 py-3 font-medium">Completeness</th>
              <th className="px-6 py-3 font-medium">Confidence</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y text-slate-700">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="px-6 py-3 font-medium text-slate-900">{row.cat}</td>
                <td className="px-6 py-3">{row.months}</td>
                <td className="px-6 py-3">{row.comp}</td>
                <td className={`px-6 py-3 ${row.confColor}`}>{row.conf}</td>
                <td className={`px-6 py-3 ${row.statColor}`}>{row.stat}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CertificationReadiness({ certifications }: { certifications: any[] }) {
  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-2 border-b mb-3">
        <CardTitle className="text-lg flex justify-between items-center text-slate-900">
          Certification Readiness
          <span className="text-sm text-emerald-600 font-normal cursor-pointer hover:underline">View Details &gt;</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {certifications.map((cert, i) => (
            <div key={i} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
              <div className="font-medium text-slate-900 flex-1">{cert.name}</div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                cert.readiness === "Ready"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}>
                {cert.readiness}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

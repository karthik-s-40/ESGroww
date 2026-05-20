import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import RecentUploadsTable from "@/components/upload/RecentUploadsTable";

export default function UploadHistoryPage() {
  return (
    <div className="mx-auto max-w-6xl pb-16">
      <Link
        href="/upload"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Data Load
      </Link>
      <h1 className="text-2xl font-bold text-slate-900">All uploads</h1>
      <p className="mt-1 text-sm text-slate-500">Excel files recorded for your organization, newest first.</p>
      <div className="mt-8">
        <RecentUploadsTable limit={200} showViewAllLink={false} showTitle={false} />
      </div>
    </div>
  );
}

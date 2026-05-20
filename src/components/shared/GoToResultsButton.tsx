"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function GoToResultsButton() {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.push("/results")}
      className="bg-emerald-600 text-white hover:bg-emerald-700"
    >
      View Detailed Results
    </Button>
  );
}

"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/getUser";

export type GovernanceFormState = {
  hasEsgPolicy: boolean;
  hasSustainabilityCommittee: boolean;
  hasAuditReports: boolean;
  hasComplianceDocs: boolean;
};

export async function getGovernanceQuestionnaire(): Promise<GovernanceFormState | null> {
  const user = await getCurrentUser();
  if (!user || typeof user === "string" || !("hospitalId" in user)) {
    return null;
  }

  const hospitalId = String(user.hospitalId);
  const row = await prisma.governanceData.findUnique({
    where: { hospitalId },
  });

  if (!row) {
    return {
      hasEsgPolicy: false,
      hasSustainabilityCommittee: false,
      hasAuditReports: false,
      hasComplianceDocs: false,
    };
  }

  return {
    hasEsgPolicy: row.hasEsgPolicy,
    hasSustainabilityCommittee: row.hasSustainabilityCommittee,
    hasAuditReports: row.hasAuditReports,
    hasComplianceDocs: row.hasComplianceDocs,
  };
}

export async function saveGovernanceQuestionnaire(
  data: GovernanceFormState
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user || typeof user === "string" || !("hospitalId" in user)) {
    return { ok: false, error: "Not signed in." };
  }

  const hospitalId = String(user.hospitalId);

  try {
    await prisma.governanceData.upsert({
      where: { hospitalId },
      create: {
        hospitalId,
        hasEsgPolicy: !!data.hasEsgPolicy,
        hasSustainabilityCommittee: !!data.hasSustainabilityCommittee,
        hasAuditReports: !!data.hasAuditReports,
        hasComplianceDocs: !!data.hasComplianceDocs,
      },
      update: {
        hasEsgPolicy: !!data.hasEsgPolicy,
        hasSustainabilityCommittee: !!data.hasSustainabilityCommittee,
        hasAuditReports: !!data.hasAuditReports,
        hasComplianceDocs: !!data.hasComplianceDocs,
      },
    });

    revalidatePath("/upload");
    revalidatePath("/upload/governance");
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not save questionnaire." };
  }
}

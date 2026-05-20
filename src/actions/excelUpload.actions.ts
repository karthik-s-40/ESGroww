"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/getUser";
import { processCategoryExcelUpload } from "@/lib/upload/processCategoryExcelUpload";
import type { ExcelUploadActionResult } from "@/lib/upload/uploadTypes";

async function runUpload(
  category: Parameters<typeof processCategoryExcelUpload>[0],
  formData: FormData
): Promise<ExcelUploadActionResult> {
  const user = await getCurrentUser();

  if (!user || typeof user === "string" || !("hospitalId" in user)) {
    return {
      success: false,
      code: "VALIDATION",
      error: "Unauthorized user.",
    };
  }

  const hospitalId = String(user.hospitalId);
  const result = await processCategoryExcelUpload(category, hospitalId, formData);

  if (result.success) {
    revalidatePath("/upload");
    revalidatePath("/upload/history");
  }

  return result;
}

export async function uploadElectricityExcel(formData: FormData) {
  return runUpload("Electricity", formData);
}

export async function uploadWaterExcel(formData: FormData) {
  return runUpload("Water", formData);
}

export async function uploadFuelExcel(formData: FormData) {
  return runUpload("Fuel", formData);
}

export async function uploadWasteExcel(formData: FormData) {
  return runUpload("Waste", formData);
}

export async function uploadRefrigerantsExcel(formData: FormData) {
  return runUpload("Refrigerants", formData);
}

export async function uploadTransportExcel(formData: FormData) {
  return runUpload("Transport", formData);
}

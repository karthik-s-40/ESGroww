export const ADMIN_DATA_CATEGORIES = [
  { key: "Electricity", prismaUpload: "Electricity", dataLabel: "Electricity" },
  { key: "Water", prismaUpload: "Water", dataLabel: "Water" },
  { key: "Waste", prismaUpload: "Waste", dataLabel: "Waste" },
  { key: "Fuel", prismaUpload: "Fuel", dataLabel: "Fuel" },
  { key: "Refrigerants", prismaUpload: "Refrigerants", dataLabel: "Refrigerants" },
  { key: "Transport", prismaUpload: "Transport", dataLabel: "Transport" },
] as const;

export type AdminDataCategoryKey = (typeof ADMIN_DATA_CATEGORIES)[number]["key"];

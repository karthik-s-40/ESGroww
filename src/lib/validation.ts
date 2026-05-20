export const SECTOR_OPTIONS = [
  {
    code: "HOSP",
    label:
      "Hospital / Healthcare",
  },

  {
    code: "BLDG",
    label:
      "Commercial Building / Real Estate",
  },

  {
    code: "MFGR",
    label:
      "Manufacturing / Industrial",
  },

  {
    code: "TEXT",
    label:
      "Textile Industry",
  },

  {
    code: "ELEC",
    label:
      "Electronics Industry",
  },

  {
    code: "FOOD",
    label:
      "Food & Beverage",
  },

  {
    code: "LOGI",
    label:
      "Logistics & Supply Chain",
  },

  {
    code: "EDUC",
    label:
      "Educational Institution",
  },

  {
    code: "NGO",
    label:
      "NGO / Social Impact",
  },

  {
    code: "GEN",
    label:
      "General (all other organizations)",
  },
];

export function validateEmail(
  email: string
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(
    email
  );
}

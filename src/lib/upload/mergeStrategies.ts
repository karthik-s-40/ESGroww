export type MergeStrategy =
  | "ADD_TO_EXISTING"
  | "REPLACE_EXISTING"
  | "KEEP_EXISTING_ADD_NEW";

export const MERGE_STRATEGY_LABELS = {
  ADD_TO_EXISTING: {
    title: "Add to Existing Data",

    description:
      "Combine uploaded values with existing month values.",
  },

  REPLACE_EXISTING: {
    title:
      "Replace Existing Data",

    description:
      "Overwrite existing overlapping month values.",
  },

  KEEP_EXISTING_ADD_NEW: {
    title:
      "Keep Existing + Add Missing",

    description:
      "Ignore overlaps and only insert new months.",
  },
};
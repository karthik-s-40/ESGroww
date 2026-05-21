import { SECTOR_OPTIONS, validateEmail } from "@/lib/validation";

describe("validation utilities", () => {
  test("validates common email formats", () => {
    expect(validateEmail("admin@example.com")).toBe(true);
    expect(validateEmail("admin+alerts@example.co.in")).toBe(true);
    expect(validateEmail("bad-email")).toBe(false);
    expect(validateEmail("missing-at.example.com")).toBe(false);
  });

  test("keeps the sector catalog stable", () => {
    expect(SECTOR_OPTIONS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "HOSP", label: "Hospital / Healthcare" }),
        expect.objectContaining({ code: "GEN", label: "General (all other organizations)" }),
      ])
    );
  });
});
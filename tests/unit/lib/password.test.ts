import { comparePassword, hashPassword, validatePasswordStrength } from "@/lib/password";

describe("password utilities", () => {
  test("validates password strength requirements", () => {
    expect(validatePasswordStrength("short")).toEqual(
      expect.objectContaining({
        valid: false,
        errors: expect.objectContaining({
          minLength: false,
          uppercase: false,
          number: false,
          symbol: false,
        }),
      })
    );

    expect(validatePasswordStrength("Strong1!")).toEqual(
      expect.objectContaining({
        valid: true,
        errors: expect.objectContaining({
          minLength: true,
          uppercase: true,
          number: true,
          symbol: true,
        }),
      })
    );
  });

  test("hashes and compares passwords", async () => {
    const hash = await hashPassword("Strong1!");

    await expect(comparePassword("Strong1!", hash)).resolves.toBe(true);
    await expect(comparePassword("Wrong1!", hash)).resolves.toBe(false);
  });
});
import { createSessionToken, verifySessionToken } from "@/lib/session";

describe("session utilities", () => {
  test("creates and verifies session tokens", () => {
    const token = createSessionToken({
      userId: "user-1",
      hospitalId: "hospital-1",
      rememberMe: true,
    });

    expect(verifySessionToken(token)).toEqual(
      expect.objectContaining({
      userId: "user-1",
      hospitalId: "hospital-1",
      })
    );
  });

  test("rejects invalid session tokens", () => {
    expect(verifySessionToken("not-a-real-token")).toBeNull();
  });
});
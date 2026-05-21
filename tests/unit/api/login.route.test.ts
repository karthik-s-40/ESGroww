/** @jest-environment node */

const mockComparePassword = jest.fn();
const mockCreateSessionToken = jest.fn();

jest.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("@/lib/password", () => ({
  comparePassword: (...args: unknown[]) => mockComparePassword(...args),
}));

jest.mock("@/lib/session", () => ({
  createSessionToken: (...args: unknown[]) => mockCreateSessionToken(...args),
}));

import { POST } from "@/app/api/login/route";

const { prisma: mockPrisma } = jest.requireMock("@/lib/db") as {
  prisma: {
    user: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };
};

describe("login route", () => {
  test("rejects missing credentials", async () => {
    const request = new Request("http://localhost/api/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "", password: "" }),
    });

    const response = await POST(request as never);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBe("Email and password are required.");
  });

  test("increments failed attempts on a bad password", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      emailVerified: true,
      password: "hashed",
      failedLoginAttempts: 4,
      accountLockedUntil: null,
      hospital: { accountStatus: "Active" },
    });
    mockComparePassword.mockResolvedValue(false);

    const request = new Request("http://localhost/api/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "admin@example.com", password: "Wrong1!" }),
    });

    const response = await POST(request as never);
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error).toContain("locked for 15 minutes");
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "user-1" },
        data: expect.objectContaining({
          failedLoginAttempts: 5,
          accountLockedUntil: expect.any(Date),
        }),
      })
    );
  });
});
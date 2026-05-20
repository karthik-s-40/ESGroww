import { prisma } from "@/lib/db";

export type EmailVerificationResult =
  | { ok: true }
  | {
      ok: false;
      reason:
        | "missing_token"
        | "invalid"
        | "expired";
    };

export async function completeEmailVerification(
  token: string | null
): Promise<EmailVerificationResult> {
  if (!token?.trim()) {
    return {
      ok: false,
      reason: "missing_token",
    };
  }

  const user =
    await prisma.user.findFirst({
      where: {
        emailVerificationToken:
          token,
      },
    });

  if (!user) {
    return {
      ok: false,
      reason: "invalid",
    };
  }

  if (
    !user.emailVerificationExpiry ||
    user.emailVerificationExpiry <
      new Date()
  ) {
    return {
      ok: false,
      reason: "expired",
    };
  }

  await prisma.user.update({
    where: {
      id: user.id,
    },

    data: {
      emailVerified: true,

      emailVerificationToken:
        null,

      emailVerificationExpiry:
        null,
    },
  });

  await prisma.hospital.update({
    where: {
      id: user.hospitalId,
    },

    data: {
      accountStatus: "Active",
    },
  });

  return {
    ok: true,
  };
}

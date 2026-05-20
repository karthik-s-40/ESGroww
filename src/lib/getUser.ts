import { cookies } from "next/headers";

import { prisma } from "@/lib/db";

import {
  verifySessionToken,
} from "@/lib/session";

export async function getCurrentUser() {

  // NEXT 15+ FIX

  const cookieStore =
    await cookies();

  const token =
    cookieStore.get(
      "session"
    )?.value;

  if (!token) {
    return null;
  }

  const payload =
    verifySessionToken(token);

  if (!payload) {
    return null;
  }

  const user =
    await prisma.user.findUnique({
      where: {
        id: payload.userId,
      },

      include: {
        hospital: true,
      },
    });

  return user;
}
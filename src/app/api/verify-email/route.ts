import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  completeEmailVerification,
} from "@/lib/complete-email-verification";

export async function GET(
  request: NextRequest
) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    const result = await completeEmailVerification(token);

    if (!result.ok) {
      const param = result.reason === "expired" ? "expired-token" : "invalid-token";

      return NextResponse.redirect(new URL(`/login?error=${param}`, request.url));
    }

    return NextResponse.redirect(new URL("/login?verified=true", request.url));
  } catch (error) {
    console.error("[verify-email route] Failed to verify email:", error);
    return NextResponse.redirect(new URL("/login?error=verification-failed", request.url));
  }
}

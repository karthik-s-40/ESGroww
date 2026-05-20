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
  const token =
    request.nextUrl.searchParams.get(
      "token"
    );

  const result =
    await completeEmailVerification(
      token
    );

  if (!result.ok) {
    const param =
      result.reason === "expired"
        ? "expired-token"
        : "invalid-token";

    return NextResponse.redirect(
      new URL(
        `/login?error=${param}`,
        request.url
      )
    );
  }

  return NextResponse.redirect(
    new URL(
      "/login?verified=true",
      request.url
    )
  );
}

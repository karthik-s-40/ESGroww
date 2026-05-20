import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  verifySessionToken,
} from "@/lib/session";

const protectedRoutes = [
  "/upload",
  "/results",
  "/summary",
];

export function middleware(
  request: NextRequest
) {
  const pathname =
    request.nextUrl.pathname;

  const isProtected =
    protectedRoutes.some((r) =>
      pathname.startsWith(r)
    );

  if (!isProtected) {
    return NextResponse.next();
  }

  const token =
    request.cookies.get(
      "session"
    )?.value;

  if (!token) {
    return NextResponse.redirect(
      new URL(
        "/login",
        request.url
      )
    );
  }

  const payload =
    verifySessionToken(token);

  // DEV FALLBACK
  if (
    !payload &&
    process.env.NODE_ENV ===
      "production"
  ) {
    return NextResponse.redirect(
      new URL(
        "/login",
        request.url
      )
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/upload/:path*",
    "/results/:path*",
    "/summary/:path*",
  ],
};
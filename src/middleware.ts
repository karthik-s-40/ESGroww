import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/session";

const protectedRoutes = [
  "/esg-readiness-platform",
  "/results",
  "/summary",
];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=session_expired", request.url));
  }

  const payload = verifySessionToken(token);

  if (!payload) {
    return NextResponse.redirect(new URL("/login?error=session_expired", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/esg-readiness-platform/:path*",
    "/results/:path*",
    "/summary/:path*",
  ],
};
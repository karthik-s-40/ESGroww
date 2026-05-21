import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const protectedRoutes = [
  "/esg-readiness-platform",
  "/results",
  "/summary",
  "/admin/esg-readiness-platform",
];

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=session_expired", request.url));
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch (err) {
    return NextResponse.redirect(new URL("/login?error=session_expired", request.url));
  }
}

export const config = {
  matcher: [
    "/esg-readiness-platform/:path*",
    "/results/:path*",
    "/summary/:path*",
    "/admin/esg-readiness-platform/:path*",
  ],
};
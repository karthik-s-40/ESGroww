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
  let pathname = request.nextUrl.pathname;
  let isHashed = false;

  if (pathname.startsWith("/h/")) {
    try {
      pathname = atob(pathname.replace("/h/", ""));
      isHashed = true;
    } catch (e) {}
  }

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));

  if (!isProtected) {
    if (isHashed) {
      const url = request.nextUrl.clone();
      url.pathname = pathname;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  const token = request.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=session_expired", request.url));
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    await jwtVerify(token, secret);
    if (isHashed) {
      const url = request.nextUrl.clone();
      url.pathname = pathname;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  } catch (err) {
    return NextResponse.redirect(new URL("/login?error=session_expired", request.url));
  }
}

export const config = {
  matcher: [
    "/h/:path*",
    "/esg-readiness-platform/:path*",
    "/results/:path*",
    "/summary/:path*",
    "/admin/esg-readiness-platform/:path*",
  ],
};
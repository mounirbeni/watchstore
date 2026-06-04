import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import type { SessionData } from "@/lib/session";

const sessionOptions = {
  password: process.env["SESSION_SECRET"] ?? "",
  cookieName: "chronocraft_session",
  cookieOptions: {
    secure: process.env["NODE_ENV"] === "production",
    httpOnly: true,
    sameSite: "lax" as const,
  },
};

function hasSessionConfig(): boolean {
  const password = process.env["SESSION_SECRET"];
  return typeof password === "string" && password.length >= 32;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();
  const isProtected =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/checkout") ||
    pathname === "/cart" ||
    pathname.startsWith("/cart/");

  if (!hasSessionConfig()) {
    if (isProtected) {
      return NextResponse.redirect(new URL(`/login?from=${encodeURIComponent(pathname)}`, request.url));
    }
    return response;
  }

  const session = await getIronSession<SessionData>(request, response, sessionOptions);

  const isLoggedIn = session.isLoggedIn === true;
  const isAdmin = isLoggedIn && session.role === "ADMIN";

  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/login?from=${encodeURIComponent(pathname)}`, request.url));
    }
    if (!isAdmin) return NextResponse.redirect(new URL("/dashboard", request.url));
    return response;
  }

  if (isProtected) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/login?from=${encodeURIComponent(pathname)}`, request.url));
    }
    return response;
  }

  if (pathname === "/login" || pathname === "/register") {
    if (isLoggedIn) return NextResponse.redirect(new URL(isAdmin ? "/admin" : "/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/checkout/:path*",
    "/cart",
    "/cart/:path*",
    "/login",
    "/register",
  ],
};

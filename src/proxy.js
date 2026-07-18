import { NextResponse } from "next/server";

const ADMIN_SESSION_COOKIE = "admin-session";

export function proxy(request) {
  const expectedToken = process.env.ADMIN_SESSION_TOKEN || "";
  const currentToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value || "";
  const isAuthorized = expectedToken.length >= 32 && currentToken === expectedToken;
  const isLoginPage = request.nextUrl.pathname === "/admin";

  if (!isAuthorized && !isLoginPage) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (isAuthorized && isLoginPage) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  const response = NextResponse.next();
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}

export const config = {
  matcher: ["/admin/:path*"]
};

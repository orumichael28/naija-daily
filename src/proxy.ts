import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Admin route guard (Next.js 16 "proxy", formerly "middleware").
 * All /admin/* routes require a valid Supabase session cookie.
 * Returns redirect to /admin/login if no session found.
 * Email validation happens in admin layout server component.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only guard /admin routes; exempt login page and auth callback
  if (
    pathname.startsWith("/admin") &&
    !pathname.startsWith("/admin/login") &&
    pathname !== "/auth/callback"
  ) {
    // Check for any Supabase session cookie
    const allCookies = request.cookies.getAll();
    const hasSession = allCookies.some(
      (c) =>
        c.name.startsWith("sb-") &&
        (c.name.endsWith("-auth-token") || c.name === "sb-access-token")
    );

    if (!hasSession) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

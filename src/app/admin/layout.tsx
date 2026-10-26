import React from "react";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

/**
 * Admin shell layout.
 * Validates that the session user matches ADMIN_EMAIL.
 * Returns 404 for any non-admin request.
 */
async function getAdminSession() {
  const cookieStore = await cookies();
  // Try reading the Supabase session cookie
  const accessToken =
    cookieStore.get("sb-access-token")?.value ??
    cookieStore.get(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split("//")[1]?.split(".")[0]}-auth-token`)?.value;

  if (!accessToken) return null;

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    );
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    return user;
  } catch {
    return null;
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminEmail = process.env.ADMIN_EMAIL;

  // If we can't determine the user or it doesn't match → 404
  // We skip this check on the login page (handled by middleware)
  const user = await getAdminSession();
  if (user && adminEmail && user.email !== adminEmail) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-gray-100">
      {/* Admin header */}
      <header className="bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-editorial font-bold text-lg text-gray-900 dark:text-gray-100">
              Naija Daily
            </Link>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Admin
            </span>
          </div>
          <nav className="flex items-center gap-1 text-xs font-semibold">
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-900 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Calendar
            </Link>
            <Link
              href="/admin/wordle"
              className="px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-900 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Wordle
            </Link>
            <Link
              href="/admin/connections"
              className="px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-900 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Connections
            </Link>
            <Link
              href="/admin/rejected"
              className="px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-900 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Rejected Words
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}


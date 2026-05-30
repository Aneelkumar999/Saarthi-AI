"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Menu, Sparkles } from "lucide-react";
import { navItems } from "@/lib/data";
import { cn } from "@/lib/utils";
import { getStoredUser, getToken, logout } from "@/lib/auth";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(() => {
    if (typeof window !== "undefined") {
      return !!getToken();
    }
    return false;
  });
  const [userPhone, setUserPhone] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return getStoredUser()?.phone ?? null;
    }
    return null;
  });

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
    }
  }, [router]);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mist px-4 text-center">
        <div>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-navy text-white"><Sparkles /></div>
          <p className="mt-4 font-bold text-slate-600">Checking secure session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mist">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 font-black text-navy">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-navy text-white">
              <Sparkles size={20} />
            </span>
            <span>Saarthi AI</span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100",
                  pathname === item.href && "bg-navy text-white hover:bg-navy"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {userPhone && <span className="hidden rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 sm:inline-flex">{userPhone}</span>}
            <button onClick={handleLogout} className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 sm:inline-flex">
              <LogOut size={16} /> Logout
            </button>
            <button className="rounded-xl border border-slate-200 p-2 lg:hidden" aria-label="Open navigation">
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
<<<<<<< HEAD
import { LogOut, Menu, X, Sparkles } from "lucide-react";
import { navItems } from "@/lib/data";
import { cn } from "@/lib/utils";
import { getStoredUser, getToken, logout } from "@/lib/auth";
import { useIsClient } from "@/lib/use-is-client";
=======
import { LogOut, Menu, Sparkles } from "lucide-react";
import { navItems } from "@/lib/data";
import { cn } from "@/lib/utils";
import { getStoredUser, getToken, logout } from "@/lib/auth";
>>>>>>> origin/main

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
<<<<<<< HEAD
  const isClient = useIsClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (isClient && !getToken()) {
      router.replace("/login");
    }
  }, [isClient, router]);

  if (!isClient || !getToken()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mist px-4 text-center">
        <div>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-navy text-white"><Sparkles /></div>
          <p className="mt-4 font-bold text-slate-600">{isClient ? "Redirecting to login..." : "Checking secure session..."}</p>
        </div>
      </div>
    );
  }

  const userPhone = getStoredUser()?.phone ?? null;
=======
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
>>>>>>> origin/main

  function handleLogout() {
    logout();
    router.replace("/login");
  }

<<<<<<< HEAD
=======
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

>>>>>>> origin/main
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
<<<<<<< HEAD
            <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
              <LogOut size={16} /> Logout
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="rounded-xl border border-slate-200 p-2 lg:hidden" aria-label="Open navigation">
=======
            <button onClick={handleLogout} className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 sm:inline-flex">
              <LogOut size={16} /> Logout
            </button>
            <button className="rounded-xl border border-slate-200 p-2 lg:hidden" aria-label="Open navigation">
>>>>>>> origin/main
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>
<<<<<<< HEAD

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
              <span className="font-black text-navy">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="rounded-xl p-2 hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100",
                    pathname === item.href && "bg-navy text-white hover:bg-navy"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-slate-200 px-3 py-4">
              <button onClick={() => { setMobileOpen(false); handleLogout(); }} className="flex w-full items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
        </div>
      )}

=======
>>>>>>> origin/main
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

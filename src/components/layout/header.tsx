"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, LogOut, Building2, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavLink {
  href: string;
  label: string;
}

const publicLinks: NavLink[] = [
  { href: "/search", label: "Find Businesses" },
  { href: "/categories", label: "Categories" },
  { href: "/request", label: "Request Quotes" },
  { href: "/how-it-works", label: "How It Works" },
];

export function Header({ userName }: { userName?: string | null }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#DDE7E2] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2" aria-label="ZimBiz Connect home">
            <img src="/logo.svg" alt="ZimBiz Connect" className="h-9 w-9" />
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-[#064E3B]">ZimBiz</span>
              <span className="text-lg font-semibold text-[#047857]"> Connect</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[#334155] hover:text-[#047857] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {mounted && userName ? (
            <div className="hidden md:flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <form action="/api/auth/logout" method="POST">
                <Button type="submit" variant="ghost" size="sm">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </form>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">
                  <Building2 className="h-4 w-4" />
                  List Your Business
                </Button>
              </Link>
            </div>
          )}

          <button
            className="md:hidden p-2 rounded-lg hover:bg-[#F1F5F4]"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-[#DDE7E2] bg-white">
          <nav className="flex flex-col px-4 py-3 gap-1" aria-label="Mobile navigation">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-lg text-sm font-medium text-[#334155] hover:bg-[#F1F5F4]"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-[#DDE7E2] mt-2 pt-2 flex flex-col gap-2">
              {mounted && userName ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <form action="/api/auth/logout" method="POST">
                    <Button type="submit" variant="ghost" size="sm" className="w-full">
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full">Sign In</Button>
                  </Link>
                  <Link href="/auth/register" onClick={() => setMobileOpen(false)}>
                    <Button size="sm" className="w-full">
                      <Building2 className="h-4 w-4" />
                      List Your Business
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

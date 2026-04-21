"use client";
import Link from "next/link";
import { Menu, X, Zap, LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useUser, useStackApp } from "@stackframe/stack";
import { ThemeToggle } from "@/components/theme-toggle";
import { checkUserIsPro } from "@/app/actions/user";
import { Button } from "@/components/ui/button";
import { UserButton } from "@stackframe/stack";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
const navLinks = [
  { label: "Find Pros", href: "#categories" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Top Rated", href: "#featured" },
  { label: "Reviews", href: "#testimonials" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const user = useUser();
  const app = useStackApp();

  useEffect(() => {
    if (user) {
      checkUserIsPro().then(setIsPro);
    } else {
      setIsPro(false);
    }
  }, [user]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass shadow-lg shadow-black/5" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between sm:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group" id="logo-link">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-md shadow-brand-500/25 transition-transform group-hover:scale-105">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Pro<span className="gradient-text">Near</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 md:flex" id="desktop-nav">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-lg px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-primary/5 hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div
            className="hidden items-center gap-3 md:flex"
            id="desktop-actions"
          >
            <ThemeToggle />
            {user ? (
              <>
                {!isPro && (
                  <Button
                    asChild
                    variant="ghost"
                    className="font-medium hover:bg-primary/5"
                  >
                    <Link href="/dashboard/customer">My Bookings</Link>
                  </Button>
                )}
                {isPro && (
                  <Button
                    asChild
                    variant="outline"
                    className="font-medium border-brand-200 text-brand-600 hover:bg-brand-50 dark:border-brand-800 dark:text-brand-400 dark:hover:bg-brand-950/50"
                  >
                    <Link href="/dashboard/pro">Pro Dashboard</Link>
                  </Button>
                )}
                <UserButton />
              </>
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  className="font-medium hover:bg-primary/5"
                >
                  <Link href={app.urls.signIn}>Sign In</Link>
                </Button>
                <Button
                  asChild
                  className="bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-md shadow-brand-500/25 font-medium transition-all hover:scale-105 hover:shadow-brand-500/40"
                >
                  <Link href={app.urls.signUp}>Join as Pro</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-primary/10"
              onClick={() => setMobileOpen(!mobileOpen)}
              id="mobile-menu-toggle"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`overflow-hidden transition-all duration-300 md:hidden ${
            mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
          id="mobile-menu"
        >
          <div className="glass border-t border-border/50 px-4 pb-6 pt-2">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-foreground/70 transition-colors hover:bg-primary/5 hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="mt-4 flex flex-col gap-2 px-4">
              {user ? (
                <>
                  <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground/80">
                    <User className="h-4 w-4" />
                    <span>
                      {user.displayName || user.primaryEmail || "User"}
                    </span>
                  </div>
                  {!isPro && (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full justify-center"
                      id="mobile-my-bookings-btn"
                    >
                      <Link
                        href="/dashboard/customer"
                        onClick={() => setMobileOpen(false)}
                      >
                        My Bookings
                      </Link>
                    </Button>
                  )}
                  {isPro && (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full justify-center border-brand-200 text-brand-600 dark:border-brand-800 dark:text-brand-400"
                      id="mobile-pro-dashboard-btn"
                    >
                      <Link
                        href="/dashboard/pro"
                        onClick={() => setMobileOpen(false)}
                      >
                        Pro Dashboard
                      </Link>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-center"
                    onClick={() => {
                      user.signOut();
                      setMobileOpen(false);
                    }}
                    id="mobile-sign-out-btn"
                  >
                    <LogOut className="mr-1.5 h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full justify-center"
                    id="mobile-sign-in-btn"
                  >
                    <Link
                      href={app.urls.signIn}
                      onClick={() => setMobileOpen(false)}
                    >
                      Sign In
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="w-full justify-center bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-md shadow-brand-500/25"
                    id="mobile-sign-up-btn"
                  >
                    <Link
                      href={app.urls.signUp}
                      onClick={() => setMobileOpen(false)}
                    >
                      Join as Pro
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

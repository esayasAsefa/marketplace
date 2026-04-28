"use client";
import { UserButton, useStackApp, useUser } from "@stackframe/stack";
import { LogOut, Menu, User, X, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { checkUserIsPro } from "@/app/actions/user";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [authLoaded, setAuthLoaded] = useState(false);
  const user = useUser();
  const app = useStackApp();
  const isProChecked = useRef(false);

  useEffect(() => {
    if (user?.id) {
      // Only check once per user session to avoid repeated server calls
      if (isProChecked.current) {
        setAuthLoaded(true);
        return;
      }
      isProChecked.current = true;
      checkUserIsPro()
        .then((result) => {
          setIsPro(result);
          setAuthLoaded(true);
        })
        .catch(() => setAuthLoaded(true));
    } else if (!user) {
      // user is explicitly null (not loading, just not logged in)
      setIsPro(false);
      setAuthLoaded(true);
      isProChecked.current = false;
    }
    // user === undefined means still loading — keep authLoaded false
  }, [user]);

  // Safety timeout — if StackAuth takes too long, show the default UI
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!authLoaded) setAuthLoaded(true);
    }, 3000);
    return () => clearTimeout(timeout);
  }, [authLoaded]);

  const handleSignOut = async () => {
    try {
      await app.redirectToSignOut();
    } catch {
      window.location.href = "/handler/sign-in";
    }
    setMobileOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-xl border-b border-border/70 shadow-lg shadow-black/5"
          : "bg-background/80 backdrop-blur-md border-b border-border/40"
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
            {!authLoaded ? (
              /* Skeleton placeholders while auth state resolves */
              <div className="flex items-center gap-3">
                <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
                <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
              </div>
            ) : user ? (
              <>
                {!isPro && (
                  <Button
                    asChild
                    variant="outline"
                    className="font-medium border-brand-200 text-brand-600 hover:bg-brand-50 dark:border-brand-800 dark:text-brand-400 dark:hover:bg-brand-950/50"
                  >
                    <Link href="/become-pro">Become Pro</Link>
                  </Button>
                )}
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-9 w-9 rounded-full p-0 flex items-center justify-center relative overflow-hidden bg-muted hover:bg-muted/80 border-border">
                      {user.profileImageUrl ? (
                        <img src={user.profileImageUrl} alt="Avatar" className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl border-border/60 bg-background/95 backdrop-blur-md shadow-xl">
                    <DropdownMenuLabel className="font-normal p-3">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold leading-none">{user.displayName || "User"}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.primaryEmail}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border/60" />
                    <DropdownMenuItem asChild className="cursor-pointer p-2 focus:bg-primary/5 rounded-lg mx-1 my-1">
                      <Link href="/handler/account-settings">
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        Account Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border/60" />
                    <DropdownMenuItem
                      className="cursor-pointer p-2 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950/30 rounded-lg mx-1 my-1 text-red-600 dark:text-red-400"
                      onClick={async () => {
                        try {
                          await user.signOut();
                        } catch {
                          // Bypass StackAuth API 500 error popup by clearing session locally via redirect
                          window.location.href = "/handler/sign-in";
                        }
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
          <div className="bg-background/95 backdrop-blur-xl border border-border/60 rounded-2xl mx-2 mt-2 px-4 pb-6 pt-2 shadow-2xl shadow-black/10">
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
              {!authLoaded ? (
                <div className="flex flex-col gap-2">
                  <div className="h-8 w-full animate-pulse rounded-md bg-muted" />
                  <div className="h-8 w-full animate-pulse rounded-md bg-muted" />
                </div>
              ) : user ? (
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
                      className="w-full justify-center border-brand-200 text-brand-600 dark:border-brand-800 dark:text-brand-400"
                      id="mobile-become-pro-btn"
                    >
                      <Link
                        href="/become-pro"
                        onClick={() => setMobileOpen(false)}
                      >
                        Become Pro
                      </Link>
                    </Button>
                  )}
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
                    onClick={async () => {
                      await handleSignOut();
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

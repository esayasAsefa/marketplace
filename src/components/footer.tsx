"use client";

import { Zap, Phone } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  "For Customers": [
    { label: "Find a Pro", href: "/#categories" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Categories", href: "#categories" },
    { label: "Pricing", href: "/" },
    { label: "FAQ", href: "/" },
  ],
  "For Professionals": [
    { label: "Join as a Pro", href: "#join" },
    { label: "Pro Dashboard", href: "/" },
    { label: "Resources", href: "/" },
    { label: "Success Stories", href: "#testimonials" },
    { label: "Pro Support", href: "/" },
  ],
  Company: [
    { label: "About Us", href: "/" },
    { label: "Careers", href: "/" },
    { label: "Blog", href: "/" },
    { label: "Press", href: "/" },
    { label: "Contact", href: "/" },
  ],
  Legal: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Accessibility", href: "/accessibility" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-muted">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Top section */}
        <div className="grid gap-12 lg:grid-cols-6">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="/" className="flex items-center gap-2 group">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden transition-transform group-hover:scale-105 bg-gradient-to-br from-brand-500 to-brand-700 shadow-md shadow-brand-500/25">
                <Zap className="h-5 w-5 text-white absolute" />
                <img
                  src="/worklync.png"
                  alt="WorkLync"
                  className="h-full w-full object-cover relative z-10"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
              <span className="text-xl font-bold tracking-tight">
                WORK<span className="gradient-text">LYNC</span>
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Connecting Professionals & Clients. Your one-stop platform for
              finding, booking, and reviewing services in your area.
            </p>
            <div className="mt-3 text-sm">
              <a
                href="tel:+251920906223"
                aria-label="Call WORKLYNC"
                className="inline-flex items-center gap-2 font-medium text-foreground transition-colors hover:underline"
              >
                <Phone className="h-4 w-4 text-muted-foreground" />
                +251920906223
              </a>
            </div>
            {/* Social Links */}
            <div className="mt-6 flex gap-3">
              {[
                { name: "X", url: "https://x.com/esayas_93" },
                { name: "FB", url: "https://facebook.com/yourprofile" },
                { name: "IG", url: "https://www.instagram.com/esayas_93?igsh=NmFtbnN0bzVuYjdw" },
                { name: "LI", url: "https://www.linkedin.com/in/esayas-asefa-3295a4368/" }
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground ring-1 ring-border/50 transition-all hover:bg-brand-50 hover:text-brand-600 hover:ring-brand-200 dark:hover:bg-brand-950/30 dark:hover:text-brand-400"
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold">{title}</h4>
              <ul className="mt-4 flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-10 bg-border/50" />

        {/* Bottom  */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} WorkLync. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="tel:+251920906223"
              aria-label="Call WORKLYNC"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              +251920906223
            </a>
            <a
              href="/privacy"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Privacy
            </a>
            <a
              href="/terms"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Terms
            </a>
            <a
              href="/cookies"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

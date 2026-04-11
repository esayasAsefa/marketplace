"use client";

import { Clock, MapPin, Search, Shield, Star, Users } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const popularSearches = [
  "Electrician",
  "Plumber",
  "Math Tutor",
  "Web Developer",
  "House Cleaner",
  "Painter",
];

const trustBadges = [
  { icon: Shield, label: "Verified Pros" },
  { icon: Star, label: "5-Star Rated" },
  { icon: Clock, label: "Same Day Service" },
  { icon: Users, label: "10K+ Professionals" },
];

export function HeroSection() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");

  return (
    <section
      id="hero"
      className="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-24 lg:pt-40 lg:pb-32"
    >
      {/* Background Decoration */}
      <div className="absolute inset-0 hero-gradient mesh-gradient" />
      <div className="absolute top-20 -left-32 h-72 w-72 rounded-full bg-brand-400/10 blur-3xl animate-float" />
      <div className="absolute -right-20 bottom-20 h-96 w-96 rounded-full bg-purple-400/10 blur-3xl animate-float animation-delay-300" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-amber-300/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Top Badge */}
          <div className="animate-fade-up mb-6 flex justify-center">
            <Badge
              variant="secondary"
              className="gap-2 rounded-full px-4 py-1.5 text-sm font-medium shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              2,847 pros available near you
            </Badge>
          </div>

          {/* Headline */}
          <h1 className="animate-fade-up animation-delay-100 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Find Trusted Local{" "}
            <span className="gradient-text">Professionals</span>{" "}
            <span className="block sm:inline">Near You</span>
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-up animation-delay-200 mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Connect with vetted electricians, plumbers, tutors, and developers
            in your area. Book in minutes, not days.
          </p>

          {/* Search Bar */}
          <div className="animate-fade-up animation-delay-300 mx-auto mt-10 max-w-2xl">
            <div className="glass rounded-2xl p-2 shadow-xl shadow-brand-500/5 animate-pulse-glow">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="search-service"
                    type="text"
                    placeholder="What service do you need?"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="h-12 rounded-xl border-0 bg-background/50 pl-11 text-base shadow-none placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-brand-500/30"
                  />
                </div>
                <div className="relative flex-1 sm:max-w-[200px]">
                  <MapPin className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="search-location"
                    type="text"
                    placeholder="Your location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="h-12 rounded-xl border-0 bg-background/50 pl-11 text-base shadow-none placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-brand-500/30"
                  />
                </div>
                <Button
                  id="search-button"
                  size="lg"
                  className="h-12 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-8 text-white shadow-lg shadow-brand-500/25 transition-all hover:shadow-xl hover:shadow-brand-500/30 hover:brightness-110"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>
            </div>

            {/* Popular Searches */}
            <div className="animate-fade-up animation-delay-400 mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Popular:
              </span>
              {popularSearches.map((search) => (
                <button
                  key={search}
                  type="button"
                  onClick={() => setQuery(search)}
                  className="rounded-full bg-background/60 px-3 py-1 text-xs font-medium text-foreground/70 ring-1 ring-border/50 transition-all hover:bg-background hover:text-foreground hover:ring-brand-300 hover:shadow-sm"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>

          {/* Trust Badges */}
          <div className="animate-fade-up animation-delay-500 mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-8">
            {trustBadges.map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <badge.icon className="h-4 w-4 text-brand-500" />
                <span className="font-medium">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

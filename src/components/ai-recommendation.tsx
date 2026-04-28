"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useUser } from "@stackframe/stack";

export function AiRecommendation() {
  const user = useUser();
  const [rec, setRec] = useState<{ category: string; reason: string; searchQuery: string } | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!user?.id || hasFetched.current) return;
    hasFetched.current = true;
    async function fetchRec() {
      try {
        const res = await fetch("/api/ai/recommendations");
        const data = await res.json();
        if (data.recommendations) {
          setRec(data.recommendations);
        }
      } catch (e) {
        console.error("Failed to load AI recommendations", e);
      }
    }
    fetchRec();
  }, [user?.id]);

  if (!rec) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12 mb-8 animate-fade-up">
      <div className="rounded-3xl bg-gradient-to-r from-brand-900 to-brand-800 p-1 relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 mesh-gradient opacity-20" />
        <div className="relative bg-card rounded-[22px] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 justify-between">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center shrink-0">
              <Sparkles className="h-6 w-6 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                Recommended for You
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">AI</span>
              </h3>
              <p className="text-muted-foreground">{rec.reason}</p>
            </div>
          </div>
          <Link href={`/services?category=${rec.category}&q=${encodeURIComponent(rec.searchQuery)}`}>
            <button className="shrink-0 flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 font-medium transition-all hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap">
              Find a {rec.category}
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

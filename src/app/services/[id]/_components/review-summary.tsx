"use client";

import { useEffect, useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

export function ReviewSummary({ serviceId }: { serviceId: number }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch("/api/ai/review-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ serviceId }),
        });
        const data = await res.json();
        
        if (data.summary) {
          setSummary(data.summary);
        } else {
           // Not enough reviews
           setSummary(null);
        }
      } catch (err) {
        console.error("Failed to load review summary", err);
        setError("Failed to generate summary");
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, [serviceId]);

  if (loading) {
    return (
      <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900 rounded-2xl p-4 flex items-center justify-center gap-2 text-sm text-muted-foreground animate-pulse">
        <Loader2 className="h-4 w-4 animate-spin" />
        Generating AI review summary...
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200/50 dark:border-amber-900/50 rounded-2xl p-5 mb-6 shadow-sm">
      <div className="flex items-center gap-2 mb-2 font-semibold text-amber-800 dark:text-amber-400">
        <Sparkles className="h-4 w-4 text-amber-500" />
        AI Review Summary
      </div>
      <p className="text-sm text-foreground/80 leading-relaxed italic">
        "{summary}"
      </p>
    </div>
  );
}

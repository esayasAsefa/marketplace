"use client";

import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Suspense } from "react";

const CATEGORIES = [
  { id: "all", label: "All Categories" },
  { id: "electrician", label: "Electrician" },
  { id: "plumber", label: "Plumber" },
  { id: "tutor", label: "Tutor" },
  { id: "developer", label: "Developer" },
  { id: "painter", label: "Painter" },
  { id: "carpenter", label: "Carpenter" },
  { id: "it-support", label: "IT Support" },
  { id: "mover", label: "Mover" },
  { id: "barber", label: "Barber" },
  { id: "photographer", label: "Photographer" },
  { id: "gardener", label: "Gardener" },
  { id: "security", label: "Security" },
];

function SearchFiltersInner() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const cat = searchParams.get("category") || "all";

  return (
    <form
      action="/services"
      method="GET"
      className="flex flex-col sm:flex-row gap-4 items-center w-full max-w-3xl mx-auto mb-12 p-2 rounded-2xl sm:rounded-full bg-card border border-border shadow-sm shadow-black/5"
    >
      <div className="flex-1 w-full relative sm:border-r border-border/50">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={q}
          placeholder="Search by title or description..."
          className="w-full pl-10 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
        />
      </div>

      <div className="w-full sm:w-48 relative shrink-0">
        <Select name="category" defaultValue={cat}>
          <SelectTrigger className="w-full border-0 bg-transparent focus:ring-0 focus:ring-offset-0 data-[state=open]:bg-muted/50 rounded-xl">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        type="submit"
        className="w-full sm:w-auto rounded-xl sm:rounded-full px-8 bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-md shadow-brand-500/20 hover:scale-105 transition-all"
      >
        Search
      </Button>
    </form>
  );
}

export function SearchFilters() {
  return (
    <Suspense fallback={<div className="h-16 w-full animate-pulse bg-muted rounded-full mb-12" />}>
      <SearchFiltersInner />
    </Suspense>
  );
}

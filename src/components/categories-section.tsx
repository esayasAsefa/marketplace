import {
  BookOpen,
  Camera,
  Code2,
  Droplets,
  Hammer,
  Leaf,
  Paintbrush,
  Scissors,
  ShieldCheck,
  Truck,
  Wifi,
  Wrench,
} from "lucide-react";
import db from "@/db";
import { services } from "@/db/schema";
import { sql } from "drizzle-orm";
import { cacheGet, cacheSet, CACHE_KEYS, TTL } from "@/cache";

const categories = [
  {
    id: "electrician",
    icon: Wrench,
    name: "Electricians",
    color: "from-amber-400 to-orange-500",
    bgLight: "bg-amber-50",
    bgDark: "dark:bg-amber-950/30",
    textColor: "text-amber-600 dark:text-amber-400",
  },
  {
    id: "plumber",
    icon: Droplets,
    name: "Plumbers",
    color: "from-blue-400 to-cyan-500",
    bgLight: "bg-blue-50",
    bgDark: "dark:bg-blue-950/30",
    textColor: "text-blue-600 dark:text-blue-400",
  },
  {
    id: "tutor",
    icon: BookOpen,
    name: "Tutors",
    color: "from-emerald-400 to-teal-500",
    bgLight: "bg-emerald-50",
    bgDark: "dark:bg-emerald-950/30",
    textColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "developer",
    icon: Code2,
    name: "Developers",
    color: "from-violet-400 to-purple-500",
    bgLight: "bg-violet-50",
    bgDark: "dark:bg-violet-950/30",
    textColor: "text-violet-600 dark:text-violet-400",
  },
  {
    id: "painter",
    icon: Paintbrush,
    name: "Painters",
    color: "from-pink-400 to-rose-500",
    bgLight: "bg-pink-50",
    bgDark: "dark:bg-pink-950/30",
    textColor: "text-pink-600 dark:text-pink-400",
  },
  {
    id: "carpenter",
    icon: Hammer,
    name: "Carpenters",
    color: "from-orange-400 to-red-500",
    bgLight: "bg-orange-50",
    bgDark: "dark:bg-orange-950/30",
    textColor: "text-orange-600 dark:text-orange-400",
  },
  {
    id: "it-support",
    icon: Wifi,
    name: "IT Support",
    color: "from-indigo-400 to-blue-500",
    bgLight: "bg-indigo-50",
    bgDark: "dark:bg-indigo-950/30",
    textColor: "text-indigo-600 dark:text-indigo-400",
  },
  {
    id: "mover",
    icon: Truck,
    name: "Movers",
    color: "from-slate-400 to-gray-500",
    bgLight: "bg-slate-50",
    bgDark: "dark:bg-slate-950/30",
    textColor: "text-slate-600 dark:text-slate-400",
  },
  {
    id: "barber",
    icon: Scissors,
    name: "Barbers",
    color: "from-fuchsia-400 to-pink-500",
    bgLight: "bg-fuchsia-50",
    bgDark: "dark:bg-fuchsia-950/30",
    textColor: "text-fuchsia-600 dark:text-fuchsia-400",
  },
  {
    id: "photographer",
    icon: Camera,
    name: "Photographers",
    color: "from-sky-400 to-blue-500",
    bgLight: "bg-sky-50",
    bgDark: "dark:bg-sky-950/30",
    textColor: "text-sky-600 dark:text-sky-400",
  },
  {
    id: "gardener",
    icon: Leaf,
    name: "Gardeners",
    color: "from-lime-400 to-green-500",
    bgLight: "bg-lime-50",
    bgDark: "dark:bg-lime-950/30",
    textColor: "text-lime-600 dark:text-lime-400",
  },
  {
    id: "security",
    icon: ShieldCheck,
    name: "Security",
    color: "from-teal-400 to-cyan-500",
    bgLight: "bg-teal-50",
    bgDark: "dark:bg-teal-950/30",
    textColor: "text-teal-600 dark:text-teal-400",
  },
];

export async function CategoriesSection() {
  let countMap: Record<string, number> = {};

  // Try Redis cache first
  const cached = await cacheGet<Record<string, number>>(CACHE_KEYS.categoryCounts);
  if (cached) {
    countMap = cached;
  } else {
    try {
      const serviceCounts = await db
        .select({
          categoryId: services.categoryId,
          count: sql<number>`count(${services.id})`.mapWith(Number),
        })
        .from(services)
        .groupBy(services.categoryId);

      countMap = Object.fromEntries(
        serviceCounts.map((sc) => [sc.categoryId, sc.count])
      );

      // Store in Redis
      await cacheSet(CACHE_KEYS.categoryCounts, countMap, TTL.categoryCounts);
    } catch (error) {
      console.warn("CategoriesSection DB fetch failed, using fallback data. Error:", error instanceof Error ? error.message : error);
      // Fallback data for offline development
      countMap = {
        electrician: 12,
        plumber: 8,
        tutor: 15,
        developer: 24,
        painter: 6,
        carpenter: 9,
      };
    }
  }

  return (
    <section id="categories" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand-500">
            Browse Services
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Explore Service Categories
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From home repairs to tech support — find the right professional for
            any job, big or small.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {categories.map((category, i) => {
            const count = countMap[category.id] || 0;
            return (
              <a
                href={`/services?category=${category.id}`}
                key={category.name}
                className={`group relative flex flex-col items-center justify-center text-center gap-3 rounded-2xl border border-border/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/5 dark:hover:border-brand-800 ${category.bgLight} ${category.bgDark}`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {/* Icon */}
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${category.color} shadow-lg transition-transform duration-300 group-hover:scale-110`}
                >
                  <category.icon className="h-6 w-6 text-white" />
                </div>

                {/* Name */}
                <span className="text-sm font-semibold">{category.name}</span>

                {/* Count */}
                <span className={`text-xs font-medium ${category.textColor}`}>
                  {count} {count === 1 ? 'pro' : 'pros'}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Code2,
  Droplets,
  Hammer,
  MapPin,
  Paintbrush,
  Star,
  Wrench,
  Wifi,
  Truck,
  Scissors,
  Camera,
  Leaf,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Map catergories to icons and colors
const categoryMeta: Record<string, { icon: any; color: string }> = {
  electrician: { icon: Wrench, color: "from-amber-400 to-orange-500" },
  plumber: { icon: Droplets, color: "from-blue-400 to-cyan-500" },
  tutor: { icon: BookOpen, color: "from-emerald-400 to-teal-500" },
  developer: { icon: Code2, color: "from-violet-400 to-purple-500" },
  painter: { icon: Paintbrush, color: "from-pink-400 to-rose-500" },
  carpenter: { icon: Hammer, color: "from-orange-400 to-red-500" },
  "it-support": { icon: Wifi, color: "from-indigo-400 to-blue-500" },
  mover: { icon: Truck, color: "from-slate-400 to-gray-500" },
  barber: { icon: Scissors, color: "from-fuchsia-400 to-pink-500" },
  photographer: { icon: Camera, color: "from-sky-400 to-blue-500" },
  gardener: { icon: Leaf, color: "from-lime-400 to-green-500" },
  security: { icon: ShieldCheck, color: "from-teal-400 to-cyan-500" },
};

export async function FeaturedPros() {
  const featuredServices = [
    { id: 1, title: "Master Home Electrician", price: 6500, address: "Downtown", categoryId: "electrician", proName: "Marcus Johnson", proImage: null, verified: true },
    { id: 2, title: "Licensed Plumber", price: 5500, address: "Midtown", categoryId: "plumber", proName: "Sarah Chen", proImage: null, verified: true },
    { id: 3, title: "Mathematics Tutor", price: 4500, address: "Online", categoryId: "tutor", proName: "Amara Osei", proImage: null, verified: true },
  ];

  return (
    <section id="featured" className="relative py-20 sm:py-28 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand-500">
            Top Professionals
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Meet Our Highest Rated Pros
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            These professionals consistently deliver exceptional service and
            maintain outstanding ratings.
          </p>
        </div>

        {/* Pros Grid */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredServices.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No pros have listed services yet. Be the first!
            </div>
          ) : (
            featuredServices.map((pro) => {
              const meta = categoryMeta[pro.categoryId] || categoryMeta.electrician;
              const initials = pro.proName
                ? pro.proName.substring(0, 2).toUpperCase()
                : "PR";
              const hourlyRate = `$${(pro.price / 100).toFixed(2)}`;
              
              // Mapped mock ratings since we don't have review aggregations yet
              const mockRating = 4.8;
              const mockReviews = 12;

              return (
                <div
                  key={pro.id}
                  className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/5"
                >
                  {/* Top Badge */}
                  <div className="absolute right-4 top-4 z-10">
                    <Badge className="bg-gradient-to-r from-amber-400 to-amber-500 text-white border-0 shadow-md shadow-amber-500/20">
                      <Star className="mr-1 h-3 w-3" />
                      Top Rated
                    </Badge>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    {/* Avatar + Info */}
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      {pro.proImage ? (
                        <img
                          src={pro.proImage}
                          alt={pro.proName || ""}
                          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-105 object-cover"
                        />
                      ) : (
                        <div
                          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${meta.color} text-lg font-bold text-white shadow-lg transition-transform duration-300 group-hover:scale-105`}
                        >
                          {initials}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate font-bold">
                            {pro.proName || "Anonymous Pro"}
                          </h3>
                          {pro.verified && (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {pro.title}
                        </p>

                        {/* Rating */}
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={`star-${pro.id}-${i}`}
                                className={`h-3.5 w-3.5 ${
                                  i < Math.floor(mockRating)
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-border"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-semibold">{mockRating}</span>
                          <span className="text-xs text-muted-foreground">
                            ({mockReviews})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Location & Rate */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {pro.address || "Local Area"}
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-brand-600 dark:text-brand-400">
                          {hourlyRate}
                        </span>
                        <span className="text-xs text-muted-foreground">/hr</span>
                      </div>
                    </div>

                    {/* Specialties */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground capitalize">
                        {pro.categoryId.replace("-", " ")}
                      </span>
                    </div>

                    {/* Action */}
                    <Link href={`/services`}>
                      <Button
                        variant="outline"
                        className="mt-5 w-full rounded-xl transition-all duration-300 group-hover:border-brand-300 group-hover:bg-brand-50 group-hover:text-brand-700 dark:group-hover:border-brand-700 dark:group-hover:bg-brand-950/30 dark:group-hover:text-brand-300"
                      >
                        View Profile
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* View All CTA */}
        <div className="mt-12 text-center">
          <Link href="/services">
            <Button
              size="lg"
              className="rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-8 text-white shadow-lg shadow-brand-500/25 transition-all hover:shadow-xl hover:shadow-brand-500/30 hover:brightness-110"
            >
              Browse All Professionals
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

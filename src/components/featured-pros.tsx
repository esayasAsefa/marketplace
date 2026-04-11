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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const professionals = [
  {
    name: "Marcus Johnson",
    title: "Master Electrician",
    icon: Wrench,
    rating: 4.9,
    reviews: 127,
    location: "Downtown",
    hourlyRate: "$65",
    specialties: ["Rewiring", "Smart Home", "Industrial"],
    verified: true,
    topRated: true,
    avatarColor: "from-amber-400 to-orange-500",
    initials: "MJ",
  },
  {
    name: "Sarah Chen",
    title: "Licensed Plumber",
    icon: Droplets,
    rating: 4.8,
    reviews: 98,
    location: "Midtown",
    hourlyRate: "$55",
    specialties: ["Emergency", "Renovation", "Drain"],
    verified: true,
    topRated: true,
    avatarColor: "from-blue-400 to-cyan-500",
    initials: "SC",
  },
  {
    name: "Dr. Amara Osei",
    title: "Mathematics Tutor",
    icon: BookOpen,
    rating: 5.0,
    reviews: 203,
    location: "Online & Local",
    hourlyRate: "$45",
    specialties: ["SAT Prep", "Calculus", "Algebra"],
    verified: true,
    topRated: true,
    avatarColor: "from-emerald-400 to-teal-500",
    initials: "AO",
  },
  {
    name: "James Rivera",
    title: "Full-Stack Developer",
    icon: Code2,
    rating: 4.9,
    reviews: 156,
    location: "Remote & Local",
    hourlyRate: "$85",
    specialties: ["React", "Node.js", "Mobile"],
    verified: true,
    topRated: false,
    avatarColor: "from-violet-400 to-purple-500",
    initials: "JR",
  },
  {
    name: "Linda Park",
    title: "Interior Painter",
    icon: Paintbrush,
    rating: 4.7,
    reviews: 84,
    location: "Eastside",
    hourlyRate: "$40",
    specialties: ["Interior", "Murals", "Cabinet"],
    verified: true,
    topRated: false,
    avatarColor: "from-pink-400 to-rose-500",
    initials: "LP",
  },
  {
    name: "Tom Bradley",
    title: "Carpenter & Woodworker",
    icon: Hammer,
    rating: 4.8,
    reviews: 112,
    location: "Westside",
    hourlyRate: "$70",
    specialties: ["Custom Furniture", "Decks", "Trim"],
    verified: true,
    topRated: true,
    avatarColor: "from-orange-400 to-red-500",
    initials: "TB",
  },
];

export function FeaturedPros() {
  return (
    <section id="featured" className="relative py-20 sm:py-28">
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
          {professionals.map((pro) => (
            <div
              key={pro.name}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/5"
            >
              {/* Top Badge */}
              {pro.topRated && (
                <div className="absolute right-4 top-4 z-10">
                  <Badge className="bg-gradient-to-r from-amber-400 to-amber-500 text-white border-0 shadow-md shadow-amber-500/20">
                    <Star className="mr-1 h-3 w-3" />
                    Top Rated
                  </Badge>
                </div>
              )}

              {/* Card Content */}
              <div className="p-6">
                {/* Avatar + Info */}
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${pro.avatarColor} text-lg font-bold text-white shadow-lg transition-transform duration-300 group-hover:scale-105`}
                  >
                    {pro.initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-bold">{pro.name}</h3>
                      {pro.verified && (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{pro.title}</p>

                    {/* Rating */}
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={`star-${pro.name}-${i}`}
                            className={`h-3.5 w-3.5 ${
                              i < Math.floor(pro.rating)
                                ? "fill-amber-400 text-amber-400"
                                : "text-border"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold">
                        {pro.rating}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({pro.reviews})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Location & Rate */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {pro.location}
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-brand-600 dark:text-brand-400">
                      {pro.hourlyRate}
                    </span>
                    <span className="text-xs text-muted-foreground">/hr</span>
                  </div>
                </div>

                {/* Specialties */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {pro.specialties.map((spec) => (
                    <span
                      key={spec}
                      className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Action */}
                <Button
                  variant="outline"
                  className="mt-5 w-full rounded-xl transition-all duration-300 group-hover:border-brand-300 group-hover:bg-brand-50 group-hover:text-brand-700 dark:group-hover:border-brand-700 dark:group-hover:bg-brand-950/30 dark:group-hover:text-brand-300"
                >
                  View Profile
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* View All CTA */}
        <div className="mt-12 text-center">
          <Button
            size="lg"
            className="rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-8 text-white shadow-lg shadow-brand-500/25 transition-all hover:shadow-xl hover:shadow-brand-500/30 hover:brightness-110"
          >
            Browse All Professionals
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}

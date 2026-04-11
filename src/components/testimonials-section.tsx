import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "Found an amazing electrician within 10 minutes. He came the same day and fixed everything. Will definitely use ProNear again!",
    name: "Emily Watson",
    role: "Homeowner",
    rating: 5,
    initials: "EW",
    color: "from-pink-400 to-rose-500",
  },
  {
    quote:
      "As a freelance developer, ProNear has been a game-changer. I get consistent leads from quality clients in my area. My bookings tripled!",
    name: "David Kim",
    role: "Full-Stack Developer",
    rating: 5,
    initials: "DK",
    color: "from-violet-400 to-purple-500",
  },
  {
    quote:
      "My daughter's math grades went from C to A+ thanks to the tutor we found here. The review system made it easy to pick the right person.",
    name: "Maria Garcia",
    role: "Parent",
    rating: 5,
    initials: "MG",
    color: "from-emerald-400 to-teal-500",
  },
  {
    quote:
      "Emergency plumbing situation on a Sunday and I had a licensed plumber at my door in 30 minutes. Incredible service!",
    name: "Robert Taylor",
    role: "Apartment Renter",
    rating: 5,
    initials: "RT",
    color: "from-blue-400 to-cyan-500",
  },
  {
    quote:
      "The booking system is seamless. I love being able to see real-time availability and book instantly without phone calls.",
    name: "Aisha Mohammed",
    role: "Busy Professional",
    rating: 5,
    initials: "AM",
    color: "from-amber-400 to-orange-500",
  },
  {
    quote:
      "Joined as a carpenter 6 months ago and now have a full schedule. The platform really helps local craftspeople grow their business.",
    name: "Carlos Mendez",
    role: "Master Carpenter",
    rating: 5,
    initials: "CM",
    color: "from-orange-400 to-red-500",
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand-500">
            Testimonials
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Loved by Thousands
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Don&apos;t just take our word for it — hear from the people who use
            ProNear every day.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="group relative flex flex-col rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Quote icon */}
              <Quote className="mb-4 h-8 w-8 text-brand-200 dark:text-brand-800" />

              {/* Stars */}
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star
                    key={`${t.name}-star-${i}`}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              {/* Quote text */}
              <p className="flex-1 text-sm leading-relaxed text-foreground/80">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="mt-6 flex items-center gap-3 border-t border-border/50 pt-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${t.color} text-sm font-bold text-white`}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

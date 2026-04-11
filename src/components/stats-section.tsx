import { CalendarCheck, MapPin, Star, Users } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "10,000+",
    label: "Verified Professionals",
    color: "text-brand-500",
  },
  {
    icon: Star,
    value: "4.8",
    label: "Average Rating",
    color: "text-amber-500",
  },
  {
    icon: CalendarCheck,
    value: "50,000+",
    label: "Jobs Completed",
    color: "text-emerald-500",
  },
  {
    icon: MapPin,
    value: "120+",
    label: "Cities Covered",
    color: "text-violet-500",
  },
];

export function StatsSection() {
  return (
    <section id="stats" className="relative py-16 sm:py-20 bg-muted/30">
      <div className="absolute inset-0 mesh-gradient opacity-30" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group flex flex-col items-center text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-card shadow-md ring-1 ring-border/50 transition-transform duration-300 group-hover:scale-110">
                <stat.icon className={`h-7 w-7 ${stat.color}`} />
              </div>
              <div className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                {stat.value}
              </div>
              <div className="mt-1 text-sm font-medium text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

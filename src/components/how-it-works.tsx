import { CalendarCheck, Search, ThumbsUp } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Search,
    title: "Search & Discover",
    description:
      "Tell us what you need and where you are. Our smart matching finds the best local professionals for your job.",
    color: "from-brand-500 to-brand-600",
    shadow: "shadow-brand-500/20",
  },
  {
    step: "02",
    icon: CalendarCheck,
    title: "Book Instantly",
    description:
      "Compare profiles, read verified reviews, and book your preferred professional. Pick a time that works for you.",
    color: "from-emerald-500 to-teal-600",
    shadow: "shadow-emerald-500/20",
  },
  {
    step: "03",
    icon: ThumbsUp,
    title: "Get It Done",
    description:
      "Your professional arrives, completes the job, and you pay securely through the platform. Leave a review to help others.",
    color: "from-amber-500 to-orange-600",
    shadow: "shadow-amber-500/20",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-20 sm:py-28 bg-muted/30">
      {/* Background decoration */}
      <div className="absolute inset-0 mesh-gradient opacity-50" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand-500">
            Simple Process
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Getting help has never been easier. Three simple steps to connect
            with the right professional.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.step} className="relative">
              {/* Connector line (desktop only) */}
              {i < steps.length - 1 && (
                <div className="absolute right-0 top-16 hidden h-0.5 w-full translate-x-1/2 bg-gradient-to-r from-border to-transparent md:block" />
              )}

              <div className="group relative flex flex-col items-center rounded-2xl border border-border/50 bg-card p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                {/* Step number */}
                <div className="absolute -top-4 left-6 flex h-8 items-center rounded-full bg-background px-3 text-xs font-bold text-muted-foreground ring-1 ring-border">
                  Step {step.step}
                </div>

                {/* Icon */}
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} shadow-lg ${step.shadow} transition-transform duration-300 group-hover:scale-110`}
                >
                  <step.icon className="h-8 w-8 text-white" />
                </div>

                {/* Title */}
                <h3 className="mt-6 text-xl font-bold">{step.title}</h3>

                {/* Description */}
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

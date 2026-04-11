import { ArrowRight, Briefcase, Shield, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  { icon: Users, text: "Access thousands of customers" },
  { icon: TrendingUp, text: "Grow your business 3x faster" },
  { icon: Shield, text: "Secure, guaranteed payments" },
  { icon: Briefcase, text: "Set your own schedule & rates" },
];

export function CTASection() {
  return (
    <section id="join" className="relative overflow-hidden py-20 sm:py-28">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 animate-gradient" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />

      {/* Decorative blobs */}
      <div className="absolute -left-20 top-10 h-60 w-60 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-white/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 ring-1 ring-white/20 backdrop-blur-sm">
            <Briefcase className="h-4 w-4" />
            For Professionals
          </span>

          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Turn Your Skills Into a
            <br />
            <span className="text-amber-300">Thriving Business</span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/75">
            Join thousands of professionals already growing their client base on
            ProNear. Free to join, no hidden fees.
          </p>

          {/* Benefits */}
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {benefits.map((b) => (
              <div
                key={b.text}
                className="flex items-center gap-3 rounded-xl bg-white/10 px-5 py-3.5 text-left backdrop-blur-sm ring-1 ring-white/10 transition-colors hover:bg-white/15"
              >
                <b.icon className="h-5 w-5 shrink-0 text-amber-300" />
                <span className="text-sm font-medium text-white">{b.text}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              className="w-full rounded-xl bg-white px-8 text-brand-700 shadow-xl transition-all hover:bg-white/90 hover:shadow-2xl sm:w-auto"
            >
              Get Started — It&apos;s Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full rounded-xl border-white/30 bg-transparent px-8 text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/50 sm:w-auto"
            >
              Learn More
            </Button>
          </div>

          <p className="mt-6 text-sm text-white/50">
            No credit card required · Free forever for basic plan · Cancel
            anytime
          </p>
        </div>
      </div>
    </section>
  );
}

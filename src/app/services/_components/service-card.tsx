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

type ServiceCardProps = {
  pro: {
    id: number;
    title: string;
    price: number;
    address: string | null;
    categoryId: string;
    proName: string | null;
    proImage: string | null;
    verified: boolean;
  };
};

export function ServiceCard({ pro }: ServiceCardProps) {
  const meta = categoryMeta[pro.categoryId] || categoryMeta.electrician;
  const initials = pro.proName
    ? pro.proName.substring(0, 2).toUpperCase()
    : "PR";
  const hourlyRate = `$${(pro.price / 100).toFixed(2)}`;

  // Mapped mock ratings since we don't have review aggregations yet
  const mockRating = 4.8;
  const mockReviews = 12;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/5">
      {/* Card Content */}
      <div className="p-6 flex flex-col h-full">
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
            <p className="text-sm text-muted-foreground line-clamp-2">
              {pro.title}
            </p>

            {/* Rating */}
            <div className="mt-1.5 flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
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

        <div className="flex-1"></div>

        {/* Action */}
        <Link href={`/services/${pro.id}`}>
          <Button
            variant="outline"
            className="mt-5 w-full rounded-xl transition-all duration-300 group-hover:border-brand-300 group-hover:bg-brand-50 group-hover:text-brand-700 dark:group-hover:border-brand-700 dark:group-hover:bg-brand-950/30 dark:group-hover:text-brand-300"
          >
            Request Booking
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

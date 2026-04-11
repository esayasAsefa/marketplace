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

const categories = [
  {
    icon: Wrench,
    name: "Electricians",
    count: "420+",
    color: "from-amber-400 to-orange-500",
    bgLight: "bg-amber-50",
    bgDark: "dark:bg-amber-950/30",
    textColor: "text-amber-600 dark:text-amber-400",
  },
  {
    icon: Droplets,
    name: "Plumbers",
    count: "380+",
    color: "from-blue-400 to-cyan-500",
    bgLight: "bg-blue-50",
    bgDark: "dark:bg-blue-950/30",
    textColor: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: BookOpen,
    name: "Tutors",
    count: "560+",
    color: "from-emerald-400 to-teal-500",
    bgLight: "bg-emerald-50",
    bgDark: "dark:bg-emerald-950/30",
    textColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: Code2,
    name: "Developers",
    count: "310+",
    color: "from-violet-400 to-purple-500",
    bgLight: "bg-violet-50",
    bgDark: "dark:bg-violet-950/30",
    textColor: "text-violet-600 dark:text-violet-400",
  },
  {
    icon: Paintbrush,
    name: "Painters",
    count: "290+",
    color: "from-pink-400 to-rose-500",
    bgLight: "bg-pink-50",
    bgDark: "dark:bg-pink-950/30",
    textColor: "text-pink-600 dark:text-pink-400",
  },
  {
    icon: Hammer,
    name: "Carpenters",
    count: "250+",
    color: "from-orange-400 to-red-500",
    bgLight: "bg-orange-50",
    bgDark: "dark:bg-orange-950/30",
    textColor: "text-orange-600 dark:text-orange-400",
  },
  {
    icon: Wifi,
    name: "IT Support",
    count: "180+",
    color: "from-indigo-400 to-blue-500",
    bgLight: "bg-indigo-50",
    bgDark: "dark:bg-indigo-950/30",
    textColor: "text-indigo-600 dark:text-indigo-400",
  },
  {
    icon: Truck,
    name: "Movers",
    count: "210+",
    color: "from-slate-400 to-gray-500",
    bgLight: "bg-slate-50",
    bgDark: "dark:bg-slate-950/30",
    textColor: "text-slate-600 dark:text-slate-400",
  },
  {
    icon: Scissors,
    name: "Barbers",
    count: "340+",
    color: "from-fuchsia-400 to-pink-500",
    bgLight: "bg-fuchsia-50",
    bgDark: "dark:bg-fuchsia-950/30",
    textColor: "text-fuchsia-600 dark:text-fuchsia-400",
  },
  {
    icon: Camera,
    name: "Photographers",
    count: "190+",
    color: "from-sky-400 to-blue-500",
    bgLight: "bg-sky-50",
    bgDark: "dark:bg-sky-950/30",
    textColor: "text-sky-600 dark:text-sky-400",
  },
  {
    icon: Leaf,
    name: "Gardeners",
    count: "270+",
    color: "from-lime-400 to-green-500",
    bgLight: "bg-lime-50",
    bgDark: "dark:bg-lime-950/30",
    textColor: "text-lime-600 dark:text-lime-400",
  },
  {
    icon: ShieldCheck,
    name: "Security",
    count: "150+",
    color: "from-teal-400 to-cyan-500",
    bgLight: "bg-teal-50",
    bgDark: "dark:bg-teal-950/30",
    textColor: "text-teal-600 dark:text-teal-400",
  },
];

export function CategoriesSection() {
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
          {categories.map((category, i) => (
            <button
              key={category.name}
              type="button"
              className={`group relative flex flex-col items-center gap-3 rounded-2xl border border-border/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/5 dark:hover:border-brand-800 ${category.bgLight} ${category.bgDark}`}
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
                {category.count} pros
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

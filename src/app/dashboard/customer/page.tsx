import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, CheckCircle2, XCircle, CalendarDays, MapPin, Search } from "lucide-react";

import { stackServerApp } from "@/stack";
import db from "@/db";
import { bookings, services, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cacheGet, cacheSet, CACHE_KEYS, TTL } from "@/cache";
import { syncCurrentUser } from "@/lib/sync-user";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type CustomerBooking = {
  id: number;
  status: string;
  scheduledDate: string;
  notes: string | null;
  createdAt: string;
  serviceTitle: string;
  serviceCategory: string;
  servicePrice: number;
  proName: string | null;
  proEmail: string;
  proImage: string | null;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Pending", color: "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-900", icon: Clock },
  accepted: { label: "Accepted", color: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-900", icon: CheckCircle2 },
  completed: { label: "Completed", color: "text-brand-600 bg-brand-50 border-brand-200 dark:text-brand-400 dark:bg-brand-950/30 dark:border-brand-900", icon: CheckCircle2 },
  declined: { label: "Declined", color: "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/30 dark:border-red-900", icon: XCircle },
  cancelled: { label: "Cancelled", color: "text-slate-500 bg-slate-50 border-slate-200 dark:text-slate-400 dark:bg-slate-950/30 dark:border-slate-800", icon: XCircle },
};

export default async function CustomerDashboardPage() {
  let stackUser;
  try {
    stackUser = await stackServerApp.getUser();
  } catch {
    redirect("/handler/sign-in");
  }
  if (!stackUser) {
    redirect("/handler/sign-in");
  }

  try { await syncCurrentUser(); } catch {}

  let customerBookings: CustomerBooking[] = [];
  const cacheKey = CACHE_KEYS.customerBookings(stackUser.id);
  const cached = await cacheGet<CustomerBooking[]>(cacheKey);

  if (cached) {
    customerBookings = cached;
  } else {
    try {
      const rows = await db
        .select({
          id: bookings.id,
          status: bookings.status,
          scheduledDate: bookings.scheduledDate,
          notes: bookings.notes,
          createdAt: bookings.createdAt,
          serviceTitle: services.title,
          serviceCategory: services.categoryId,
          servicePrice: services.price,
          proName: users.name,
          proEmail: users.email,
          proImage: users.profileImageUrl,
        })
        .from(bookings)
        .innerJoin(services, eq(bookings.serviceId, services.id))
        .innerJoin(users, eq(services.proId, users.id))
        .where(eq(bookings.customerId, stackUser.id))
        .orderBy(bookings.createdAt);

      customerBookings = rows.map((r) => ({
        ...r,
        scheduledDate: r.scheduledDate.toISOString(),
        createdAt: r.createdAt.toISOString(),
      }));

      await cacheSet(cacheKey, customerBookings, TTL.customerBookings);
    } catch (err) {
      console.warn("[CustomerDashboard] Failed to fetch bookings:", err);
    }
  }

  const pendingBookings = customerBookings.filter((b) => b.status === "pending");
  const acceptedBookings = customerBookings.filter((b) => b.status === "accepted");
  const completedBookings = customerBookings.filter((b) => b.status === "completed");
  const otherBookings = customerBookings.filter((b) => b.status === "declined" || b.status === "cancelled");

  const sections = [
    { title: "Pending", emoji: "⏳", bookings: pendingBookings, color: "text-amber-600 dark:text-amber-400" },
    { title: "Accepted", emoji: "✅", bookings: acceptedBookings, color: "text-emerald-600 dark:text-emerald-400" },
    { title: "Completed", emoji: "🎉", bookings: completedBookings, color: "text-brand-600 dark:text-brand-400" },
    { title: "Declined / Cancelled", emoji: "❌", bookings: otherBookings, color: "text-muted-foreground" },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pb-20">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 pt-32 pb-24">
          <div className="absolute inset-0 mesh-gradient opacity-40 mix-blend-overlay" />
          <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium text-brand-200 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Home
            </Link>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-2">
              My Bookings
            </h1>
            <p className="text-brand-200 text-lg">
              Track the status of your service requests
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 -translate-y-12 relative z-20">
          {customerBookings.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/60 bg-card p-12 text-center">
              <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-semibold mb-1">No bookings yet</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Find a professional and make your first booking!
              </p>
              <Button asChild className="bg-brand-600 hover:bg-brand-700 text-white">
                <Link href="/services">
                  <Search className="mr-2 h-4 w-4" />
                  Browse Services
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-10">
              {sections.map(
                (section) =>
                  section.bookings.length > 0 && (
                    <div key={section.title}>
                      <h2 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${section.color}`}>
                        {section.emoji} {section.title} ({section.bookings.length})
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {section.bookings.map((booking) => {
                          const config = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
                          const StatusIcon = config.icon;
                          const hourlyRate = `$${(booking.servicePrice / 100).toFixed(2)}`;
                          const scheduledDate = new Intl.DateTimeFormat("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          }).format(new Date(booking.scheduledDate));

                          const proInitials = booking.proName
                            ? booking.proName.substring(0, 2).toUpperCase()
                            : booking.proEmail.substring(0, 2).toUpperCase();

                          return (
                            <div
                              key={booking.id}
                              className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  {booking.proImage ? (
                                    <img
                                      src={booking.proImage}
                                      alt={booking.proName || "Pro"}
                                      className="h-10 w-10 rounded-xl object-cover border border-border"
                                    />
                                  ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-bold text-white">
                                      {proInitials}
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-semibold">{booking.serviceTitle}</p>
                                    <p className="text-xs text-muted-foreground">
                                      by {booking.proName || "Pro"} · {hourlyRate}/hr
                                    </p>
                                  </div>
                                </div>
                                <div className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${config.color}`}>
                                  <StatusIcon className="h-3 w-3" />
                                  {config.label}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <CalendarDays className="h-4 w-4 text-brand-500 shrink-0" />
                                {scheduledDate}
                              </div>

                              {booking.notes && (
                                <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-2.5 line-clamp-2">
                                  {booking.notes}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

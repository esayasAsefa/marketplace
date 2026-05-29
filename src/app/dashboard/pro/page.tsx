import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Inbox, Briefcase, Plus } from "lucide-react";

import { stackServerApp } from "@/stack";
import db from "@/db";
import { bookings, services, users, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cacheGet, cacheSet, CACHE_KEYS, TTL } from "@/cache";
import { syncCurrentUser } from "@/lib/sync-user";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { BookingCard } from "./_components/booking-card";
import { ServiceItem } from "./_components/service-item";

type ProBooking = {
  id: number;
  status: string;
  scheduledDate: string;
  customerPhone: string | null;
  locationLat: string | null;
  locationLng: string | null;
  notes: string | null;
  createdAt: string;
  customerName: string | null;
  customerEmail: string;
  serviceTitle: string;
};

type ProService = {
  id: number;
  title: string;
  categoryId: string;
  price: number;
  address: string | null;
  description: string;
};

export default async function ProDashboardPage() {
  const stackUser = (await stackServerApp.getUser())!;

  try { await syncCurrentUser(); } catch {}

  // Check if user is actually a Pro
  let isPro = false;
  try {
    const profile = await db
      .select({ isPro: profiles.isPro })
      .from(profiles)
      .where(eq(profiles.userId, stackUser.id))
      .limit(1);
    isPro = profile.length > 0 && profile[0].isPro;
  } catch {
    isPro = false;
  }

  if (!isPro) {
    redirect("/become-pro");
  }

  // Fetch bookings for the pro's services (with cache)
  let proBookings: ProBooking[] = [];
  const bookingsCacheKey = CACHE_KEYS.proBookings(stackUser.id);
  const cachedBookings = await cacheGet<ProBooking[]>(bookingsCacheKey);

  if (cachedBookings) {
    proBookings = cachedBookings;
  } else {
    try {
      const rows = await db
        .select({
          id: bookings.id,
          status: bookings.status,
          scheduledDate: bookings.scheduledDate,
          customerPhone: bookings.customerPhone,
          locationLat: bookings.locationLat,
          locationLng: bookings.locationLng,
          notes: bookings.notes,
          createdAt: bookings.createdAt,
          customerName: users.name,
          customerEmail: users.email,
          serviceTitle: services.title,
        })
        .from(bookings)
        .innerJoin(services, eq(bookings.serviceId, services.id))
        .leftJoin(users, eq(bookings.customerId, users.id))
        .where(eq(services.proId, stackUser.id))
        .orderBy(bookings.createdAt);

      proBookings = rows.map((r) => ({
        ...r,
        customerEmail: r.customerEmail || "Unknown",
        scheduledDate: r.scheduledDate.toISOString(),
        createdAt: r.createdAt.toISOString(),
      }));

      await cacheSet(bookingsCacheKey, proBookings, TTL.proBookings);
    } catch (err) {
      console.warn("[ProDashboard] Failed to fetch bookings:", err);
    }
  }

  // Fetch pro's service listings (with cache)
  let proServices: ProService[] = [];
  const servicesCacheKey = CACHE_KEYS.proServices(stackUser.id);
  const cachedServices = await cacheGet<ProService[]>(servicesCacheKey);

  if (cachedServices) {
    proServices = cachedServices;
  } else {
    try {
      proServices = await db
        .select({
          id: services.id,
          title: services.title,
          categoryId: services.categoryId,
          price: services.price,
          address: services.address,
          description: services.description,
        })
        .from(services)
        .where(eq(services.proId, stackUser.id))
        .orderBy(services.createdAt);

      await cacheSet(servicesCacheKey, proServices, TTL.proServices);
    } catch (err) {
      console.warn("[ProDashboard] Failed to fetch services:", err);
    }
  }

  const pendingBookings = proBookings.filter((b) => b.status === "pending");
  const activeBookings = proBookings.filter((b) => b.status === "accepted");
  const pastBookings = proBookings.filter((b) => b.status === "completed" || b.status === "declined");

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
              Pro Dashboard
            </h1>
            <p className="text-brand-200 text-lg">
              Manage your bookings and service listings
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 -translate-y-12 relative z-20">
          {/* Booking Requests Section */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                  <Inbox className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Booking Requests</h2>
                  <p className="text-sm text-muted-foreground">{pendingBookings.length} pending</p>
                </div>
              </div>
            </div>

            {pendingBookings.length === 0 && activeBookings.length === 0 && pastBookings.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border/60 bg-card p-12 text-center">
                <Inbox className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-semibold mb-1">No bookings yet</h3>
                <p className="text-muted-foreground text-sm">
                  When customers request your services, they will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {pendingBookings.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-3">
                      ⏳ Pending ({pendingBookings.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pendingBookings.map((b) => (
                        <BookingCard key={b.id} booking={b} />
                      ))}
                    </div>
                  </div>
                )}

                {activeBookings.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-3">
                      ✅ Active ({activeBookings.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeBookings.map((b) => (
                        <BookingCard key={b.id} booking={b} />
                      ))}
                    </div>
                  </div>
                )}

                {pastBookings.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Past ({pastBookings.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pastBookings.map((b) => (
                        <BookingCard key={b.id} booking={b} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Service Listings Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/30">
                  <Briefcase className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Your Services</h2>
                  <p className="text-sm text-muted-foreground">{proServices.length} listings</p>
                </div>
              </div>
              <Button asChild size="sm" className="bg-brand-600 hover:bg-brand-700 text-white">
                <Link href="/become-pro">
                  <Plus className="mr-1 h-4 w-4" />
                  Add Service
                </Link>
              </Button>
            </div>

            {proServices.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border/60 bg-card p-12 text-center">
                <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-semibold mb-1">No services yet</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Create your first service listing to start getting bookings.
                </p>
                <Button asChild className="bg-brand-600 hover:bg-brand-700 text-white">
                  <Link href="/become-pro">Create Service</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {proServices.map((s) => (
                  <ServiceItem key={s.id} service={s} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

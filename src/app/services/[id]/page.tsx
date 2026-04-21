import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, MapPin, Star, Calendar, Mail, Phone, CalendarDays, Zap } from "lucide-react";

import db from "@/db";
import { services, users, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cacheGet, cacheSet, CACHE_KEYS, TTL } from "@/cache";
import { stackServerApp } from "@/stack";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { BookingForm } from "./_components/booking-form";

const mockDb = [
  { id: 1, title: "Master Home Electrician", price: 6500, address: "Downtown", categoryId: "electrician", proName: "Marcus Johnson", proImage: null, proEmail: "marcus@example.com", phone: "555-0101", bio: "Over 10 years of experience in residential electrical work.", verified: true, description: "Expert electrician for all your home wiring needs. I handle panel upgrades, fixture installations, and emergency fault finding.", createdAt: new Date("2023-01-15") },
  { id: 2, title: "Licensed Plumber", price: 5500, address: "Midtown", categoryId: "plumber", proName: "Sarah Chen", proImage: null, proEmail: "sarah@example.com", phone: "555-0202", bio: "Licensed and bonded plumber with a focus on quick emergency response.", verified: true, description: "Emergency plumbing and pipe repair. Unclogging drains, fixing leaks, and replacing water heaters securely.", createdAt: new Date("2023-04-20") },
  { id: 3, title: "Mathematics Tutor", price: 4500, address: "Online", categoryId: "tutor", proName: "Amara Osei", proImage: null, proEmail: "amara@example.com", phone: "555-0303", bio: "PhD student in Statistics. Passionate about making math accessible.", verified: true, description: "College level calculus and algebra tutoring. I provide custom study plans and exam preparation.", createdAt: new Date("2023-06-11") },
  { id: 4, title: "Full Stack Developer", price: 8000, address: "Remote", categoryId: "developer", proName: "James React", proImage: null, proEmail: "james@example.com", phone: "555-0404", bio: "Senior Engineer who loves teaching and building scalable web apps.", verified: true, description: "Next.js and Web app development from zero to production. Happy to consult on architecture or build out MVPs.", createdAt: new Date("2023-08-05") },
  { id: 5, title: "Interior Painter", price: 4000, address: "Westside", categoryId: "painter", proName: "Linda Park", proImage: null, proEmail: "linda@example.com", phone: "555-0505", bio: "Detail-oriented painter bringing color back into your home.", verified: true, description: "Professional indoor and outdoor painting. Includes prep work, priming, and clean up. I only use zero-VOC paints.", createdAt: new Date("2023-11-22") },
  { id: 6, title: "Expert Carpenter", price: 7000, address: "Eastside", categoryId: "carpenter", proName: "Tom Bradley", proImage: null, proEmail: "tom@example.com", phone: "555-0606", bio: "Third generation woodworker specializing in custom cabinetry.", verified: true, description: "Custom furniture and woodworking. You provide the design inspiration and I will build a piece that will last a lifetime.", createdAt: new Date("2024-02-14") }
];

export default async function ServiceDetailsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const serviceId = parseInt(id, 10);

  if (isNaN(serviceId)) {
    notFound();
  }

  const stackUser = await stackServerApp.getUser();
  let defaultCustomerProfile = null;
  if (stackUser) {
    defaultCustomerProfile = await cacheGet<{ phone: string; location: { lat: number; lng: number } | null }>(
      CACHE_KEYS.customerProfile(stackUser.id)
    );
  }

  let service = null;

  // Try Redis cache first
  const cacheKey = CACHE_KEYS.serviceDetails(serviceId);
  const cached = await cacheGet<any>(cacheKey);

  if (cached) {
    service = cached;
  } else {
    try {
      const rawResult = await db
        .select({
          id: services.id,
          title: services.title,
          description: services.description,
          price: services.price,
          address: services.address,
          categoryId: services.categoryId,
          createdAt: services.createdAt,
          proName: users.name,
          proEmail: users.email,
          proImage: users.profileImageUrl,
          verified: profiles.isPro,
          bio: profiles.bio,
          phone: profiles.phone,
        })
        .from(services)
        .leftJoin(users, eq(services.proId, users.id))
        .leftJoin(profiles, eq(users.id, profiles.userId))
        .where(eq(services.id, serviceId))
        .limit(1);

      if (rawResult.length > 0) {
        service = {
          ...rawResult[0],
          verified: !!rawResult[0].verified,
        };
        await cacheSet(cacheKey, service, TTL.serviceDetails);
      } else {
        // Not found in DB, try mock fallback
        service = mockDb.find((m) => m.id === serviceId) || null;
      }
    } catch (error) {
      console.warn("ServiceDetails DB fetch failed. Reverting to mock data. Error:", error);
      service = mockDb.find((m) => m.id === serviceId) || null;
    }
  }

  if (!service) {
    notFound();
  }

  const initials = service.proName
    ? service.proName.substring(0, 2).toUpperCase()
    : "PR";
  const hourlyRate = `$${(service.price / 100).toFixed(2)}`;
  const mockRating = "4.9";
  const mockReviews = 42;

  const joinedDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(service.createdAt));

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pb-20">
        {/* Top Header Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 pt-32 pb-40">
          <div className="absolute inset-0 mesh-gradient opacity-40 mix-blend-overlay" />
          <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <Link
              href="/services"
              className="inline-flex items-center text-sm font-medium text-brand-200 hover:text-white transition-colors mb-8"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Services
            </Link>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="flex-1 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="outline" className="border-brand-400 text-brand-200 bg-brand-950/50 backdrop-blur-sm">
                    {service.categoryId.charAt(0).toUpperCase() + service.categoryId.slice(1)}
                  </Badge>
                  {service.verified && (
                    <Badge className="bg-brand-500/20 text-brand-300 border-none">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Verified Pro
                    </Badge>
                  )}
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-white">
                  {service.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-brand-200 text-sm sm:text-base">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {service.address || "Local Area"}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium text-white">{mockRating}</span>
                    <span>({mockReviews} reviews)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 -translate-y-24 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Pro Card */}
              <div className="rounded-3xl border border-border/50 bg-card p-6 sm:p-8 shadow-xl shadow-brand-900/5">
                <h2 className="text-2xl font-bold mb-6">About the Professional</h2>
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="shrink-0 flex justify-center sm:block">
                    {service.proImage ? (
                      <img
                        src={service.proImage}
                        alt={service.proName || "Pro"}
                        className="h-24 w-24 sm:h-32 sm:w-32 rounded-2xl object-cover shadow-lg border border-border"
                      />
                    ) : (
                      <div className="flex h-24 w-24 sm:h-32 sm:w-32 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-3xl font-bold text-white shadow-lg">
                        {initials}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 justify-center sm:justify-start">
                      <h3 className="text-2xl font-bold">{service.proName || "Anonymous Pro"}</h3>
                      {service.verified && <CheckCircle2 className="h-5 w-5 text-brand-500" />}
                    </div>
                    {service.bio ? (
                      <p className="text-muted-foreground leading-relaxed text-center sm:text-left">
                        {service.bio}
                      </p>
                    ) : (
                      <p className="text-muted-foreground italic text-center sm:text-left">
                        This professional hasn't written a biography yet.
                      </p>
                    )}
                    <div className="mt-6 flex flex-wrap gap-4 justify-center sm:justify-start">
                      {service.proEmail && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted hover:bg-muted/80 transition-colors px-3 py-1.5 rounded-full">
                          <Mail className="h-4 w-4 text-brand-500" />
                          {service.proEmail}
                        </div>
                      )}
                      {service.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted hover:bg-muted/80 transition-colors px-3 py-1.5 rounded-full">
                          <Phone className="h-4 w-4 text-brand-500" />
                          {service.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                        <Calendar className="h-4 w-4 text-brand-500" />
                        Joined {joinedDate}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Description */}
              <div className="rounded-3xl border border-border/50 bg-card p-6 sm:p-8 shadow-sm">
                <h2 className="text-2xl font-bold mb-6">Service Details</h2>
                <div className="prose prose-brand dark:prose-invert max-w-none">
                  <p className="whitespace-pre-line leading-relaxed text-muted-foreground text-lg">
                    {service.description}
                  </p>
                </div>
              </div>

              {/* Fake Reviews Section */}
              <div className="rounded-3xl border border-border/50 bg-card p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Recent Reviews</h2>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-lg">{mockRating}</span>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="border-b border-border/50 pb-6 last:border-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-semibold text-xs">MK</div>
                      <div>
                        <p className="font-semibold text-sm">Michael K.</p>
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
                        </div>
                      </div>
                      <span className="ml-auto text-xs text-muted-foreground">2 weeks ago</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Excellent work, very professional and arrived exactly on time. Highly recommended!</p>
                  </div>
                  <div className="border-b border-border/50 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-semibold text-xs">AJ</div>
                      <div>
                        <p className="font-semibold text-sm">Amanda J.</p>
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
                        </div>
                      </div>
                      <span className="ml-auto text-xs text-muted-foreground">1 month ago</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Very knowledgeable. Solved my issue in less than an hour.</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Pricing & Booking */}
            <div className="lg:col-span-1">
              <BookingForm 
                serviceId={serviceId} 
                hourlyRate={hourlyRate}
                defaultPhone={defaultCustomerProfile?.phone}
                defaultLocation={defaultCustomerProfile?.location}
              />
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

import { Suspense } from "react";
import db from "@/db";
import { services, users, profiles } from "@/db/schema";
import { eq, desc, ilike, or, and } from "drizzle-orm";
import { ServiceCard } from "./_components/service-card";
import { SearchFilters } from "./_components/search-filters";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Search } from "lucide-react";
import { cacheGet, cacheSet, CACHE_KEYS, TTL } from "@/cache";

export default async function ServicesDirectory(props: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const q = searchParams.q || "";
  const cat = searchParams.category && searchParams.category !== "all" ? searchParams.category : null;

  console.log("=== Search Debug ===");
  console.log("Raw searchParams:", searchParams);
  console.log("Parsed q:", q);
  console.log("Parsed cat:", cat);

  // Filter by category only (prioritize category over text search)
  let whereClause = undefined;
  if (cat) {
    whereClause = eq(services.categoryId, cat);
  } else if (q) {
    // If no category, search by text
    whereClause = or(
      ilike(services.title, `%${q}%`),
      ilike(services.description, `%${q}%`)
    );
  }

  console.log("whereClause:", whereClause ? "EXISTS (cat or q)" : "UNDEFINED (show all)");

  let results: any[] = [];

  // Try Redis cache first
  const cacheKey = CACHE_KEYS.servicesQuery(cat || "", q);
  const cached = await cacheGet<any[]>(cacheKey);
  if (cached) {
    results = cached;
  } else {
    try {
      // Query services directly (simpler, no joins)
      let query = db.select({
        id: services.id,
        title: services.title,
        price: services.price,
        address: services.address,
        categoryId: services.categoryId,
      }).from(services);

      if (whereClause) {
        query = query.where(whereClause);
      }

      const rawResults = await query.orderBy(desc(services.createdAt));

      console.log("DB Query result:", { resultCount: rawResults.length });

      results = rawResults.map(r => ({
        ...r,
        proName: null,
        proImage: null,
        verified: false,
      }));

      // Store in Redis
      await cacheSet(cacheKey, results, TTL.servicesQuery);
    } catch (error) {
      console.error("ServicesDirectory DB fetch failed. Error:", error instanceof Error ? error.message : error);
      console.error("Full error:", error);
      
      // Mock dummy data for development without DB access
      const mockDb = [
        { id: 1, title: "Master Home Electrician", price: 6500, address: "Downtown", categoryId: "electrician", proName: "Marcus Johnson", proImage: null, verified: true, description: "Expert electrician for all your home wiring needs." },
        { id: 2, title: "Licensed Plumber", price: 5500, address: "Midtown", categoryId: "plumber", proName: "Sarah Chen", proImage: null, verified: true, description: "Emergency plumbing and pipe repair." },
        { id: 3, title: "Mathematics Tutor", price: 4500, address: "Online", categoryId: "tutor", proName: "Amara Osei", proImage: null, verified: true, description: "College level calculus and algebra tutoring." },
        { id: 4, title: "Full Stack Developer", price: 8000, address: "Remote", categoryId: "developer", proName: "James React", proImage: null, verified: true, description: "Next.js and Web app development." },
        { id: 5, title: "Interior Painter", price: 4000, address: "Westside", categoryId: "painter", proName: "Linda Park", proImage: null, verified: true, description: "Professional indoor and outdoor painting." },
        { id: 6, title: "Expert Carpenter", price: 7000, address: "Eastside", categoryId: "carpenter", proName: "Tom Bradley", proImage: null, verified: true, description: "Custom furniture and woodworking." }
      ];

      results = mockDb.filter(pro => {
        let matchesCat = true;
        let matchesQ = true;

        if (cat) {
          matchesCat = pro.categoryId === cat;
        }
        
        if (q) {
          matchesQ = pro.title.toLowerCase().includes(q.toLowerCase()) || pro.description.toLowerCase().includes(q.toLowerCase());
        }

        return matchesCat && matchesQ;
      });
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="relative overflow-hidden hero-gradient py-16">
          <div className="absolute inset-0 mesh-gradient" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Find the perfect <span className="gradient-text">Pro</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Search across our verified network of professionals for your next project.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -translate-y-8 relative z-10">
          <SearchFilters />

          <div className="mt-8 mb-4">
            <h2 className="text-xl font-semibold">
              {results.length} {results.length === 1 ? "Result" : "Results"} Found
            </h2>
          </div>

          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-border/50 border-dashed bg-card/50 py-20">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No pros found</h3>
              <p className="text-muted-foreground text-center max-w-md mt-2">
                We couldn't find any professionals matching your criteria. Try adjusting your search or category filters.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-20">
              {results.map((r) => (
                <ServiceCard pro={r} key={r.id} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

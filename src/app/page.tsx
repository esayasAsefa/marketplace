import { CategoriesSection } from "@/components/categories-section";
import { CTASection } from "@/components/cta-section";
import { FeaturedPros } from "@/components/featured-pros";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/hero-section";
import { HowItWorks } from "@/components/how-it-works";

import { StatsSection } from "@/components/stats-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { Navbar } from "@/components/navbar";
import { syncCurrentUser } from "@/lib/sync-user";

export default async function Home() {
  // Sync the logged-in StackAuth user to the Neon database
  await syncCurrentUser();

  return (
    <>
      {" "}
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <CategoriesSection />
        <StatsSection />
        <HowItWorks />
        <FeaturedPros />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}

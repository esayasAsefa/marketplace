import { CategoriesSection } from "@/components/categories-section";
import { CTASection } from "@/components/cta-section";
import { FeaturedPros } from "@/components/featured-pros";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/hero-section";
import { HowItWorks } from "@/components/how-it-works";
import { AiRecommendation } from "@/components/ai-recommendation";

import { StatsSection } from "@/components/stats-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { Navbar } from "@/components/navbar";

export default function Home() {
  return (
    <>
      {" "}
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <AiRecommendation />
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

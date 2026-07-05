import { getSession } from "@/lib/auth/session";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { Hero } from "@/components/marketing/Hero";
import { FeaturesSection } from "@/components/marketing/FeaturesSection";
import { DashboardShowcaseSection } from "@/components/marketing/DashboardShowcaseSection";
import { AISection } from "@/components/marketing/AISection";
import { HowItWorksSection } from "@/components/marketing/HowItWorksSection";
import { DifferentialsSection } from "@/components/marketing/DifferentialsSection";
import { FAQSection } from "@/components/marketing/FAQSection";
import { FinalCTASection } from "@/components/marketing/FinalCTASection";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export default async function Home() {
  const user = await getSession();
  const isAuthenticated = Boolean(user);

  return (
    <div className="flex flex-1 flex-col">
      <MarketingNavbar isAuthenticated={isAuthenticated} />
      <main className="flex-1">
        <Hero isAuthenticated={isAuthenticated} />
        <FeaturesSection />
        <DashboardShowcaseSection />
        <AISection />
        <HowItWorksSection />
        <DifferentialsSection />
        <FAQSection />
        <FinalCTASection isAuthenticated={isAuthenticated} />
      </main>
      <MarketingFooter />
    </div>
  );
}

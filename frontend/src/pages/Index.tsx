import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import FeaturedDesigns from "@/components/sections/FeaturedDesigns";
import CategoriesSection from "@/components/sections/CategoriesSection";
import FeaturedDesigners from "@/components/sections/FeaturedDesigners";
import StatsSection from "@/components/sections/StatsSection";
import CallToAction from "@/components/sections/CallToAction";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <CategoriesSection />
        <FeaturedDesigns />
        <FeaturedDesigners />
        <StatsSection />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

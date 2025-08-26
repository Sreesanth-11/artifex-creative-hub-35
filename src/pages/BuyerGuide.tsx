import { useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const BuyerGuide = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">Buyer Guide</h1>
            <p className="text-muted-foreground">Everything you need to know about purchasing designs on Artifex</p>
          </div>

          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">How to Purchase</h2>
              <p className="text-muted-foreground">
                Browse our marketplace, find designs you love, and purchase them instantly. All files are delivered immediately after payment.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Licensing</h2>
              <p className="text-muted-foreground">
                Most designs come with commercial licensing included. Check each product's licensing terms before purchase.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">File Formats</h2>
              <p className="text-muted-foreground">
                We support various file formats including PSD, AI, SVG, PNG, and more. Each product listing shows available formats.
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BuyerGuide;
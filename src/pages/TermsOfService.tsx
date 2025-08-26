import { useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const TermsOfService = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: November 2024</p>
          </div>

          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using Artifex, you accept and agree to be bound by the terms and 
                provision of this agreement. If you do not agree to abide by the above, please do 
                not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. User Accounts</h2>
              <p className="text-muted-foreground">
                You are responsible for maintaining the confidentiality of your account and password 
                and for restricting access to your computer. You agree to accept responsibility for 
                all activities that occur under your account or password.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Content Guidelines</h2>
              <p className="text-muted-foreground">
                Users may upload and share their original designs. You retain ownership of your content, 
                but grant us a license to display and distribute it through our platform. Content must 
                not infringe on others' intellectual property rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Payment and Refunds</h2>
              <p className="text-muted-foreground">
                All purchases are final unless otherwise stated. Refunds may be provided at our discretion 
                for digital products that are fundamentally different from what was described or are 
                significantly defective.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Prohibited Uses</h2>
              <p className="text-muted-foreground">
                You may not use our service for any illegal purposes or to violate any laws in your 
                jurisdiction. You may not use our service to transmit worms, viruses, or any code 
                of a destructive nature.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                In no case shall Artifex, our directors, officers, employees, affiliates, agents, 
                contractors, interns, suppliers, service providers or licensors be liable for any 
                injury, loss, claim, or any direct, indirect, incidental, punitive, special, or 
                consequential damages.
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TermsOfService;
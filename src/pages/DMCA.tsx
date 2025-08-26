import { useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const DMCA = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">DMCA Notice</h1>
            <p className="text-muted-foreground">Digital Millennium Copyright Act</p>
          </div>

          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Copyright Infringement Notification</h2>
              <p className="text-muted-foreground">
                Artifex respects the intellectual property rights of others and expects our users to 
                do the same. If you believe that your copyrighted work has been copied in a way that 
                constitutes copyright infringement, please provide our Copyright Agent with the 
                following information:
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Required Information</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>A physical or electronic signature of the copyright owner or authorized agent</li>
                <li>Identification of the copyrighted work claimed to have been infringed</li>
                <li>Identification of the material that is claimed to be infringing and information reasonably sufficient to permit us to locate the material</li>
                <li>Your contact information, including your address, telephone number, and email address</li>
                <li>A statement that you have a good faith belief that use of the material is not authorized by the copyright owner</li>
                <li>A statement that the information in the notification is accurate and, under penalty of perjury, that you are authorized to act on behalf of the copyright owner</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">How to Submit a DMCA Notice</h2>
              <p className="text-muted-foreground">
                Please send your DMCA notice to our designated Copyright Agent:
              </p>
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="font-medium">DMCA Agent</p>
                <p className="text-muted-foreground">Artifex</p>
                <p className="text-muted-foreground">Email: dmca@artifex.com</p>
                <p className="text-muted-foreground">Address: 123 Design Street, San Francisco, CA 94102</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Counter-Notification</h2>
              <p className="text-muted-foreground">
                If you believe that your content was removed by mistake or misidentification, you may 
                submit a counter-notification. The counter-notification must include specific information 
                as required by the DMCA and should be sent to the same Copyright Agent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Repeat Infringers</h2>
              <p className="text-muted-foreground">
                Artifex will terminate user accounts that are determined to be repeat infringers of 
                third-party copyright rights when appropriate and in Artifex's sole discretion.
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DMCA;
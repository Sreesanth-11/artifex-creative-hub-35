import { useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const CookiePolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
            <p className="text-muted-foreground">Last updated: November 2024</p>
          </div>

          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">What Are Cookies</h2>
              <p className="text-muted-foreground">
                Cookies are small text files that are stored on your computer or mobile device when 
                you visit our website. They allow us to recognize you and remember your preferences 
                to provide you with a better experience.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">How We Use Cookies</h2>
              <p className="text-muted-foreground">
                We use cookies to enhance your browsing experience, analyze site traffic, personalize 
                content, and remember your preferences. This helps us improve our services and provide 
                you with more relevant content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Types of Cookies We Use</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Essential Cookies</h3>
                  <p className="text-muted-foreground">
                    These cookies are necessary for the website to function properly and cannot be 
                    disabled in our systems.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Analytics Cookies</h3>
                  <p className="text-muted-foreground">
                    These cookies help us understand how visitors interact with our website by 
                    collecting and reporting information anonymously.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Preference Cookies</h3>
                  <p className="text-muted-foreground">
                    These cookies allow us to remember choices you make and provide enhanced, 
                    more personal features.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Managing Cookies</h2>
              <p className="text-muted-foreground">
                You can control and/or delete cookies as you wish. You can delete all cookies that 
                are already on your computer and you can set most browsers to prevent them from 
                being placed. However, this may require you to manually adjust some preferences 
                every time you visit a site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about our use of cookies, please contact us at 
                cookies@artifex.com.
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CookiePolicy;
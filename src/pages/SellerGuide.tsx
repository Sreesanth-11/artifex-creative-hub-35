import { useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, DollarSign, Users, TrendingUp, Shield, Award } from "lucide-react";

const SellerGuide = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const steps = [
    {
      icon: Upload,
      title: "Upload Your Designs",
      description: "Share your creative work with our global community. Upload high-quality designs with detailed descriptions.",
    },
    {
      icon: DollarSign,
      title: "Set Your Prices",
      description: "You have full control over pricing. Set competitive prices based on your work's value and market demand.",
    },
    {
      icon: Users,
      title: "Build Your Audience",
      description: "Engage with customers, respond to feedback, and build a loyal following for your design style.",
    },
    {
      icon: TrendingUp,
      title: "Grow Your Business",
      description: "Use our analytics tools to track performance and optimize your listings for better sales.",
    },
  ];

  const benefits = [
    {
      icon: Shield,
      title: "Protected Transactions",
      description: "All payments are secure and protected. We handle the payment processing so you can focus on creating.",
    },
    {
      icon: Award,
      title: "Global Marketplace",
      description: "Reach customers worldwide with our international platform and multi-currency support.",
    },
    {
      icon: TrendingUp,
      title: "Marketing Support",
      description: "Get featured in our newsletters, social media, and promotional campaigns to boost visibility.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-4xl font-bold">
            Start Selling Your <span className="bg-gradient-primary bg-clip-text text-transparent">Designs Today</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Join thousands of creative professionals who are earning money from their passion. 
            Learn how to succeed as a seller on Artifex and turn your creativity into a thriving business.
          </p>
          <Button size="lg" className="bg-gradient-primary">
            Start Selling Now
          </Button>
        </div>

        {/* Getting Started */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">How to Get Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6 space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto flex items-center justify-center">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  <div className="text-2xl font-bold text-primary/30">
                    {index + 1}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Why Sell on Artifex?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index}>
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Best Practices */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Best Practices for Success</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Quality Guidelines</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>Upload high-resolution images (minimum 1500px)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>Use clear, descriptive titles and tags</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>Provide detailed descriptions of your work</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>Include multiple preview images</span>
                </li>
              </ul>
            </div>
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Marketing Tips</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>Research popular trends in your niche</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>Engage with the community regularly</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>Promote your work on social media</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>Respond quickly to customer inquiries</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Pricing Guide */}
        <div className="bg-muted/30 rounded-xl p-8 mb-16">
          <h2 className="text-2xl font-bold mb-6">Pricing Your Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-primary">Basic Designs</h3>
              <p className="text-2xl font-bold">$5 - $25</p>
              <p className="text-sm text-muted-foreground">Simple logos, icons, and basic graphics</p>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-primary">Premium Designs</h3>
              <p className="text-2xl font-bold">$25 - $75</p>
              <p className="text-sm text-muted-foreground">Complex illustrations, UI kits, and templates</p>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-primary">Exclusive Work</h3>
              <p className="text-2xl font-bold">$75+</p>
              <p className="text-sm text-muted-foreground">Custom designs and premium collections</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to Start Your Journey?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join our community of successful designers and start monetizing your creativity today.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" className="bg-gradient-primary">
              Create Seller Account
            </Button>
            <Button size="lg" variant="outline">
              View Success Stories
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SellerGuide;
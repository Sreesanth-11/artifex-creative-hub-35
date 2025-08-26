import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, HelpCircle, MessageCircle, Book, CreditCard, Shield } from "lucide-react";

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const categories = [
    {
      icon: Book,
      title: "Getting Started",
      description: "Learn the basics of using Artifex",
      articles: 12,
    },
    {
      icon: CreditCard,
      title: "Payments & Billing",
      description: "Manage your payments and subscriptions",
      articles: 8,
    },
    {
      icon: Shield,
      title: "Account & Security",
      description: "Keep your account safe and secure",
      articles: 6,
    },
    {
      icon: MessageCircle,
      title: "Community Guidelines",
      description: "Rules and best practices for our community",
      articles: 4,
    },
  ];

  const faqs = [
    {
      question: "How do I upload my designs?",
      answer: "To upload your designs, go to your dashboard and click on 'Add Product'. You can upload images, set pricing, add descriptions, and categorize your work."
    },
    {
      question: "What file formats are supported?",
      answer: "We support a wide range of file formats including PSD, AI, SVG, PNG, JPG, PDF, and more. Check our upload guidelines for a complete list."
    },
    {
      question: "How do I receive payments?",
      answer: "Payments are processed through our secure payment system. You can connect your bank account or PayPal to receive earnings from your sales."
    },
    {
      question: "Can I offer custom design services?",
      answer: "Yes! You can offer custom design services through our platform. Set up your services in your seller dashboard and communicate with clients through our messaging system."
    },
    {
      question: "What are the commission rates?",
      answer: "Our commission rates vary based on your seller level and product type. Basic sellers start at 15% commission, with lower rates available for premium sellers."
    },
    {
      question: "How do I protect my intellectual property?",
      answer: "We take IP protection seriously. All uploads are watermarked for preview, and we have strict policies against copyright infringement. Report any violations to our support team."
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center space-y-6 mb-12">
          <h1 className="text-4xl font-bold">
            How can we <span className="bg-gradient-primary bg-clip-text text-transparent">help you?</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find answers to your questions, learn how to use Artifex, and get the support you need.
          </p>
          
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 h-12 text-lg bg-background border-border"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {categories.map((category, index) => (
            <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg mx-auto flex items-center justify-center">
                  <category.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{category.title}</h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
                <Badge variant="secondary">{category.articles} articles</Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Popular Articles */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Popular Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Getting started as a designer",
              "Setting up your seller profile",
              "Understanding licensing terms",
              "Marketing your designs",
              "Managing customer reviews",
              "Withdrawing your earnings"
            ].map((article, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center space-x-3">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  <span className="font-medium">{article}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact Support */}
        <div className="mt-16 text-center space-y-4">
          <h3 className="text-xl font-semibold">Still need help?</h3>
          <p className="text-muted-foreground">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex justify-center space-x-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center space-y-2">
                <MessageCircle className="w-8 h-8 text-primary mx-auto" />
                <h4 className="font-medium">Live Chat</h4>
                <p className="text-sm text-muted-foreground">Get instant help</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center space-y-2">
                <HelpCircle className="w-8 h-8 text-primary mx-auto" />
                <h4 className="font-medium">Email Support</h4>
                <p className="text-sm text-muted-foreground">help@artifex.com</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HelpCenter;
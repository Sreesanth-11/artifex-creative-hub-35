import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CallToAction = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-6">
            <h2 className="text-5xl md:text-6xl font-bold leading-tight">
              Ready to Start
              <br />
              <span className="text-primary">Creating?</span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of designers earning from their creativity on Artifex
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg px-10 h-16 rounded-full"
            >
              Start Selling Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 hover:bg-muted text-lg px-10 h-16 rounded-full"
            >
              Browse Designs
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
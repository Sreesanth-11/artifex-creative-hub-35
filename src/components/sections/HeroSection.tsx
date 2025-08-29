import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, Play } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="pt-32 pb-20 px-6">
      <div className="container mx-auto text-center">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Main Heading */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
              Discover Amazing
              <br />
              <span className="text-primary">Design Assets</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Browse thousands of high-quality designs from talented creators
              worldwide
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="What are you looking for?"
                className="pl-14 pr-32 h-16 text-lg bg-muted border-0 focus:ring-2 focus:ring-primary/20 rounded-full"
              />
              <Link to="/shop">
                <Button
                  size="lg"
                  className="absolute right-2 top-2 bottom-2 bg-primary hover:bg-primary/90 rounded-full px-8"
                >
                  Search
                </Button>
              </Link>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link to="/add-product">
              <Button
                size="lg"
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg px-8 h-14 rounded-full"
              >
                Start Creating
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-2 hover:bg-muted text-lg px-8 h-14 rounded-full"
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16">
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-primary">
                100k+
              </div>
              <p className="text-muted-foreground">Digital Assets</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-primary">
                25k+
              </div>
              <p className="text-muted-foreground">Creators</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-primary">
                4.9
              </div>
              <p className="text-muted-foreground">Rating</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-primary">
                ₹20Cr+
              </div>
              <p className="text-muted-foreground">Paid Out</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

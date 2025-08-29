import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { productAPI, Product } from "@/lib/api";

const FeaturedDesigns = () => {
  const [featuredDesigns, setFeaturedDesigns] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedDesigns = async () => {
      try {
        setIsLoading(true);
        // Fetch featured products from the API
        const response = await productAPI.getProducts({
          page: 1,
          limit: 6,
          featured: true,
          sort: "rating",
        });
        setFeaturedDesigns(response.data.products);
      } catch (error) {
        console.error("Error fetching featured designs:", error);
        // Fallback to empty array if API fails
        setFeaturedDesigns([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedDesigns();
  }, []);

  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Featured Designs
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover popular designs from our talented creators
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card
                key={i}
                className="overflow-hidden border-0 shadow-lg animate-pulse"
              >
                <CardContent className="p-0">
                  <div className="w-full h-60 bg-muted"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-muted rounded w-16"></div>
                      <div className="h-6 bg-muted rounded w-12"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredDesigns.map((design) => (
              <Link key={design._id} to={`/product/${design._id}`}>
                <Card className="group cursor-pointer overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden">
                      <img
                        src={design.images[0] || "/api/placeholder/400/300"}
                        alt={design.title}
                        className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <Badge className="absolute top-4 left-4 bg-background text-foreground">
                        {design.category}
                      </Badge>
                    </div>

                    <div className="p-6 space-y-4">
                      <h3 className="font-bold text-xl group-hover:text-primary transition-colors">
                        {design.title}
                      </h3>

                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-medium">
                          {design.seller.name}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-secondary fill-secondary" />
                          <span className="font-semibold">
                            {design.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-2xl font-bold text-primary">
                          ₹{design.price.toLocaleString()}
                        </span>
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90 rounded-full"
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center">
          <Link to="/shop">
            <Button
              size="lg"
              variant="outline"
              className="border-2 hover:bg-muted rounded-full px-8"
            >
              View All Designs
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedDesigns;

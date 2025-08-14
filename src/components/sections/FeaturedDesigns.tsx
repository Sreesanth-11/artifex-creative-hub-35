import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ArrowRight } from "lucide-react";

const FeaturedDesigns = () => {
  const featuredDesigns = [
    {
      id: 1,
      title: "Modern Minimalist Logo Pack",
      designer: "Sarah Chen",
      price: "$29",
      rating: 4.9,
      image: "/src/assets/hero-design-1.jpg",
      category: "Logos",
    },
    {
      id: 2,
      title: "Social Media Template Bundle",
      designer: "Alex Rodriguez",
      price: "$45",
      rating: 4.8,
      image: "/src/assets/hero-design-2.jpg",
      category: "Templates",
    },
    {
      id: 3,
      title: "Icon Set - Business & Finance",
      designer: "Emma Thompson",
      price: "$19",
      rating: 5.0,
      image: "/src/assets/hero-design-3.jpg",
      category: "Icons",
    },
    {
      id: 4,
      title: "Vintage Typography Collection",
      designer: "Marcus Johnson",
      price: "$35",
      rating: 4.7,
      image: "/src/assets/hero-design-1.jpg",
      category: "Fonts",
    },
    {
      id: 5,
      title: "Abstract Background Patterns",
      designer: "Lisa Park",
      price: "$22",
      rating: 4.9,
      image: "/src/assets/hero-design-2.jpg",
      category: "Patterns",
    },
    {
      id: 6,
      title: "Mobile App UI Kit",
      designer: "David Kim",
      price: "$55",
      rating: 4.8,
      image: "/src/assets/hero-design-3.jpg",
      category: "UI Kits",
    },
  ];

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredDesigns.map((design) => (
            <Link key={design.id} to={`/product/${design.id}`}>
              <Card className="group cursor-pointer overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-0">
                <div className="relative overflow-hidden">
                  <img
                    src={design.image}
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
                    <span className="text-muted-foreground font-medium">{design.designer}</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-secondary fill-secondary" />
                      <span className="font-semibold">{design.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-2xl font-bold text-primary">{design.price}</span>
                    <Button size="sm" className="bg-primary hover:bg-primary/90 rounded-full">
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link to="/shop">
            <Button size="lg" variant="outline" className="border-2 hover:bg-muted rounded-full px-8">
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
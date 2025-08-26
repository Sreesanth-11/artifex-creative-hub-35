import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Grid3X3, List, Heart, Download, Star, Eye } from "lucide-react";

const Templates = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const templates = Array.from({ length: 24 }, (_, i) => ({
    id: i + 1,
    title: `Template Design ${i + 1}`,
    designer: "Designer Name",
    designerAvatar: "/api/placeholder/40/40",
    price: "$" + (Math.floor(Math.random() * 60) + 15),
    rating: 4.5 + Math.random() * 0.5,
    downloads: Math.floor(Math.random() * 2500) + 150,
    views: Math.floor(Math.random() * 7000) + 600,
    image: `/api/placeholder/300/200`,
    category: ["Business", "Creative", "Portfolio", "E-commerce"][Math.floor(Math.random() * 4)],
    isNew: Math.random() > 0.8,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-8">
        <div className="bg-muted/30 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h1 className="text-3xl md:text-4xl font-bold">
                Professional <span className="bg-gradient-primary bg-clip-text text-transparent">Design Templates</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Ready-to-use templates for websites, presentations, and more
              </p>
              
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  className="pl-12 pr-4 h-12 text-lg bg-background border-border"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm text-muted-foreground">
              Showing 1-24 of 987 templates
            </span>
            
            <div className="flex items-center space-x-4">
              <Select defaultValue="popular">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex rounded-lg border border-border">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className={`grid gap-6 ${
            viewMode === "grid" 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
              : "grid-cols-1"
          }`}>
            {templates.map((template) => (
              <Link key={template.id} to={`/product/${template.id}`}>
                <Card className="group cursor-pointer bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img
                        src={template.image}
                        alt={template.title}
                        className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                      
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge className="bg-background/90 text-foreground">
                          {template.category}
                        </Badge>
                        {template.isNew && (
                          <Badge className="bg-accent text-accent-foreground">New</Badge>
                        )}
                      </div>

                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button size="icon" variant="secondary" className="h-8 w-8">
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="secondary" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {template.title}
                      </h3>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={template.designerAvatar} />
                            <AvatarFallback>{template.designer[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">{template.designer}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-secondary fill-secondary" />
                          <span className="text-sm font-medium">{template.rating.toFixed(1)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Download className="h-3 w-3" />
                            <span>{template.downloads}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>{template.views}</span>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-primary">{template.price}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="flex justify-center mt-12">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">Previous</Button>
              <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <span className="text-muted-foreground">...</span>
              <Button variant="outline" size="sm">10</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Templates;
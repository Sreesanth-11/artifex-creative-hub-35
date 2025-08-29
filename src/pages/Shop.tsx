import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Heart,
  Download,
  Star,
  Eye,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { productAPI, Product } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Shop = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<
    Array<{ name: string; count: number }>
  >([]);
  const { toast } = useToast();

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await productAPI.getCategories();
        const allCategories = [
          {
            name: "all",
            count: response.data.categories.reduce(
              (sum, cat) => sum + cat.count,
              0
            ),
          },
          ...response.data.categories,
        ];
        setCategories(allCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const params: any = {
          page: currentPage,
          limit: 12,
        };

        if (selectedCategory !== "all") {
          params.category = selectedCategory;
        }

        if (searchQuery) {
          params.search = searchQuery;
        }

        if (sortBy === "price-low") params.sort = "price-low";
        else if (sortBy === "price-high") params.sort = "price-high";
        else if (sortBy === "popular") params.sort = "popular";
        else if (sortBy === "rating") params.sort = "rating";

        const response = await productAPI.getProducts(params);

        if (response.success) {
          setProducts(response.data.products);
          setTotalPages(response.data.pagination.pages);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, searchQuery, sortBy, currentPage, toast]);

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4 flex items-center">
          <Filter className="w-4 h-4 mr-2" />
          Categories
        </h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className={`w-full text-left p-3 rounded-lg transition-colors flex items-center justify-between ${
                selectedCategory === category.name
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "hover:bg-muted/50"
              }`}
            >
              <span className="capitalize">
                {category.name === "all" ? "All Categories" : category.name}
              </span>
              <Badge variant="secondary" className="text-xs">
                {category.count}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-4">Price Range</h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="rounded" />
            <span className="text-sm">Free</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="rounded" />
            <span className="text-sm">₹10 - ₹100</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="rounded" />
            <span className="text-sm">₹100 - ₹500</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="rounded" />
            <span className="text-sm">₹500+</span>
          </label>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-4">File Format</h3>
        <div className="space-y-2">
          {["PSD", "AI", "SVG", "PNG", "JPG", "PDF"].map((format) => (
            <label key={format} className="flex items-center space-x-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">{format}</span>
            </label>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-4">Rating</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center space-x-2">
              <input type="checkbox" className="rounded" />
              <div className="flex items-center space-x-1">
                {Array.from({ length: rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-3 h-3 text-yellow-400 fill-yellow-400"
                  />
                ))}
                {Array.from({ length: 5 - rating }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-gray-300" />
                ))}
                <span className="text-sm">& up</span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-8">
        {/* Search Header */}
        <div className="bg-muted/30 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h1 className="text-3xl md:text-4xl font-bold">
                Shop{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Creative Assets
                </span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Discover thousands of high-quality designs from talented
                creators worldwide
              </p>

              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search designs, templates, icons..."
                  className="pl-12 pr-4 h-12 text-lg bg-background border-border"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Sidebar Filters */}
            <aside className="hidden lg:block lg:w-64">
              <FilterContent />
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">
                    Showing 1-24 of 1,250 results
                  </span>
                </div>

                <div className="flex items-center space-x-4 w-full sm:w-auto">
                  {/* Mobile Filter Button */}
                  <Sheet
                    open={showMobileFilters}
                    onOpenChange={setShowMobileFilters}
                  >
                    <SheetTrigger asChild>
                      <Button variant="outline" className="lg:hidden">
                        <SlidersHorizontal className="w-4 h-4 mr-2" />
                        Filters
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80">
                      <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        <FilterContent />
                      </div>
                    </SheetContent>
                  </Sheet>

                  <Select defaultValue="newest">
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="price-low">
                        Price: Low to High
                      </SelectItem>
                      <SelectItem value="price-high">
                        Price: High to Low
                      </SelectItem>
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

              {/* Design Grid */}
              <div
                className={`grid gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-1"
                }`}
              >
                {isLoading ? (
                  // Loading skeleton
                  Array.from({ length: 6 }).map((_, index) => (
                    <Card key={index} className="animate-pulse">
                      <CardContent className="p-0">
                        <div className="w-full h-48 bg-muted rounded-t-lg"></div>
                        <div className="p-4 space-y-3">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                          <div className="h-3 bg-muted rounded w-1/4"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : products.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground">
                      No products found. Try adjusting your filters.
                    </p>
                  </div>
                ) : (
                  products.map((product) => (
                    <Link key={product._id} to={`/product/${product._id}`}>
                      <Card className="group cursor-pointer bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
                        <CardContent className="p-0">
                          {viewMode === "grid" ? (
                            <>
                              <div className="relative overflow-hidden rounded-t-lg">
                                <img
                                  src={
                                    product.images?.[0] ||
                                    "https://picsum.photos/300/200?random=1"
                                  }
                                  alt={product.title}
                                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />

                                {/* Badges */}
                                <div className="absolute top-3 left-3 flex gap-2">
                                  {product.isFeatured && (
                                    <Badge className="bg-accent text-accent-foreground">
                                      Featured
                                    </Badge>
                                  )}
                                  {product.isExclusive && (
                                    <Badge className="bg-secondary text-secondary-foreground">
                                      🔥 Exclusive
                                    </Badge>
                                  )}
                                </div>

                                {/* Action Buttons */}
                                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <Button
                                    size="icon"
                                    variant="secondary"
                                    className="h-8 w-8"
                                  >
                                    <Heart className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="secondary"
                                    className="h-8 w-8"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              <div className="p-4 space-y-3">
                                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                  {product.title}
                                </h3>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage
                                        src={
                                          product.seller?.avatar ||
                                          "https://picsum.photos/40/40?random=3"
                                        }
                                      />
                                      <AvatarFallback>
                                        {product.seller?.name?.[0] || "U"}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm text-muted-foreground">
                                      {product.seller?.name || "Unknown"}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Star className="h-4 w-4 text-secondary fill-secondary" />
                                    <span className="text-sm font-medium">
                                      {product.rating?.toFixed(1) || "0.0"}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                    <div className="flex items-center space-x-1">
                                      <Download className="h-3 w-3" />
                                      <span>{product.downloads || 0}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Eye className="h-3 w-3" />
                                      <span>{product.views || 0}</span>
                                    </div>
                                  </div>
                                  <span className="text-lg font-bold text-primary">
                                    ₹{product.price}
                                  </span>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="flex p-4 space-x-4">
                              <div className="relative">
                                <img
                                  src={
                                    product.images?.[0] ||
                                    "https://picsum.photos/300/200?random=2"
                                  }
                                  alt={product.title}
                                  className="w-24 h-24 object-cover rounded-lg"
                                />
                                {product.isFeatured && (
                                  <Badge className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs">
                                    Featured
                                  </Badge>
                                )}
                              </div>
                              <div className="flex-1 space-y-2">
                                <div className="flex items-start justify-between">
                                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                    {product.title}
                                  </h3>
                                  <span className="text-lg font-bold text-primary">
                                    ₹{product.price}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Avatar className="h-5 w-5">
                                    <AvatarImage
                                      src={
                                        product.seller?.avatar ||
                                        "https://picsum.photos/40/40?random=4"
                                      }
                                    />
                                    <AvatarFallback>
                                      {product.seller?.name?.[0] || "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm text-muted-foreground">
                                    {product.seller?.name || "Unknown"}
                                  </span>
                                  <div className="flex items-center space-x-1">
                                    <Star className="h-3 w-3 text-secondary fill-secondary" />
                                    <span className="text-sm">
                                      {product.rating?.toFixed(1) || "0.0"}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                  <div className="flex items-center space-x-1">
                                    <Download className="h-3 w-3" />
                                    <span>
                                      {product.downloads || 0} downloads
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Eye className="h-3 w-3" />
                                    <span>{product.views || 0} views</span>
                                  </div>
                                  <Badge variant="secondary">
                                    {product.category}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))
                )}
              </div>

              {/* Pagination */}
              <div className="flex justify-center mt-12">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-primary text-primary-foreground"
                  >
                    1
                  </Button>
                  <Button variant="outline" size="sm">
                    2
                  </Button>
                  <Button variant="outline" size="sm">
                    3
                  </Button>
                  <span className="text-muted-foreground">...</span>
                  <Button variant="outline" size="sm">
                    12
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;

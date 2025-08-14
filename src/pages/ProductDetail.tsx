import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Heart,
  Download,
  Star,
  Eye,
  Share2,
  ShoppingCart,
  MessageCircle,
  Flag,
  Calendar,
  FileText,
  Package,
  Shield,
} from "lucide-react";

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  // Mock product data
  const product = {
    id: productId,
    title: "Modern UI Kit - Dashboard Components",
    description: "A comprehensive collection of modern dashboard components designed for fintech and SaaS applications. This kit includes over 50+ components, multiple layout options, and is fully customizable.",
    longDescription: `This UI kit is perfect for creating modern dashboard interfaces. It includes:

• 50+ carefully crafted components
• Multiple color schemes and themes
• Responsive design patterns
• Figma and Sketch files included
• PSD source files
• Icon library with 200+ icons
• Typography guidelines
• Component documentation

All components are built with modern design principles and are fully customizable. Perfect for fintech apps, admin dashboards, analytics platforms, and more.`,
    price: 49,
    originalPrice: 79,
    discount: 38,
    rating: 4.8,
    reviewCount: 247,
    downloads: 3420,
    views: 15600,
    images: [
      "/api/placeholder/600/400",
      "/api/placeholder/600/400", 
      "/api/placeholder/600/400",
      "/api/placeholder/600/400",
    ],
    designer: {
      name: "Sarah Chen",
      avatar: "/api/placeholder/60/60",
      verified: true,
      followers: 12400,
      products: 24,
      joinDate: "March 2022",
    },
    category: "UI Kits",
    tags: ["ui-kit", "dashboard", "fintech", "components", "figma", "sketch"],
    files: [
      { name: "Dashboard-UI-Kit.fig", size: "15.2 MB", type: "Figma" },
      { name: "Components.sketch", size: "12.8 MB", type: "Sketch" },
      { name: "Assets.psd", size: "45.3 MB", type: "Photoshop" },
      { name: "Icons-Library.svg", size: "2.1 MB", type: "SVG" },
      { name: "Documentation.pdf", size: "1.2 MB", type: "PDF" },
    ],
    license: "Standard License",
    publishDate: "2024-01-15",
    lastUpdate: "2024-01-20",
  };

  const reviews = [
    {
      id: 1,
      user: "Alex Rodriguez",
      avatar: "/api/placeholder/40/40",
      rating: 5,
      date: "2 days ago",
      comment: "Excellent UI kit! Very well organized and easy to customize. Saved me tons of development time.",
    },
    {
      id: 2,
      user: "Maria Santos",
      avatar: "/api/placeholder/40/40",
      rating: 5,
      date: "1 week ago",
      comment: "Beautiful components and great documentation. Highly recommended for anyone building dashboards.",
    },
    {
      id: 3,
      user: "David Kim",
      avatar: "/api/placeholder/40/40",
      rating: 4,
      date: "2 weeks ago",
      comment: "Good quality design. Some components could use more variations but overall very satisfied.",
    },
  ];

  const relatedProducts = Array.from({ length: 4 }, (_, i) => ({
    id: i + 1,
    title: `Related Product ${i + 1}`,
    price: "$" + (Math.floor(Math.random() * 50) + 15),
    image: "/api/placeholder/200/150",
    rating: 4.5 + Math.random() * 0.5,
  }));

  const handlePurchase = () => {
    console.log("Purchase product:", product.id);
    // Handle purchase logic
  };

  const handleAddToCart = () => {
    console.log("Add to cart:", product.id);
    // Handle add to cart logic
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-8">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate("/shop")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Shop
            </Button>
            <div className="text-sm text-muted-foreground">
              Shop / {product.category} / {product.title}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Product Images */}
            <div className="lg:col-span-2 space-y-4">
              <div className="relative">
                <img
                  src={product.images[selectedImage]}
                  alt={product.title}
                  className="w-full aspect-video object-cover rounded-lg border border-border"
                />
                {product.discount > 0 && (
                  <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground">
                    -{product.discount}% OFF
                  </Badge>
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-primary' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{product.category}</Badge>
                  {product.designer.verified && (
                    <Badge variant="outline" className="text-accent">
                      Verified Designer
                    </Badge>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-4">{product.title}</h1>
                
                {/* Rating */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="font-medium">{product.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({product.reviewCount} reviews)
                  </span>
                </div>

                {/* Stats */}
                <div className="flex gap-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    {product.downloads} downloads
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {product.views} views
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-primary">${product.price}</span>
                  {product.originalPrice > product.price && (
                    <span className="text-lg text-muted-foreground line-through">
                      ${product.originalPrice}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <Button onClick={handlePurchase} className="w-full h-12 text-lg">
                    <Download className="w-5 h-5 mr-2" />
                    Buy Now - ${product.price}
                  </Button>
                  <Button onClick={handleAddToCart} variant="outline" className="w-full h-12">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsLiked(!isLiked)}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Flag className="w-4 h-4" />
                </Button>
              </div>

              <Separator />

              {/* Designer Info */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={product.designer.avatar} />
                      <AvatarFallback>{product.designer.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold">{product.designer.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {product.designer.followers} followers • {product.designer.products} products
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => navigate(`/chat/${product.designer.name.replace(' ', '-').toLowerCase()}`)}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={() => console.log("Following", product.designer.name)}
                    >
                      Follow
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Product Details */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold">Product Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">License:</span>
                      <span>{product.license}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Published:</span>
                      <span>{new Date(product.publishDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Update:</span>
                      <span>{new Date(product.lastUpdate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Files:</span>
                      <span>{product.files.length} files</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Product Tabs */}
          <div className="mt-12">
            <Tabs defaultValue="description" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="license">License</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">About this product</h3>
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-line">{product.longDescription}</p>
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="font-semibold mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="files" className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">Included Files</h3>
                    <div className="space-y-3">
                      {product.files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-primary" />
                            <div>
                              <p className="font-medium">{file.name}</p>
                              <p className="text-sm text-muted-foreground">{file.type} • {file.size}</p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            <Download className="w-3 h-3 mr-2" />
                            Preview
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold">Reviews ({product.reviewCount})</h3>
                      <Button 
                        variant="outline"
                        onClick={() => console.log("Opening review modal")}
                      >
                        Write a Review
                      </Button>
                    </div>
                    
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b border-border last:border-0 pb-6 last:pb-0">
                          <div className="flex items-start gap-4">
                            <Avatar>
                              <AvatarImage src={review.avatar} />
                              <AvatarFallback>{review.user[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">{review.user}</h4>
                                <div className="flex items-center">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3 h-3 ${
                                        i < review.rating
                                          ? 'text-yellow-400 fill-yellow-400'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-muted-foreground">{review.date}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{review.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="license">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">License Information</h3>
                    <div className="space-y-4 text-sm">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                          <h4 className="font-semibold">Standard License</h4>
                          <p className="text-muted-foreground">
                            This license allows you to use the design in personal and commercial projects.
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">What you can do:</h4>
                        <ul className="space-y-1 text-muted-foreground">
                          <li>• Use in unlimited personal and commercial projects</li>
                          <li>• Modify and customize the design</li>
                          <li>• Create derivative works</li>
                          <li>• Share with team members working on the same project</li>
                        </ul>
                      </div>

                      <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">What you cannot do:</h4>
                        <ul className="space-y-1 text-muted-foreground">
                          <li>• Redistribute or resell the original files</li>
                          <li>• Create competing products using these designs</li>
                          <li>• Use in themes or templates for resale</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Related Products */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Card 
                  key={relatedProduct.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/product/${relatedProduct.id}`)}
                >
                  <CardContent className="p-0">
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.title}
                      className="w-full aspect-video object-cover rounded-t-lg"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold mb-2 truncate">{relatedProduct.title}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm">{relatedProduct.rating.toFixed(1)}</span>
                        </div>
                        <span className="font-bold text-primary">{relatedProduct.price}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
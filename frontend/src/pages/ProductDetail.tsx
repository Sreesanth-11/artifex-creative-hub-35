import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WriteReviewDialog } from "@/components/ui/write-review-dialog";
import { useToast } from "@/hooks/use-toast";
import { productAPI, reviewAPI, orderAPI, userAPI, cartAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
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
  const { toast } = useToast();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [writeReviewDialogOpen, setWriteReviewDialogOpen] = useState(false);
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!productId) return;

      setIsLoading(true);
      try {
        const response = await productAPI.getById(productId);
        const data = response.data;

        console.log("Product API response:", data);
        console.log("Product data:", data.product);
        console.log("Seller data:", data.product?.seller);

        setProduct(data.product);
        setReviews((data as any).reviews || []);
        setRelatedProducts((data as any).relatedProducts || []);

        // Set like state if user is logged in
        if (user && data.product.likes) {
          setIsLiked(data.product.likes.includes(user._id));
          setLikeCount(data.product.likeCount || data.product.likes.length);
        } else {
          setLikeCount(data.product.likeCount || 0);
        }

        // Set follow state if user is logged in and seller exists
        if (user && data.product.seller) {
          // Check if current user is following the seller
          setIsFollowing(
            user.following?.includes(data.product.seller._id) || false
          );
          setFollowerCount((data.product.seller as any).followerCount || 0);
        } else if (data.product.seller) {
          setFollowerCount((data.product.seller as any).followerCount || 0);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setProduct(null); // Explicitly set to null on error
        toast({
          title: "Error",
          description: "Failed to load product details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductData();
  }, [productId, toast, user]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-8">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Loading product details...</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show error state if product not found
  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-8">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
              <p className="text-muted-foreground mb-6">
                The product you're looking for doesn't exist or has been
                removed.
              </p>
              <Button onClick={() => navigate("/shop")}>Back to Shop</Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handlePurchase = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to purchase this product",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!product) return;

    // Redirect to checkout page with product ID
    navigate(`/payment?product=${product._id}`);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart(product._id, 1);
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to like this product",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!product) return;

    try {
      const response = await productAPI.toggleProductLike(product.id);
      setIsLiked(response.data.isLiked);
      setLikeCount(response.data.likeCount);

      toast({
        title: response.data.isLiked
          ? "Added to Favorites"
          : "Removed from Favorites",
        description: response.data.isLiked
          ? "Product added to your favorites"
          : "Product removed from your favorites",
      });
    } catch (error) {
      console.error("Error toggling like:", error);
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive",
      });
    }
  };

  const handleContactSeller = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to contact the seller",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!product?.seller?._id) return;

    // Navigate to chat with the seller
    navigate(`/chat/${product.seller._id}`);
  };

  const handleFollow = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to follow this seller",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!product?.seller?._id) return;

    try {
      const response = await userAPI.toggleFollow(product.seller._id);
      setIsFollowing(response.data.isFollowing);
      setFollowerCount(response.data.followerCount);

      toast({
        title: response.data.isFollowing ? "Following" : "Unfollowed",
        description: response.data.isFollowing
          ? `You are now following ${product.seller.name}`
          : `You unfollowed ${product.seller.name}`,
      });
    } catch (error) {
      console.error("Error toggling follow:", error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-8">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" onClick={() => navigate("/shop")}>
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
                {(product.images as any[]).map((image: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index
                        ? "border-primary"
                        : "border-border hover:border-primary/50"
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
                <h1 className="text-2xl md:text-3xl font-bold mb-4">
                  {product.title}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
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
                  <span className="text-3xl font-bold text-primary">
                    ₹{product.price}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="text-lg text-muted-foreground line-through">
                      ₹{product.originalPrice}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handlePurchase}
                    className="w-full h-12 text-lg"
                    disabled={isPurchasing}
                  >
                    <Download className="w-5 h-5 mr-2" />
                    {isPurchasing
                      ? "Processing..."
                      : `Buy Now - ₹${product.price}`}
                  </Button>
                  <Button
                    onClick={handleAddToCart}
                    variant="outline"
                    className="w-full h-12"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handleLike}>
                  <Heart
                    className={`w-4 h-4 ${
                      isLiked ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
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
                      <AvatarImage src={product.seller?.avatar} />
                      <AvatarFallback>
                        {product.seller?.name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {product.seller?.name || "Unknown Seller"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {followerCount} followers •{" "}
                        {product.seller?.productsCount || 0} products
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleContactSeller}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button
                      className="flex-1"
                      variant={isFollowing ? "outline" : "default"}
                      onClick={handleFollow}
                    >
                      {isFollowing ? "Following" : "Follow"}
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
                      <span>
                        {new Date(product.publishDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Last Update:
                      </span>
                      <span>
                        {new Date(product.lastUpdate).toLocaleDateString()}
                      </span>
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
                    <h3 className="text-xl font-bold mb-4">
                      About this product
                    </h3>
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-line">
                        {product.longDescription}
                      </p>
                    </div>

                    <div className="mt-6">
                      <h4 className="font-semibold mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {(product.tags as any[]).map((tag: any) => (
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
                      {(product.files as any[]).map(
                        (file: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-muted rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-primary" />
                              <div>
                                <p className="font-medium">{file.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {file.type} • {file.size}
                                </p>
                              </div>
                            </div>
                            <Button size="sm" variant="outline">
                              <Download className="w-3 h-3 mr-2" />
                              Preview
                            </Button>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold">
                        Reviews ({product.reviewCount})
                      </h3>
                      <Button
                        variant="outline"
                        onClick={() => setWriteReviewDialogOpen(true)}
                      >
                        Write a Review
                      </Button>
                    </div>

                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div
                          key={review.id}
                          className="border-b border-border last:border-0 pb-6 last:pb-0"
                        >
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
                                          ? "text-yellow-400 fill-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {review.date}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {review.comment}
                              </p>
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
                    <h3 className="text-xl font-bold mb-4">
                      License Information
                    </h3>
                    <div className="space-y-4 text-sm">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                          <h4 className="font-semibold">Standard License</h4>
                          <p className="text-muted-foreground">
                            This license allows you to use the design in
                            personal and commercial projects.
                          </p>
                        </div>
                      </div>

                      <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">What you can do:</h4>
                        <ul className="space-y-1 text-muted-foreground">
                          <li>
                            • Use in unlimited personal and commercial projects
                          </li>
                          <li>• Modify and customize the design</li>
                          <li>• Create derivative works</li>
                          <li>
                            • Share with team members working on the same
                            project
                          </li>
                        </ul>
                      </div>

                      <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">
                          What you cannot do:
                        </h4>
                        <ul className="space-y-1 text-muted-foreground">
                          <li>• Redistribute or resell the original files</li>
                          <li>
                            • Create competing products using these designs
                          </li>
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
                      <h3 className="font-semibold mb-2 truncate">
                        {relatedProduct.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm">
                            {relatedProduct.rating.toFixed(1)}
                          </span>
                        </div>
                        <span className="font-bold text-primary">
                          {relatedProduct.price}
                        </span>
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

      <WriteReviewDialog
        open={writeReviewDialogOpen}
        onOpenChange={setWriteReviewDialogOpen}
        productName={product.title}
        productId={product.id}
        onReviewSubmitted={(newReview) => {
          setReviews((prev) => [newReview, ...prev]);
        }}
      />
    </div>
  );
};

export default ProductDetail;

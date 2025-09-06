import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { userAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Star,
  Users,
  Download,
  Heart,
  MessageCircle,
  MapPin,
  Calendar,
} from "lucide-react";

const PublicProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;

      try {
        setIsLoading(true);

        // Fetch user profile
        const userResponse = await userAPI.getUserProfile(userId);
        if (userResponse.success) {
          setUser(userResponse.data.user);

          // Check if current user is following this user
          if (currentUser && userResponse.data.user.followers) {
            setIsFollowing(
              userResponse.data.user.followers.includes(currentUser._id)
            );
          }
        }

        // Fetch user products
        const productsResponse = await userAPI.getUserProducts(userId, {
          page: 1,
          limit: 12,
        });
        if (productsResponse.success) {
          setProducts(productsResponse.data.products);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId, currentUser, toast]);

  const handleFollow = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (!userId) return;

    try {
      setFollowLoading(true);
      const response = await userAPI.toggleFollow(userId);

      if (response.success) {
        setIsFollowing(response.data.isFollowing);
        setUser((prev) => ({
          ...prev,
          followerCount: response.data.followerCount,
        }));

        toast({
          title: response.data.isFollowing ? "Following" : "Unfollowed",
          description: `You are ${
            response.data.isFollowing ? "now following" : "no longer following"
          } ${user?.name}`,
        });
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    } finally {
      setFollowLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">User not found</h2>
            <p className="text-muted-foreground mb-4">
              The profile you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate("/")}>Go Home</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Cover Image */}
      <div className="relative h-80 bg-gradient-to-r from-primary/20 to-secondary/20">
        {user.banner ? (
          <img
            src={user.banner}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/20 to-secondary/20" />
        )}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Profile Header */}
      <div className="relative -mt-20 pb-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6">
            <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-4xl">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">{user.name}</h1>
                <p className="text-xl text-primary">
                  @{user.name.toLowerCase().replace(/\s+/g, "")}
                </p>
                <p className="text-muted-foreground mt-2 max-w-2xl">
                  {user.bio ||
                    "Creative professional passionate about design and innovation."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {user.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{user.location}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Joined{" "}
                    {new Date(user.joinDate).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {user.rating > 0 && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-secondary fill-secondary" />
                    <span className="font-semibold">
                      {user.rating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {user.followerCount || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {user.followingCount || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {user.totalSales || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Sales</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {user.productsCount || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Products</div>
                </div>
              </div>
            </div>

            {currentUser && currentUser._id !== userId && (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  className="rounded-full"
                  onClick={handleFollow}
                  disabled={followLoading}
                  variant={isFollowing ? "outline" : "default"}
                >
                  {followLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Users className="w-4 h-4 mr-2" />
                  )}
                  {isFollowing ? "Unfollow" : "Follow"}
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full w-full"
                  onClick={() => navigate(`/chat/${userId}`)}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Products</h2>
          <p className="text-muted-foreground">
            Browse {user.name}'s design collection
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.length > 0 ? (
            products.map((product) => (
              <Link key={product._id} to={`/product/${product._id}`}>
                <Card className="group cursor-pointer overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden">
                      <img
                        src={
                          product.images?.[0] ||
                          product.image ||
                          "/api/placeholder/400/300"
                        }
                        alt={product.title}
                        className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <Badge className="absolute top-4 left-4 bg-background text-foreground">
                        {product.category}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-4 right-4 bg-background/80 hover:bg-background rounded-full p-2"
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="p-6 space-y-4">
                      <h3 className="font-bold text-xl group-hover:text-primary transition-colors">
                        {product.title}
                      </h3>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-secondary fill-secondary" />
                            <span className="font-semibold">
                              {product.rating?.toFixed(1) || "0.0"}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1 text-muted-foreground">
                            <Download className="h-4 w-4" />
                            <span className="text-sm">
                              {product.downloads || 0}
                            </span>
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-primary">
                          ₹{product.price}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-muted-foreground">
                <h3 className="text-xl font-semibold mb-2">No products yet</h3>
                <p>{user.name} hasn't uploaded any products yet.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PublicProfile;

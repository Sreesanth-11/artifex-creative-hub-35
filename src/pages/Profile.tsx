import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Settings,
  Camera,
  Edit,
  Heart,
  MessageCircle,
  ShoppingBag,
  Users,
  Plus,
  Eye,
  Download,
  Star,
  MapPin,
  Calendar,
  Link as LinkIcon,
  LogOut,
  Loader2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { userAPI, productAPI, orderAPI, downloadsAPI } from "@/lib/api";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [userProducts, setUserProducts] = useState([]);
  const [userOrders, setUserOrders] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const navigate = useNavigate();
  const { user, logout, updateUser, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // User data from auth context and API
  const [userData, setUserData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: user?.bio || "",
    location: user?.location || "",
    website: user?.website || "",
    avatar: user?.avatar || "",
    joinDate: user?.joinDate
      ? new Date(user.joinDate).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      : "",
  });

  // Update local state when user data changes
  useEffect(() => {
    if (user) {
      setUserData((prev) => ({
        ...prev,
        name: user.name,
        email: user.email,
        joinDate: new Date(user.joinDate).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
        avatar: user.avatar || "",
      }));
    }
  }, [user]);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        // Fetch user profile
        const profileResponse = await userAPI.getUserProfile();
        setProfileData(profileResponse.data.user);

        // Update local userData with fetched data
        setUserData((prev) => ({
          ...prev,
          name: profileResponse.data.user.name || prev.name,
          bio: profileResponse.data.user.bio || prev.bio,
          location: profileResponse.data.user.location || prev.location,
          website: profileResponse.data.user.website || prev.website,
          avatar: profileResponse.data.user.avatar || prev.avatar,
        }));

        // Fetch user products
        const productsResponse = await userAPI.getUserProducts(user._id, {
          limit: 12,
        });
        setUserProducts(productsResponse.data.products);

        // Fetch user orders
        const ordersResponse = await orderAPI.getUserOrders({ limit: 10 });
        setUserOrders(ordersResponse.data.orders);

        // Fetch user stats
        const statsResponse = await userAPI.getUserStats();
        setUserStats(statsResponse.data.stats);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [user, toast]);

  // Use real stats or fallback to defaults
  const stats = userStats || {
    productsCount: 0,
    totalSales: 0,
    totalDownloads: 0,
    totalViews: 0,
    totalOrders: 0,
    followers: profileData?.followerCount || 0,
    following: profileData?.followingCount || 0,
    likes: profileData?.totalLikes || 0,
    rating: profileData?.rating || 0,
  };

  // Use real products data or empty array
  const products = userProducts;

  const followers = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: `Designer ${i + 1}`,
    avatar: `/api/placeholder/40/40`,
    specialty: ["UI/UX", "Branding", "Illustration", "Photography"][
      Math.floor(Math.random() * 4)
    ],
    isFollowing: Math.random() > 0.5,
  }));

  const handleDownload = async (orderId: string, productTitle: string) => {
    try {
      toast({
        title: "Download Starting",
        description: `Preparing ${productTitle} for download...`,
      });

      const response = await downloadsAPI.downloadFile(orderId);

      // Create blob and download
      const blob = new Blob([response.data], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${productTitle.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )}_download.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Complete",
        description: `${productTitle} has been downloaded successfully`,
      });

      // Refresh orders to update download count
      fetchOrders();
    } catch (error: any) {
      console.error("Download error:", error);
      toast({
        title: "Download Failed",
        description: error.response?.data?.message || "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploadingAvatar(true);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("avatar", file);

      // Upload avatar using the API
      const response = await userAPI.uploadAvatar(formData);

      if (response.success) {
        setUserData((prev) => ({
          ...prev,
          avatar: response.data.avatarUrl,
        }));

        toast({
          title: "Avatar Updated",
          description: "Your profile picture has been updated successfully",
        });
      }
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Upload Failed",
        description: error.response?.data?.error || "Failed to upload avatar",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleBannerUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploadingBanner(true);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("banner", file);

      // Upload banner using the API
      const response = await userAPI.uploadBanner(formData);

      if (response.success) {
        setUserData((prev) => ({
          ...prev,
          banner: response.data.bannerUrl,
        }));

        toast({
          title: "Banner Updated",
          description: "Your banner image has been updated successfully",
        });
      }
    } catch (error: any) {
      console.error("Error uploading banner:", error);
      toast({
        title: "Upload Failed",
        description: error.response?.data?.error || "Failed to upload banner",
        variant: "destructive",
      });
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // Update profile using the API
      const response = await userAPI.updateUserProfile({
        name: userData.name,
        bio: userData.bio,
        location: userData.location,
        website: userData.website,
        avatar: userData.avatar,
      });

      // Update auth context
      const success = await updateUser({
        name: userData.name,
        email: userData.email,
      });

      if (success) {
        setIsEditing(false);
        // Update profile data with response
        setProfileData(response.data.user);
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        });
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description:
          error.response?.data?.error ||
          "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStartChat = (userId: number) => {
    navigate(`/chat/${userId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-8">
        <div className="container mx-auto px-4 py-8">
          {/* Profile Header */}
          <div className="relative">
            {/* Cover Photo */}
            <div className="h-48 md:h-64 bg-gradient-primary rounded-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-black/20" />
              <Button
                size="icon"
                variant="secondary"
                className="absolute top-4 right-4"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>

            {/* Profile Info */}
            <div className="relative px-6 pb-6">
              <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16 md:-mt-20">
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-background">
                    <AvatarImage src={userData.avatar} />
                    <AvatarFallback className="text-2xl">
                      {userData.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-2 right-2 h-8 w-8"
                  >
                    <Camera className="w-3 h-3" />
                  </Button>
                </div>

                {/* User Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold">
                        {userData.name}
                      </h1>
                      <p className="text-muted-foreground">{userData.bio}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(!isEditing)}
                        disabled={authLoading}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                      <Button variant="outline">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleLogout}
                        disabled={authLoading}
                      >
                        {authLoading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <LogOut className="w-4 h-4 mr-2" />
                        )}
                        Logout
                      </Button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-lg">{stats.products}</div>
                      <div className="text-muted-foreground">Products</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg">{stats.followers}</div>
                      <div className="text-muted-foreground">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg">{stats.following}</div>
                      <div className="text-muted-foreground">Following</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg">{stats.likes}</div>
                      <div className="text-muted-foreground">Likes</div>
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {userData.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <LinkIcon className="w-3 h-3" />
                      {userData.website}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Joined {userData.joinDate}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="mt-8">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="downloads">Downloads</TabsTrigger>
                <TabsTrigger value="following">Following</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Recent Products */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Recent Products</CardTitle>
                      <Link to="/add-product">
                        <Button size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Product
                        </Button>
                      </Link>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {products.slice(0, 3).map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center space-x-3"
                          >
                            <img
                              src={product.image}
                              alt={product.title}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">
                                {product.title}
                              </h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Heart className="w-3 h-3" />
                                {product.likes}
                                <Download className="w-3 h-3" />
                                {product.downloads}
                              </div>
                            </div>
                            <span className="font-bold text-primary">
                              {product.price}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-primary rounded-full" />
                          <span className="text-sm">
                            New follower: Sarah Chen
                          </span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            2h ago
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-secondary rounded-full" />
                          <span className="text-sm">
                            Product liked: Logo Design Kit
                          </span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            4h ago
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-accent rounded-full" />
                          <span className="text-sm">
                            New comment on UI Components
                          </span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            1d ago
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Products Tab */}
              <TabsContent value="products" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">
                    My Products ({products.length})
                  </h2>
                  <Link to="/add-product">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Product
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <Card
                      key={product.id}
                      className="group cursor-pointer hover:shadow-lg transition-shadow"
                    >
                      <CardContent className="p-0">
                        <div className="relative overflow-hidden rounded-t-lg">
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 right-2 flex gap-1">
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-6 w-6"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="p-4 space-y-2">
                          <h3 className="font-semibold truncate">
                            {product.title}
                          </h3>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                {product.likes}
                              </div>
                              <div className="flex items-center gap-1">
                                <Download className="w-3 h-3" />
                                {product.downloads}
                              </div>
                            </div>
                            <span className="font-bold text-primary">
                              {product.price}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Downloads Tab */}
              <TabsContent value="downloads" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">
                    My Downloads ({userOrders.length})
                  </h2>
                  {userOrders.length > 0 && (
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      View All Downloads
                    </Button>
                  )}
                </div>

                {userOrders.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Download className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">
                        No Downloads Yet
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        You haven't purchased any products yet. Browse our
                        marketplace to find amazing designs!
                      </p>
                      <Button onClick={() => navigate("/")}>
                        Browse Products
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userOrders.map((order) => (
                      <Card
                        key={order.id}
                        className="group cursor-pointer overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={() => navigate(`/product/${order.product.id}`)}
                      >
                        <CardContent className="p-0">
                          <div className="relative overflow-hidden">
                            <img
                              src={order.product.image}
                              alt={order.product.title}
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <Badge className="absolute top-4 left-4 bg-background text-foreground">
                              {order.product.category}
                            </Badge>
                            <div className="absolute top-4 right-4 bg-background/80 rounded-full p-2">
                              <Download className="h-4 w-4" />
                            </div>
                          </div>

                          <div className="p-4 space-y-3">
                            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                              {order.product.title}
                            </h3>

                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground font-medium">
                                {order.product.seller.name}
                              </span>
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-secondary fill-secondary" />
                                <span className="font-semibold">
                                  {order.product.rating || 4.5}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>Purchased on {order.purchaseDate}</span>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                              <span className="text-xl font-bold text-primary">
                                ₹{order.amount}
                              </span>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-full"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/product/${order.product.id}`);
                                  }}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-primary hover:bg-primary/90 rounded-full"
                                  disabled={!order.canDownload}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownload(
                                      order._id,
                                      order.product.title
                                    );
                                  }}
                                >
                                  <Download className="w-4 h-4 mr-1" />
                                  {order.canDownload ? "Download" : "Expired"}
                                </Button>
                              </div>
                            </div>

                            <div className="text-xs text-muted-foreground">
                              Downloads: {order.downloadCount}/
                              {order.maxDownloads}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Following Tab */}
              <TabsContent value="following" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">
                    Following ({followers.length})
                  </h2>
                  <Button variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Find More Designers
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {followers.map((follower) => (
                    <Card key={follower.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={follower.avatar} />
                            <AvatarFallback>{follower.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">
                              {follower.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {follower.specialty}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant={
                                follower.isFollowing ? "outline" : "default"
                              }
                            >
                              {follower.isFollowing ? "Following" : "Follow"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStartChat(follower.id)}
                            >
                              <MessageCircle className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <div className="space-y-4">
                        {/* Profile Image Upload */}
                        <div className="space-y-2">
                          <Label>Profile Picture</Label>
                          <div className="flex items-center gap-4">
                            <Avatar className="w-16 h-16">
                              <AvatarImage src={userData.avatar} />
                              <AvatarFallback>
                                {userData.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                className="hidden"
                                id="avatar-upload"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={isUploadingAvatar}
                                onClick={() =>
                                  document
                                    .getElementById("avatar-upload")
                                    ?.click()
                                }
                              >
                                {isUploadingAvatar
                                  ? "Uploading..."
                                  : "Change Picture"}
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Banner Image Upload */}
                        <div className="space-y-2">
                          <Label>Banner Image</Label>
                          <div className="space-y-2">
                            {userData.banner && (
                              <div className="w-full h-32 rounded-lg overflow-hidden bg-muted">
                                <img
                                  src={userData.banner}
                                  alt="Banner"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleBannerUpload}
                                className="hidden"
                                id="banner-upload"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={isUploadingBanner}
                                onClick={() =>
                                  document
                                    .getElementById("banner-upload")
                                    ?.click()
                                }
                              >
                                {isUploadingBanner
                                  ? "Uploading..."
                                  : userData.banner
                                  ? "Change Banner"
                                  : "Add Banner"}
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={userData.name}
                            onChange={(e) =>
                              setUserData((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={userData.email}
                            onChange={(e) =>
                              setUserData((prev) => ({
                                ...prev,
                                email: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            value={userData.bio}
                            onChange={(e) =>
                              setUserData((prev) => ({
                                ...prev,
                                bio: e.target.value,
                              }))
                            }
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={userData.location}
                            onChange={(e) =>
                              setUserData((prev) => ({
                                ...prev,
                                location: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            value={userData.website}
                            onChange={(e) =>
                              setUserData((prev) => ({
                                ...prev,
                                website: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleSaveProfile}>
                            Save Changes
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <Label>Full Name</Label>
                          <p className="mt-1">{userData.name}</p>
                        </div>
                        <div>
                          <Label>Email</Label>
                          <p className="mt-1">{userData.email}</p>
                        </div>
                        <div>
                          <Label>Bio</Label>
                          <p className="mt-1">{userData.bio}</p>
                        </div>
                        <div>
                          <Label>Location</Label>
                          <p className="mt-1">{userData.location}</p>
                        </div>
                        <div>
                          <Label>Website</Label>
                          <p className="mt-1">{userData.website}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Account Security</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Two-Factor Authentication
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Privacy Settings
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;

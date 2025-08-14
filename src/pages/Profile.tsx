import { useState } from "react";
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
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  // Mock user data
  const [userData, setUserData] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    bio: "Passionate UI/UX designer with 5+ years of experience creating beautiful and functional digital experiences.",
    location: "San Francisco, CA",
    website: "alexjohnson.design",
    joinDate: "March 2023",
    avatar: "/api/placeholder/120/120",
  });

  const stats = {
    products: 24,
    followers: 1248,
    following: 156,
    likes: 5420,
  };

  const products = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    title: `Design Product ${i + 1}`,
    price: "$" + (Math.floor(Math.random() * 50) + 10),
    image: `/api/placeholder/300/200`,
    likes: Math.floor(Math.random() * 100) + 10,
    downloads: Math.floor(Math.random() * 500) + 50,
    rating: 4.5 + Math.random() * 0.5,
  }));

  const followers = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: `Designer ${i + 1}`,
    avatar: `/api/placeholder/40/40`,
    specialty: ["UI/UX", "Branding", "Illustration", "Photography"][Math.floor(Math.random() * 4)],
    isFollowing: Math.random() > 0.5,
  }));

  const handleSaveProfile = () => {
    setIsEditing(false);
    // Save profile data
    console.log("Saving profile:", userData);
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
                    <AvatarFallback className="text-2xl">{userData.name[0]}</AvatarFallback>
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
                      <h1 className="text-2xl md:text-3xl font-bold">{userData.name}</h1>
                      <p className="text-muted-foreground">{userData.bio}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                      <Button>
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
                          <div key={product.id} className="flex items-center space-x-3">
                            <img
                              src={product.image}
                              alt={product.title}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{product.title}</h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Heart className="w-3 h-3" />
                                {product.likes}
                                <Download className="w-3 h-3" />
                                {product.downloads}
                              </div>
                            </div>
                            <span className="font-bold text-primary">{product.price}</span>
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
                          <span className="text-sm">New follower: Sarah Chen</span>
                          <span className="text-xs text-muted-foreground ml-auto">2h ago</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-secondary rounded-full" />
                          <span className="text-sm">Product liked: Logo Design Kit</span>
                          <span className="text-xs text-muted-foreground ml-auto">4h ago</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-accent rounded-full" />
                          <span className="text-sm">New comment on UI Components</span>
                          <span className="text-xs text-muted-foreground ml-auto">1d ago</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Products Tab */}
              <TabsContent value="products" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">My Products ({products.length})</h2>
                  <Link to="/add-product">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Product
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <Card key={product.id} className="group cursor-pointer hover:shadow-lg transition-shadow">
                      <CardContent className="p-0">
                        <div className="relative overflow-hidden rounded-t-lg">
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 right-2 flex gap-1">
                            <Button size="icon" variant="secondary" className="h-6 w-6">
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="p-4 space-y-2">
                          <h3 className="font-semibold truncate">{product.title}</h3>
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
                            <span className="font-bold text-primary">{product.price}</span>
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
                  <h2 className="text-xl font-bold">My Downloads (3)</h2>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    View All Downloads
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      id: 1,
                      title: "Modern Minimalist Logo Pack",
                      designer: "Sarah Chen",
                      price: "$29",
                      image: "/src/assets/hero-design-1.jpg",
                      category: "Logos",
                      downloadDate: "2024-01-15",
                      rating: 4.9,
                    },
                    {
                      id: 2,
                      title: "Social Media Template Bundle",
                      designer: "Alex Rodriguez", 
                      price: "$45",
                      image: "/src/assets/hero-design-2.jpg",
                      category: "Templates",
                      downloadDate: "2024-01-10",
                      rating: 4.8,
                    },
                    {
                      id: 3,
                      title: "Icon Set - Business & Finance",
                      designer: "Emma Thompson",
                      price: "$19",
                      image: "/src/assets/hero-design-3.jpg",
                      category: "Icons",
                      downloadDate: "2024-01-08",
                      rating: 5.0,
                    },
                  ].map((item) => (
                    <Card key={item.id} className="group cursor-pointer overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-0">
                        <div className="relative overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <Badge className="absolute top-4 left-4 bg-background text-foreground">
                            {item.category}
                          </Badge>
                          <div className="absolute top-4 right-4 bg-background/80 rounded-full p-2">
                            <Download className="h-4 w-4" />
                          </div>
                        </div>

                        <div className="p-4 space-y-3">
                          <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                            {item.title}
                          </h3>

                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground font-medium">{item.designer}</span>
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-secondary fill-secondary" />
                              <span className="font-semibold">{item.rating}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Downloaded on {new Date(item.downloadDate).toLocaleDateString()}</span>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <span className="text-xl font-bold text-primary">{item.price}</span>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" className="rounded-full">
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              <Button size="sm" className="bg-primary hover:bg-primary/90 rounded-full">
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Following Tab */}
              <TabsContent value="following" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Following ({followers.length})</h2>
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
                            <h3 className="font-medium truncate">{follower.name}</h3>
                            <p className="text-sm text-muted-foreground">{follower.specialty}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStartChat(follower.id)}
                            >
                              <MessageCircle className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant={follower.isFollowing ? "outline" : "default"}
                            >
                              {follower.isFollowing ? "Following" : "Follow"}
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
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={userData.name}
                            onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={userData.email}
                            onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            value={userData.bio}
                            onChange={(e) => setUserData(prev => ({ ...prev, bio: e.target.value }))}
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={userData.location}
                            onChange={(e) => setUserData(prev => ({ ...prev, location: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            value={userData.website}
                            onChange={(e) => setUserData(prev => ({ ...prev, website: e.target.value }))}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleSaveProfile}>Save Changes</Button>
                          <Button variant="outline" onClick={() => setIsEditing(false)}>
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
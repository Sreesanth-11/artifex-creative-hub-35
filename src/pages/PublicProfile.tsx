import { useParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Users, Download, Heart, MessageCircle, MapPin, Calendar } from "lucide-react";

const PublicProfile = () => {
  const { userId } = useParams();

  // Mock user data - replace with API call
  const user = {
    id: userId,
    name: "Sarah Chen",
    username: "@sarahdesigns",
    bio: "Creative designer specializing in minimalist logos and brand identity. Passionate about clean aesthetics and meaningful design.",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=300&fit=crop",
    location: "San Francisco, CA",
    joinDate: "March 2023",
    rating: 4.9,
    totalSales: 1250,
    followers: 8400,
    following: 342,
    products: [
      {
        id: 1,
        title: "Modern Minimalist Logo Pack",
        price: "$29",
        image: "/src/assets/hero-design-1.jpg",
        category: "Logos",
        rating: 4.9,
        downloads: 234,
      },
      {
        id: 2,
        title: "Brand Identity Templates",
        price: "$45",
        image: "/src/assets/hero-design-2.jpg",
        category: "Templates",
        rating: 4.8,
        downloads: 189,
      },
      {
        id: 3,
        title: "Icon Set Collection",
        price: "$19",
        image: "/src/assets/hero-design-3.jpg",
        category: "Icons",
        rating: 5.0,
        downloads: 312,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Cover Image */}
      <div className="relative h-80 bg-gradient-to-r from-primary/20 to-secondary/20">
        <img
          src={user.coverImage}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Profile Header */}
      <div className="relative -mt-20 pb-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6">
            <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">{user.name}</h1>
                <p className="text-xl text-primary">{user.username}</p>
                <p className="text-muted-foreground mt-2 max-w-2xl">{user.bio}</p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{user.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {user.joinDate}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-secondary fill-secondary" />
                  <span className="font-semibold">{user.rating}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{user.followers}</div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{user.following}</div>
                  <div className="text-sm text-muted-foreground">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{user.totalSales}</div>
                  <div className="text-sm text-muted-foreground">Sales</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="rounded-full">
                <Users className="w-4 h-4 mr-2" />
                Follow
              </Button>
              <Link to={`/chat/${user.id}`}>
                <Button variant="outline" className="rounded-full w-full">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Products</h2>
          <p className="text-muted-foreground">Browse {user.name}'s design collection</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {user.products.map((product) => (
            <Link key={product.id} to={`/product/${product.id}`}>
              <Card className="group cursor-pointer overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden">
                    <img
                      src={product.image}
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
                          <span className="font-semibold">{product.rating}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-muted-foreground">
                          <Download className="h-4 w-4" />
                          <span className="text-sm">{product.downloads}</span>
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-primary">{product.price}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PublicProfile;
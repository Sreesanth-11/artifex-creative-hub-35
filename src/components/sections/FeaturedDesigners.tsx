import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Star,
  Users,
  Download,
  MapPin,
  Instagram,
  Award,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { communityAPI } from "@/lib/api";

const FeaturedDesigners = () => {
  const [featuredDesigners, setFeaturedDesigners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedDesigners = async () => {
      try {
        setIsLoading(true);
        const response = await communityAPI.getFeaturedUsers(4);
        if (response.success) {
          setFeaturedDesigners(response.data.users);
        }
      } catch (error) {
        console.error("Error fetching featured designers:", error);
        // Fallback to empty array if API fails
        setFeaturedDesigners([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedDesigners();
  }, []);

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-secondary/10 text-secondary border-secondary/20">
            <Award className="w-3 h-3 mr-1" />
            Featured Designers
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Meet Our <span className="bg-gradient-primary bg-clip-text text-transparent">Top Creators</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover talented designers who are pushing creative boundaries and delivering exceptional work to our community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="relative mx-auto w-20 h-20">
                    <div className="w-20 h-20 bg-muted rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-24 mx-auto"></div>
                    <div className="h-3 bg-muted rounded w-32 mx-auto"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="h-8 bg-muted rounded"></div>
                    <div className="h-8 bg-muted rounded"></div>
                    <div className="h-8 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : featuredDesigners.length > 0 ? (
            featuredDesigners.map((designer) => (
              <Link key={designer._id} to={`/profile/${designer._id}`}>
                <Card className="group cursor-pointer bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1">
                <CardContent className="p-6 text-center space-y-4">
                  {/* Avatar & Verification */}
                  <div className="relative mx-auto w-20 h-20">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={designer.avatar} />
                      <AvatarFallback className="text-lg">{designer.name?.[0]}</AvatarFallback>
                    </Avatar>
                    {designer.isVerified && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                        <Award className="w-3 h-3 text-accent-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Designer Info */}
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {designer.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {designer.bio || "Creative designer"}
                    </p>
                    <div className="flex items-center justify-center space-x-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{designer.location || "Location not set"}</span>
                    </div>
                  </div>

                  {/* Rating & Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="space-y-1">
                      <div className="flex items-center justify-center space-x-1">
                        <Star className="w-3 h-3 text-secondary fill-secondary" />
                        <span className="text-sm font-medium">
                          {designer.rating?.toFixed(1) || "0.0"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center space-x-1">
                        <Users className="w-3 h-3 text-accent" />
                        <span className="text-sm font-medium">
                          {designer.followerCount || 0}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Followers</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center space-x-1">
                        <Download className="w-3 h-3 text-primary" />
                        <span className="text-sm font-medium">
                          {designer.postCount || 0}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Posts</p>
                    </div>
                  </div>

                  {/* Follow Button */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    View Portfolio
                  </Button>
                </CardContent>
              </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No featured designers yet</h3>
              <p className="text-muted-foreground">
                Featured designers will appear here soon.
              </p>
            </div>
          )}
        </div>

        <div className="text-center">
          <Link to="/community">
            <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              Discover More Designers
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedDesigners;
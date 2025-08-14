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
} from "lucide-react";

const FeaturedDesigners = () => {
  const featuredDesigners = [
    {
      id: 1,
      name: "Sarah Chen",
      title: "Brand Identity Specialist",
      avatar: "/api/placeholder/80/80",
      location: "San Francisco, CA",
      rating: 4.9,
      followers: "12.4k",
      downloads: "45.2k",
      portfolio: 89,
      verified: true,
      social: {
        instagram: "@sarahchen_design",
        dribbble: "sarahchen",
        behance: "sarahchen",
      },
      specialties: ["Logos", "Branding", "Typography"],
      recent_work: ["/api/placeholder/100/100", "/api/placeholder/100/100", "/api/placeholder/100/100"],
    },
    {
      id: 2,
      name: "Marcus Johnson",
      title: "UI/UX Designer",
      avatar: "/api/placeholder/80/80",
      location: "New York, NY",
      rating: 4.8,
      followers: "8.9k",
      downloads: "32.1k",
      portfolio: 67,
      verified: true,
      social: {
        instagram: "@marcusux",
        dribbble: "marcusj",
        behance: "marcusjohnson",
      },
      specialties: ["UI Design", "Mobile Apps", "Web Design"],
      recent_work: ["/api/placeholder/100/100", "/api/placeholder/100/100", "/api/placeholder/100/100"],
    },
    {
      id: 3,
      name: "Emma Thompson",
      title: "Illustration Artist",
      avatar: "/api/placeholder/80/80",
      location: "London, UK",
      rating: 5.0,
      followers: "15.7k",
      downloads: "67.8k",
      portfolio: 124,
      verified: true,
      social: {
        instagram: "@emmaillustrates",
        dribbble: "emmathompson",
        behance: "emmathompson",
      },
      specialties: ["Illustrations", "Digital Art", "Character Design"],
      recent_work: ["/api/placeholder/100/100", "/api/placeholder/100/100", "/api/placeholder/100/100"],
    },
    {
      id: 4,
      name: "Alex Rodriguez",
      title: "Motion Graphics Designer",
      avatar: "/api/placeholder/80/80",
      location: "Barcelona, Spain",
      rating: 4.7,
      followers: "6.3k",
      downloads: "28.5k",
      portfolio: 52,
      verified: false,
      social: {
        instagram: "@alexmotion",
        dribbble: "alexrodriguez",
        behance: "alexrodriguez",
      },
      specialties: ["Motion Graphics", "Animation", "Video"],
      recent_work: ["/api/placeholder/100/100", "/api/placeholder/100/100", "/api/placeholder/100/100"],
    },
  ];

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
          {featuredDesigners.map((designer) => (
            <Link key={designer.id} to={`/profile/${designer.id}`}>
              <Card className="group cursor-pointer bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1">
              <CardContent className="p-6 text-center space-y-4">
                {/* Avatar & Verification */}
                <div className="relative mx-auto w-20 h-20">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={designer.avatar} />
                    <AvatarFallback className="text-lg">{designer.name[0]}</AvatarFallback>
                  </Avatar>
                  {designer.verified && (
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
                  <p className="text-sm text-muted-foreground">{designer.title}</p>
                  <div className="flex items-center justify-center space-x-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{designer.location}</span>
                  </div>
                </div>

                {/* Rating & Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="space-y-1">
                    <div className="flex items-center justify-center space-x-1">
                      <Star className="w-3 h-3 text-secondary fill-secondary" />
                      <span className="text-sm font-medium">{designer.rating}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center space-x-1">
                      <Users className="w-3 h-3 text-accent" />
                      <span className="text-sm font-medium">{designer.followers}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Followers</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center space-x-1">
                      <Download className="w-3 h-3 text-primary" />
                      <span className="text-sm font-medium">{designer.downloads}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Downloads</p>
                  </div>
                </div>

                {/* Specialties */}
                <div className="flex flex-wrap gap-1 justify-center">
                  {designer.specialties.slice(0, 2).map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                  {designer.specialties.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{designer.specialties.length - 2}
                    </Badge>
                  )}
                </div>

                {/* Recent Work Preview */}
                <div className="flex justify-center space-x-1">
                  {designer.recent_work.map((work, index) => (
                    <img
                      key={index}
                      src={work}
                      alt={`Recent work ${index + 1}`}
                      className="w-8 h-8 rounded object-cover"
                    />
                  ))}
                </div>

                {/* Social Links */}
                <div className="flex justify-center space-x-2">
                  <Button size="icon" variant="ghost" className="h-6 w-6 hover:text-primary">
                    <Instagram className="w-3 h-3" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6 hover:text-primary">
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6 hover:text-primary">
                    <ExternalLink className="w-3 h-3" />
                  </Button>
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
          ))}
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
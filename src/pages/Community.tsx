import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  TrendingUp,
  Users,
  PlusCircle,
  Search,
  Filter,
  Award,
  Eye,
} from "lucide-react";

const Community = () => {
  const [activeTab, setActiveTab] = useState("feed");

  const allPosts = [
    {
      id: 1,
      author: "Sarah Chen",
      authorAvatar: "/api/placeholder/40/40",
      title: "My latest logo design process - from sketch to final",
      content: "Just finished this exciting project for a tech startup. Here's my complete design process from initial sketches to the final logo. Would love to hear your thoughts and feedback!",
      image: "/api/placeholder/600/400",
      timestamp: "2 hours ago",
      likes: 124,
      comments: 18,
      shares: 7,
      tags: ["logo", "branding", "process"],
      verified: true,
      category: "feed",
      isFollowing: true,
      popularity: 124,
    },
    {
      id: 2,
      author: "Marcus Johnson",
      authorAvatar: "/api/placeholder/40/40",
      title: "New UI kit available - Mobile banking app",
      content: "Excited to share my latest UI kit for mobile banking applications. Clean, modern, and user-friendly interface components ready for your next fintech project.",
      image: "/api/placeholder/600/400",
      timestamp: "4 hours ago",
      likes: 89,
      comments: 12,
      shares: 15,
      tags: ["ui-kit", "mobile", "fintech"],
      verified: true,
      category: "feed",
      isFollowing: false,
      popularity: 89,
    },
    {
      id: 3,
      author: "Emma Thompson",
      authorAvatar: "/api/placeholder/40/40",
      title: "Character illustration collection",
      content: "Working on a series of character illustrations for a children's book. Each character has their own personality and story. Can't wait to share the complete collection!",
      image: "/api/placeholder/600/400",
      timestamp: "6 hours ago",
      likes: 156,
      comments: 24,
      shares: 9,
      tags: ["illustration", "characters", "children"],
      verified: false,
      category: "feed",
      isFollowing: true,
      popularity: 156,
    },
    {
      id: 4,
      author: "Alex Rodriguez",
      authorAvatar: "/api/placeholder/40/40",
      title: "Motion graphics showreel 2024",
      content: "My motion graphics work from this year. From brand animations to explainer videos, here's what I've been working on.",
      image: "/api/placeholder/600/400",
      timestamp: "1 hour ago",
      likes: 203,
      comments: 31,
      shares: 18,
      tags: ["motion", "animation", "showreel"],
      verified: true,
      category: "latest",
      isFollowing: true,
      popularity: 203,
    },
    {
      id: 5,
      author: "Lisa Park",
      authorAvatar: "/api/placeholder/40/40",
      title: "Brand identity for sustainable fashion",
      content: "Complete brand identity design for an eco-friendly fashion startup. From logo to packaging design.",
      image: "/api/placeholder/600/400",
      timestamp: "3 hours ago",
      likes: 178,
      comments: 22,
      shares: 12,
      tags: ["branding", "sustainability", "fashion"],
      verified: true,
      category: "popular",
      isFollowing: false,
      popularity: 178,
    },
    {
      id: 6,
      author: "David Kim",
      authorAvatar: "/api/placeholder/40/40",
      title: "UX case study - Healthcare app redesign",
      content: "Deep dive into redesigning a healthcare application. Research, user testing, and final design decisions.",
      image: "/api/placeholder/600/400",
      timestamp: "5 hours ago",
      likes: 245,
      comments: 38,
      shares: 25,
      tags: ["ux", "healthcare", "case-study"],
      verified: true,
      category: "popular",
      isFollowing: true,
      popularity: 245,
    },
  ];

  const getFilteredPosts = () => {
    switch (activeTab) {
      case "following":
        return allPosts.filter(post => post.isFollowing);
      case "popular":
        return allPosts.filter(post => post.popularity > 150).sort((a, b) => b.popularity - a.popularity);
      case "latest":
        return allPosts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      default:
        return allPosts;
    }
  };

  const posts = getFilteredPosts();

  const trendingTopics = [
    { name: "Logo Design", posts: "2.4k" },
    { name: "UI/UX", posts: "1.8k" },
    { name: "Illustrations", posts: "1.2k" },
    { name: "Branding", posts: "980" },
    { name: "Typography", posts: "756" },
  ];

  const featuredDesigners = [
    {
      name: "Alex Rodriguez",
      avatar: "/api/placeholder/40/40",
      followers: "12.4k",
      specialty: "Motion Graphics",
    },
    {
      name: "Lisa Park",
      avatar: "/api/placeholder/40/40",
      followers: "8.9k",
      specialty: "Brand Identity",
    },
    {
      name: "David Kim",
      avatar: "/api/placeholder/40/40",
      followers: "15.7k",
      specialty: "UI/UX Design",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-8">
        {/* Community Header */}
        <div className="bg-muted/30 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h1 className="text-3xl md:text-4xl font-bold">
                Creative <span className="bg-gradient-primary bg-clip-text text-transparent">Community</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Connect with fellow designers, share your work, and get inspired by the community
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-gradient-primary">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Share Your Work
                </Button>
                <Button variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Find Designers
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:w-80 space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search community..."
                  className="pl-10 bg-background border-border"
                />
              </div>

              {/* Trending Topics */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-primary" />
                    Trending Topics
                  </h3>
                  <div className="space-y-3">
                    {trendingTopics.map((topic, index) => (
                      <div key={index} className="flex items-center justify-between cursor-pointer hover:text-primary transition-colors">
                        <span className="text-sm">#{topic.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {topic.posts}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Featured Designers */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <Award className="w-4 h-4 mr-2 text-primary" />
                    Featured Designers
                  </h3>
                  <div className="space-y-4">
                    {featuredDesigners.map((designer, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={designer.avatar} />
                          <AvatarFallback>{designer.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{designer.name}</p>
                          <p className="text-xs text-muted-foreground">{designer.specialty}</p>
                          <p className="text-xs text-muted-foreground">{designer.followers} followers</p>
                        </div>
                        <Button size="sm" variant="outline" className="text-xs">
                          Follow
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="feed">Feed</TabsTrigger>
                  <TabsTrigger value="following">Following</TabsTrigger>
                  <TabsTrigger value="popular">Popular</TabsTrigger>
                  <TabsTrigger value="latest">Latest</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="space-y-6">
                  {/* Create Post */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="/api/placeholder/40/40" />
                          <AvatarFallback>You</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <Input
                            placeholder="Share your latest design or ask a question..."
                            className="mb-4 bg-background border-border"
                          />
                          <div className="flex justify-between items-center">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <PlusCircle className="w-3 h-3 mr-1" />
                                Image
                              </Button>
                              <Button size="sm" variant="outline">
                                <Filter className="w-3 h-3 mr-1" />
                                Poll
                              </Button>
                            </div>
                            <Button size="sm" className="bg-gradient-primary">
                              Post
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Posts Feed */}
                  {posts.map((post) => (
                    <Card key={post.id} className="group">
                      <CardContent className="p-6 space-y-4">
                        {/* Post Header */}
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={post.authorAvatar} />
                            <AvatarFallback>{post.author[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold">{post.author}</h3>
                              {post.verified && (
                                <Award className="w-4 h-4 text-accent" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{post.timestamp}</p>
                          </div>
                          <Button size="icon" variant="ghost">
                            <Bookmark className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Post Content */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-lg">{post.title}</h4>
                          <p className="text-muted-foreground">{post.content}</p>
                          
                          {/* Tags */}
                          <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Post Image */}
                        {post.image && (
                          <div className="relative overflow-hidden rounded-lg">
                            <img
                              src={post.image}
                              alt={post.title}
                              className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}

                        <Separator />

                        {/* Post Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-6">
                            <Button variant="ghost" size="sm" className="space-x-2">
                              <Heart className="w-4 h-4" />
                              <span>{post.likes}</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="space-x-2">
                              <MessageCircle className="w-4 h-4" />
                              <span>{post.comments}</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="space-x-2">
                              <Share2 className="w-4 h-4" />
                              <span>{post.shares}</span>
                            </Button>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View Project
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>

              {/* Load More */}
              <div className="text-center mt-8">
                <Button variant="outline" size="lg">
                  Load More Posts
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Community;
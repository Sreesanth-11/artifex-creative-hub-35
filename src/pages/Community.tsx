import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ProfileHoverCard } from "@/components/ui/profile-hover-card";
import { ShareWorkDialog } from "@/components/ui/share-work-dialog";
import { communityAPI, userAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
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
  Loader2,
} from "lucide-react";

const Community = () => {
  const [activeTab, setActiveTab] = useState("feed");
  const [searchQuery, setSearchQuery] = useState("");
  const [shareWorkDialogOpen, setShareWorkDialogOpen] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState("");
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [userFollowing, setUserFollowing] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const response = await communityAPI.getPosts({
          page: 1,
          limit: 20,
          category: activeTab === "feed" ? undefined : activeTab,
          search: searchQuery || undefined,
          sort: "newest",
        });
        setPosts(response.data.posts);
      } catch (error) {
        console.error("Error fetching posts:", error);
        toast({
          title: "Error",
          description: "Failed to load community posts",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [activeTab, searchQuery, toast]);

  // Fetch user's following list for filtering
  useEffect(() => {
    const fetchUserFollowing = async () => {
      if (!user?._id) return;

      try {
        const response = await userAPI.getUserFollowing(user._id, { limit: 100 });
        if (response.success) {
          setUserFollowing(response.data.following);
        }
      } catch (error) {
        console.error("Error fetching following list:", error);
      }
    };

    fetchUserFollowing();
  }, [user?._id]);

  const handleLikePost = async (postId: string) => {
    try {
      await communityAPI.togglePostLike(postId);
      // Update the specific post in the state instead of refetching all posts
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post._id === postId) {
            const isLiked = post.likes?.includes(post.currentUserLiked);
            return {
              ...post,
              likes: isLiked
                ? post.likes.filter((id) => id !== post.currentUserLiked)
                : [...(post.likes || []), post.currentUserLiked],
              likeCount: isLiked
                ? (post.likeCount || 0) - 1
                : (post.likeCount || 0) + 1,
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error("Error liking post:", error);
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive",
      });
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter some content for your post",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreatingPost(true);
      const response = await communityAPI.createPost({
        title: "New Post", // You might want to add a title input
        content: newPostContent,
        category: "general",
        tags: [],
      });

      if (response.success) {
        // Add the new post to the beginning of the posts list
        setPosts((prevPosts) => [response.data.post, ...prevPosts]);
        setNewPostContent("");

        toast({
          title: "Success",
          description: "Your post has been created successfully",
        });
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleFollowUser = async (userId: string, userName: string) => {
    try {
      const response = await userAPI.toggleFollow(userId);

      if (response.success) {
        // Update the featured designers list
        setFeaturedDesigners((prevDesigners) =>
          prevDesigners.map((designer) =>
            designer._id === userId
              ? { ...designer, isFollowing: response.data.isFollowing }
              : designer
          )
        );

        // Update posts to reflect follow status
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.author?._id === userId
              ? {
                  ...post,
                  author: {
                    ...post.author,
                    isFollowing: response.data.isFollowing,
                  },
                }
              : post
          )
        );

        toast({
          title: response.data.isFollowing ? "Following" : "Unfollowed",
          description: response.data.isFollowing
            ? `You are now following ${userName}`
            : `You unfollowed ${userName}`,
        });
      }
    } catch (error) {
      console.error("Error following user:", error);
      toast({
        title: "Error",
        description: "Failed to follow user",
        variant: "destructive",
      });
    }
  };

  // Use real posts from API instead of dummy data

  const getFilteredPosts = () => {
    let filteredPosts = posts; // Use real posts from API

    // Filter by search query
    if (searchQuery.trim()) {
      filteredPosts = filteredPosts.filter(
        (post) =>
          post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.author?.name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          post.tags?.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Filter by tab
    switch (activeTab) {
      case "following":
        // Filter posts to only show posts from users the current user follows
        const followingIds = userFollowing.map(user => user.id);
        return filteredPosts.filter((post) =>
          post.author?._id && followingIds.includes(post.author._id)
        );
      case "popular":
        return filteredPosts
          .filter((post) => (post.likes?.length || 0) > 5)
          .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
      case "latest":
        return filteredPosts.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      default:
        return filteredPosts;
    }
  };

  const filteredAndSortedPosts = getFilteredPosts();

  const [trendingTopics, setTrendingTopics] = useState<any[]>([]);
  const [featuredDesigners, setFeaturedDesigners] = useState<any[]>([]);

  // Fetch trending topics and featured users
  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        // Fetch trending topics
        const topicsResponse = await communityAPI.getTrendingTopics(5);
        if (topicsResponse.success) {
          setTrendingTopics(topicsResponse.data.topics);
        }

        // Fetch featured users
        const usersResponse = await communityAPI.getFeaturedUsers(5);
        if (usersResponse.success) {
          setFeaturedDesigners(usersResponse.data.users);
        }
      } catch (error) {
        console.error("Error fetching sidebar data:", error);
      }
    };

    fetchSidebarData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-8">
        {/* Community Header */}
        <div className="bg-muted/30 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h1 className="text-3xl md:text-4xl font-bold">
                Creative{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Community
                </span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Connect with fellow designers, share your work, and get inspired
                by the community
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  className="bg-gradient-primary"
                  onClick={() => setShareWorkDialogOpen(true)}
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Share Your Work
                </Button>
                <Button variant="outline" onClick={() => navigate("/browse")}>
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                    {trendingTopics.length > 0 ? (
                      trendingTopics.map((topic, index) => (
                        <div
                          key={topic.name}
                          className="flex items-center justify-between cursor-pointer hover:text-primary transition-colors"
                          onClick={() => setSearchQuery(topic.name)}
                        >
                          <span className="text-sm">#{topic.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {topic.posts}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        <p className="text-sm">No trending topics yet</p>
                      </div>
                    )}
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
                    {featuredDesigners.length > 0 ? (
                      featuredDesigners.map((designer) => (
                        <div
                          key={designer._id}
                          className="flex items-center space-x-3"
                        >
                          <Avatar
                            className="h-10 w-10 cursor-pointer"
                            onClick={() => navigate(`/profile/${designer._id}`)}
                          >
                            <AvatarImage src={designer.avatar} />
                            <AvatarFallback>
                              {designer.name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p
                              className="font-medium text-sm truncate cursor-pointer hover:text-primary"
                              onClick={() =>
                                navigate(`/profile/${designer._id}`)
                              }
                            >
                              {designer.name}
                              {designer.isVerified && (
                                <Award className="w-3 h-3 inline ml-1 text-accent" />
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {designer.bio || "Creative professional"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {designer.followerCount} followers •{" "}
                              {designer.postCount} posts
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant={designer.isFollowing ? "default" : "outline"}
                            className="text-xs"
                            onClick={() => handleFollowUser(designer._id, designer.name)}
                          >
                            {designer.isFollowing ? "Following" : "Follow"}
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        <p className="text-sm">No featured designers yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-6"
              >
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
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleCreatePost();
                              }
                            }}
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
                            <Button
                              size="sm"
                              className="bg-gradient-primary"
                              onClick={handleCreatePost}
                              disabled={isCreatingPost || !newPostContent.trim()}
                            >
                              {isCreatingPost ? (
                                <>
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  Posting...
                                </>
                              ) : (
                                "Post"
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Posts Feed */}
                  {filteredAndSortedPosts.map((post) => (
                    <Card key={post._id} className="group">
                      <CardContent className="p-6 space-y-4">
                        {/* Post Header */}
                        <div className="flex items-start space-x-3">
                          <Avatar
                            className="h-12 w-12 cursor-pointer"
                            onClick={() =>
                              navigate(
                                `/profile/${
                                  post.author?._id || post.author?.id
                                }`
                              )
                            }
                          >
                            <AvatarImage src={post.author?.avatar} />
                            <AvatarFallback>
                              {post.author?.name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <HoverCard>
                                <HoverCardTrigger asChild>
                                  <h3
                                    className="font-semibold cursor-pointer hover:text-primary transition-colors"
                                    onClick={() =>
                                      navigate(
                                        `/profile/${
                                          post.author?._id || post.author?.id
                                        }`
                                      )
                                    }
                                  >
                                    {post.author?.name}
                                  </h3>
                                </HoverCardTrigger>
                                <HoverCardContent
                                  className="w-auto p-0"
                                  side="bottom"
                                  align="start"
                                >
                                  <ProfileHoverCard
                                    name={post.author?.name || "Unknown"}
                                    avatar={post.author?.avatar}
                                    bio={
                                      post.author?.bio ||
                                      "Creative designer passionate about beautiful interfaces and user experiences."
                                    }
                                    followers={
                                      post.author?.followerCount || "0"
                                    }
                                    likes={post.likes?.length || "0"}
                                    downloads="0"
                                    verified={post.author?.verified || false}
                                    isFollowing={post.author?.isFollowing || false}
                                    onFollow={() =>
                                      handleFollowUser(
                                        post.author?._id,
                                        post.author?.name
                                      )
                                    }
                                    onMessage={() =>
                                      navigate(`/chat/${post.author?._id}`)
                                    }
                                  />
                                </HoverCardContent>
                              </HoverCard>
                              {post.author?.verified && (
                                <Award className="w-4 h-4 text-accent" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant={
                                post.author?.isFollowing ? "default" : "outline"
                              }
                              onClick={() =>
                                handleFollowUser(
                                  post.author?._id,
                                  post.author?.name
                                )
                              }
                            >
                              {post.author?.isFollowing ? "Following" : "Follow"}
                            </Button>
                            <Button size="icon" variant="ghost">
                              <Bookmark className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Post Content */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-lg">
                            {post.title}
                          </h4>
                          <p className="text-muted-foreground">
                            {post.content}
                          </p>

                          {/* Tags */}
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {post.tags.map((tag, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Post Images */}
                        {post.images && post.images.length > 0 && (
                          <div className="relative overflow-hidden rounded-lg">
                            <img
                              src={post.images[0]}
                              alt={post.title}
                              className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {post.images.length > 1 && (
                              <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                                +{post.images.length - 1} more
                              </div>
                            )}
                          </div>
                        )}

                        <Separator />

                        {/* Post Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-6">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="space-x-2"
                              onClick={() => handleLikePost(post._id)}
                            >
                              <Heart
                                className={`w-4 h-4 ${
                                  post.likes?.includes(post.currentUserLiked)
                                    ? "fill-red-500 text-red-500"
                                    : ""
                                }`}
                              />
                              <span>
                                {post.likeCount || post.likes?.length || 0}
                              </span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="space-x-2"
                              onClick={() =>
                                navigate(`/chat/${post.author?._id}`)
                              }
                            >
                              <MessageCircle className="w-4 h-4" />
                              <span>
                                {post.commentCount ||
                                  post.comments?.length ||
                                  0}
                              </span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="space-x-2"
                            >
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

      <ShareWorkDialog
        open={shareWorkDialogOpen}
        onOpenChange={setShareWorkDialogOpen}
      />
    </div>
  );
};

export default Community;

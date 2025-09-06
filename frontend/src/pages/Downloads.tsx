import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Download,
  Eye,
  Star,
  Filter,
  Search,
  ArrowUpDown,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { downloadsAPI, orderAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Downloads = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [filterCategory, setFilterCategory] = useState("all");
  const [downloads, setDownloads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDownloads = async () => {
      try {
        setIsLoading(true);
        const ordersResponse = await orderAPI.getUserOrders({ page: 1, limit: 50 });

        // Transform orders data to match the expected format
        const transformedDownloads = ordersResponse.data.orders.map((order: any) => ({
          id: order._id,
          title: order.product?.title || "Unknown Product",
          image: order.product?.images?.[0] || "/api/placeholder/300/200",
          category: order.product?.category || "General",
          designer: order.product?.seller?.name || "Unknown Seller",
          rating: order.product?.rating || 4.5,
          price: order.amount || 0,
          downloadDate: new Date(order.createdAt).toISOString(),
          orderId: order._id,
          product: order.product,
          purchaseDate: new Date(order.createdAt).toLocaleDateString(),
          downloadCount: order.downloadCount || 0,
          maxDownloads: order.maxDownloads || 5,
          canDownload: order.status === "completed" && (order.downloadCount || 0) < (order.maxDownloads || 5),
        }));

        setDownloads(transformedDownloads);

        // Set basic stats
        setStats({
          totalDownloads: ordersResponse.data.orders.length,
          downloadsThisMonth: ordersResponse.data.orders.filter((order: any) =>
            new Date(order.createdAt).getMonth() === new Date().getMonth()
          ).length,
        });
      } catch (error) {
        console.error("Error fetching downloads:", error);
        toast({
          title: "Error",
          description: "Failed to load downloads",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDownloads();
  }, [toast]);

  const handleViewProduct = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  const handleDownloadItem = async (itemId: number) => {
    try {
      // Find the item to download
      const item = downloads.find(download => download.id === itemId);
      
      if (!item) {
        toast({
          title: "Error",
          description: "Download item not found",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Download Starting",
        description: `Preparing ${item.title} for download...`,
      });

      // Download file using order ID
      const response = await downloadsAPI.downloadFile(item._id);

      // Create blob and download
      const blob = new Blob([response.data], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${item.title.replace(/[^a-zA-Z0-9]/g, "_")}_download.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Complete",
        description: `${item.title} has been downloaded successfully`,
      });

      // Refresh downloads to update download count
      const fetchDownloads = async () => {
        try {
          const ordersResponse = await orderAPI.getUserOrders({ page: 1, limit: 50 });

          // Transform orders data to match the expected format
          const transformedDownloads = ordersResponse.data.orders.map((order: any) => ({
            id: order._id,
            title: order.product?.title || "Unknown Product",
            image: order.product?.images?.[0] || "/api/placeholder/300/200",
            category: order.product?.category || "General",
            designer: order.product?.seller?.name || "Unknown Seller",
            rating: order.product?.rating || 4.5,
            price: order.amount || 0,
            downloadDate: new Date(order.createdAt).toISOString(),
            orderId: order._id,
            product: order.product,
            purchaseDate: new Date(order.createdAt).toLocaleDateString(),
            downloadCount: order.downloadCount || 0,
            maxDownloads: order.maxDownloads || 5,
            canDownload: order.status === "completed" && (order.downloadCount || 0) < (order.maxDownloads || 5),
          }));

          setDownloads(transformedDownloads);

          // Set basic stats
          setStats({
            totalDownloads: ordersResponse.data.orders.length,
            downloadsThisMonth: ordersResponse.data.orders.filter((order: any) =>
              new Date(order.createdAt).getMonth() === new Date().getMonth()
            ).length,
          });
        } catch (error) {
          console.error("Error fetching downloads:", error);
        }
      };
      fetchDownloads();
    } catch (error: any) {
      console.error("Download error:", error);
      toast({
        title: "Download Failed",
        description: error.response?.data?.message || "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const filteredItems = downloads.filter((item) => {
    const matchesSearch =
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.designer?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === "all" ||
      item.category?.toLowerCase() === filterCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-8">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              My Downloads
            </h1>
            <p className="text-xl text-muted-foreground">
              Access all your purchased and downloaded design assets
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search your downloads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full md:w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="logos">Logos</SelectItem>
                  <SelectItem value="templates">Templates</SelectItem>
                  <SelectItem value="icons">Icons</SelectItem>
                  <SelectItem value="ui kits">UI Kits</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-40">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recent</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className="group cursor-pointer overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-0">
                  <div className="relative overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <Badge className="absolute top-4 left-4 bg-background text-foreground">
                      {item.category}
                    </Badge>
                    <div className="absolute top-4 right-4 bg-background/80 rounded-full p-2">
                      <Download className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <h3 className="font-bold text-xl group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-medium">
                        {item.designer}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-secondary fill-secondary" />
                        <span className="font-semibold">{item.rating}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Downloaded on{" "}
                        {new Date(item.downloadDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-2xl font-bold text-primary">
                        {item.price}
                      </span>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                          onClick={() => handleViewProduct(item.id)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90 rounded-full"
                          onClick={() => handleDownloadItem(item.id)}
                        >
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

          {filteredItems.length === 0 && downloads.length > 0 && (
            <div className="text-center py-20">
              <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">No results found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filters
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setFilterCategory("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}

          {downloads.length === 0 && (
            <div className="text-center py-20">
              <Download className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">No downloads yet</h3>
              <p className="text-muted-foreground mb-6">
                Start browsing and purchasing designs to build your collection
              </p>
              <Link to="/shop">
                <Button size="lg" className="rounded-full">
                  Browse Designs
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Downloads;

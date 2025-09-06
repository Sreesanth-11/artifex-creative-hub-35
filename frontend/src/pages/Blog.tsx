import { useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const Blog = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8">
          Design <span className="bg-gradient-primary bg-clip-text text-transparent">Blog</span>
        </h1>
        <p className="text-center text-muted-foreground mb-12">Stay updated with the latest design trends and tips</p>
        
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold mb-4">Coming Soon</h2>
          <p className="text-muted-foreground">Our blog with design insights and tutorials is coming soon!</p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Blog;
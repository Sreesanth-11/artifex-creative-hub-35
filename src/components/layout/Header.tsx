import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Menu, X, Upload } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/fd5a8945-3ba2-469e-89fa-7b56789beee1.png" 
              alt="Artifex Logo" 
              className="h-9 w-auto"
            />
            <span className="text-2xl font-bold text-foreground">
              Artifex
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-md mx-12">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search designs..."
                className="pl-12 h-12 bg-muted border-0 focus:ring-2 focus:ring-primary/20 text-foreground rounded-full"
              />
            </div>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-10">
            <Link to="/shop" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Shop
            </Link>
            <Link to="/community" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Community
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Mock logged in state - replace with real auth */}
            <Link to="/profile">
              <Avatar className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-primary/20">
                <AvatarImage src="/api/placeholder/40/40" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </Link>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 h-12 rounded-full">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-6 border-t border-border">
            <div className="space-y-6">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search designs..."
                  className="pl-12 h-12 bg-muted border-0 rounded-full"
                />
              </div>

              {/* Mobile Navigation */}
              <nav className="space-y-4">
                <Link
                  to="/browse"
                  className="block py-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                  Browse
                </Link>
                <Link
                  to="/community"
                  className="block py-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                  Community
                </Link>
              </nav>

              {/* Mobile Auth */}
              <div className="space-y-3 pt-4 border-t border-border">
                <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                  Sign In
                </Button>
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
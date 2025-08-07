import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/fd5a8945-3ba2-469e-89fa-7b56789beee1.png" 
                alt="Artifex Logo" 
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Artifex
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              The premier marketplace for graphic designers to showcase, sell, and connect with buyers worldwide. Join our creative community today.
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="icon" className="hover:text-primary">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-primary">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-primary">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-primary">
                <Youtube className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Marketplace */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Marketplace</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/browse/logos" className="text-muted-foreground hover:text-primary transition-colors">
                  Logos
                </Link>
              </li>
              <li>
                <Link to="/browse/icons" className="text-muted-foreground hover:text-primary transition-colors">
                  Icons
                </Link>
              </li>
              <li>
                <Link to="/browse/templates" className="text-muted-foreground hover:text-primary transition-colors">
                  Templates
                </Link>
              </li>
              <li>
                <Link to="/browse/fonts" className="text-muted-foreground hover:text-primary transition-colors">
                  Fonts
                </Link>
              </li>
              <li>
                <Link to="/browse/illustrations" className="text-muted-foreground hover:text-primary transition-colors">
                  Illustrations
                </Link>
              </li>
              <li>
                <Link to="/browse/ui-kits" className="text-muted-foreground hover:text-primary transition-colors">
                  UI Kits
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/help" className="text-muted-foreground hover:text-primary transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/seller-guide" className="text-muted-foreground hover:text-primary transition-colors">
                  Seller Guide
                </Link>
              </li>
              <li>
                <Link to="/buyer-guide" className="text-muted-foreground hover:text-primary transition-colors">
                  Buyer Guide
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-muted-foreground hover:text-primary transition-colors">
                  Community
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-muted-foreground hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/api-docs" className="text-muted-foreground hover:text-primary transition-colors">
                  API Docs
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Stay Updated</h4>
            <p className="text-sm text-muted-foreground">
              Get the latest design trends and marketplace updates.
            </p>
            <div className="space-y-2">
              <Input 
                placeholder="Enter your email" 
                className="bg-muted/50 border-border"
              />
              <Button className="w-full bg-gradient-primary">
                Subscribe
              </Button>
            </div>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Mail className="h-3 w-3" />
                <span>hello@artifex.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-3 w-3" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-3 w-3" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            © 2024 Artifex. All rights reserved.
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link to="/cookies" className="text-muted-foreground hover:text-primary transition-colors">
              Cookie Policy
            </Link>
            <Link to="/dmca" className="text-muted-foreground hover:text-primary transition-colors">
              DMCA
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
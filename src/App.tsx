import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import Community from "./pages/Community";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Chat from "./pages/Chat";
import AddProduct from "./pages/AddProduct";
import ProductDetail from "./pages/ProductDetail";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";
import Downloads from "./pages/Downloads";
import PublicProfile from "./pages/PublicProfile";
import Logos from "./pages/Logos";
import Icons from "./pages/Icons";
import Templates from "./pages/Templates";
import Fonts from "./pages/Fonts";
import Illustrations from "./pages/Illustrations";
import UIKits from "./pages/UIKits";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import DMCA from "./pages/DMCA";
import HelpCenter from "./pages/HelpCenter";
import SellerGuide from "./pages/SellerGuide";
import BuyerGuide from "./pages/BuyerGuide";
import Blog from "./pages/Blog";
import APIDocs from "./pages/APIDocs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:category" element={<Shop />} />
          <Route path="/product/:productId" element={<ProductDetail />} />
          <Route path="/community" element={<Community />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/chat/:userId?" element={<Chat />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/downloads" element={<Downloads />} />
          <Route path="/profile/:userId" element={<PublicProfile />} />
          <Route path="/browse/logos" element={<Logos />} />
          <Route path="/browse/icons" element={<Icons />} />
          <Route path="/browse/templates" element={<Templates />} />
          <Route path="/browse/fonts" element={<Fonts />} />
          <Route path="/browse/illustrations" element={<Illustrations />} />
          <Route path="/browse/ui-kits" element={<UIKits />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/cookies" element={<CookiePolicy />} />
          <Route path="/dmca" element={<DMCA />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/seller-guide" element={<SellerGuide />} />
          <Route path="/buyer-guide" element={<BuyerGuide />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/api-docs" element={<APIDocs />} />
          <Route path="/sell" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle,
  Download,
  Mail,
  ArrowRight,
} from "lucide-react";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-8 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center space-y-8">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>

            {/* Success Message */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">Payment Successful!</h1>
              <p className="text-lg text-muted-foreground">
                Thank you for your purchase. Your order has been confirmed.
              </p>
            </div>

            {/* Order Details */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-semibold">Order Details</h2>
                <div className="space-y-2 text-left">
                  <div className="flex justify-between">
                    <span>Order Number:</span>
                    <span className="font-mono">#DM-2024-001</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Product:</span>
                    <span>Modern Logo Design Kit</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount Paid:</span>
                    <span className="font-semibold">$52.98</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span>Credit Card ending in 3456</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-semibold">What's Next?</h2>
                <div className="space-y-3 text-left">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <span>You'll receive a confirmation email shortly</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Download className="w-5 h-5 text-primary" />
                    <span>Download links will be available in your profile</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate("/profile")}
                className="bg-gradient-primary"
              >
                <Download className="w-4 h-4 mr-2" />
                Go to Downloads
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/shop")}
              >
                Continue Shopping
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;
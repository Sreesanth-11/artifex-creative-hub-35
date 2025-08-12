import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ArrowLeft,
  CreditCard,
  Wallet,
  Shield,
  Lock,
  CheckCircle,
} from "lucide-react";

const Payment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("product");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock product data
  const product = {
    id: productId,
    title: "Modern Logo Design Kit",
    price: 49.99,
    author: "Sarah Chen",
    image: "/api/placeholder/200/200",
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    navigate("/payment-success");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-8 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold">Checkout</h1>
            <Badge variant="secondary" className="ml-auto">
              <Shield className="w-3 h-3 mr-1" />
              Secure Payment
            </Badge>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Payment Form */}
            <div className="space-y-6">
              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center cursor-pointer">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Credit/Debit Card
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="paypal" id="paypal" />
                      <Label htmlFor="paypal" className="flex items-center cursor-pointer">
                        <Wallet className="w-4 h-4 mr-2" />
                        PayPal
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Card Details */}
              {paymentMethod === "card" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Card Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="cardName">Cardholder Name</Label>
                      <Input
                        id="cardName"
                        placeholder="John Doe"
                        className="mt-1"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Billing Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Billing Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="123 Main Street"
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="New York"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input
                        id="zip"
                        placeholder="10001"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-4">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{product.title}</h3>
                      <p className="text-sm text-muted-foreground">by {product.author}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${product.price}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${product.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Processing Fee</span>
                      <span>$2.99</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>${(product.price + 2.99).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Info */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Lock className="w-4 h-4" />
                    <span>Your payment information is encrypted and secure</span>
                  </div>
                </CardContent>
              </Card>

              {/* Complete Payment Button */}
              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-gradient-primary"
                size="lg"
              >
                {isProcessing ? (
                  "Processing Payment..."
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Complete Payment ${(product.price + 2.99).toFixed(2)}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Payment;
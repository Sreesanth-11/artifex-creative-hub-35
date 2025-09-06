import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { cartAPI, orderAPI } from "@/lib/api";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  ArrowLeft,
  Package,
  Star,
  Download,
} from "lucide-react";

interface CartItem {
  _id: string;
  product: {
    _id: string;
    title: string;
    price: number;
    originalPrice?: number;
    images: string[];
    category: string;
    seller: {
      _id: string;
      name: string;
      avatar: string;
    };
  };
  quantity: number;
  addedAt: string;
}

const Cart = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view your cart",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
  }, [user, navigate, toast]);

  // Load cart items from API
  useEffect(() => {
    const fetchCart = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const response = await cartAPI.getCart();
        setCartItems(response.data.cart);
      } catch (error) {
        console.error("Error loading cart:", error);
        toast({
          title: "Error",
          description: "Failed to load cart items",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, [user, toast]);

  const updateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(id);
      return;
    }

    try {
      await cartAPI.updateCartItem(id, newQuantity);
      setCartItems((prev) =>
        prev.map((item) =>
          item.product._id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast({
        title: "Error",
        description: "Failed to update item quantity",
        variant: "destructive",
      });
    }
  };

  const removeItem = async (id: string) => {
    try {
      await cartAPI.removeFromCart(id);
      setCartItems((prev) => prev.filter((item) => item.product._id !== id));
      toast({
        title: "Item Removed",
        description: "Item has been removed from your cart",
      });
    } catch (error) {
      console.error("Error removing item:", error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clearCart();
      setCartItems([]);
      toast({
        title: "Cart Cleared",
        description: "All items have been removed from your cart",
      });
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive",
      });
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.18; // 18% GST
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before checkout",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // For now, we'll process each item as a separate order
      // In a real app, you might want to create a bulk order endpoint
      const orderPromises = cartItems.map((item) =>
        orderAPI.createOrder({ productId: item.product._id })
      );

      const orderResponses = await Promise.all(orderPromises);

      // Clear cart after successful checkout
      await cartAPI.clearCart();
      setCartItems([]);

      // Check if any orders are in test mode
      const isTestMode = orderResponses.some(
        (response) => response.data.testMode
      );

      toast({
        title: "Checkout Successful!",
        description: isTestMode
          ? "Your orders have been completed successfully (test mode)"
          : "Your orders have been placed successfully",
      });

      navigate("/profile?tab=orders");
    } catch (error: any) {
      console.error("Checkout error:", error);
      const errorMessage =
        error.response?.data?.error ||
        "There was an error processing your order";
      toast({
        title: "Checkout Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-8">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Shopping Cart</h1>
                <p className="text-muted-foreground">
                  {cartItems.length} {cartItems.length === 1 ? "item" : "items"}{" "}
                  in your cart
                </p>
              </div>
            </div>
          </div>

          {cartItems.length === 0 ? (
            /* Empty Cart */
            <Card className="text-center py-12">
              <CardContent>
                <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-semibold mb-2">
                  Your cart is empty
                </h2>
                <p className="text-muted-foreground mb-6">
                  Discover amazing designs and add them to your cart
                </p>
                <Button onClick={() => navigate("/")}>Continue Shopping</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Cart Items</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearCart}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Cart
                  </Button>
                </div>

                {cartItems.map((item) => (
                  <Card key={item._id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.title}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-lg truncate">
                                {item.product.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                by {item.product.seller.name}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(item.product._id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="secondary">
                              {item.product.category}
                            </Badge>
                          </div>

                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  updateQuantity(
                                    item.product._id,
                                    item.quantity - 1
                                  )
                                }
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  updateQuantity(
                                    item.product._id,
                                    item.quantity + 1
                                  )
                                }
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-primary">
                                ₹
                                {(
                                  item.product.price * item.quantity
                                ).toLocaleString()}
                              </p>
                              {item.quantity > 1 && (
                                <p className="text-sm text-muted-foreground">
                                  ₹{item.product.price.toLocaleString()} each
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Order Summary */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{calculateSubtotal().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST (18%)</span>
                      <span>₹{calculateTax().toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">
                        ₹{calculateTotal().toLocaleString()}
                      </span>
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleCheckout}
                      disabled={isLoading}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      {isLoading ? "Processing..." : "Proceed to Checkout"}
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate("/")}
                    >
                      Continue Shopping
                    </Button>
                  </CardContent>
                </Card>

                {/* Features */}
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-primary" />
                        <span>Instant download after purchase</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-primary" />
                        <span>Secure payment processing</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-primary" />
                        <span>Commercial license included</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Cart;

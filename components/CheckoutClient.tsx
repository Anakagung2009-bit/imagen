"use client";


import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getAuth } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CreditCard, 
  QrCode, 
  Building2, 
  CheckCircle2, 
  ShieldCheck,
  Lock
} from "lucide-react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const planDetails = {
    Basic: { name: 'Basic', credits: 1000, priceIDR: 'Rp 50.000', priceUSD: 'USD 5.00' },
    Pro: { name: 'Pro', credits: 5000, priceIDR: 'Rp 100.000', priceUSD: 'USD 10.00' },
    Ultimate: { name: 'Ultimate', credits: 20000, priceIDR: 'Rp 400.000', priceUSD: 'USD 40.00' },
};


export default function CheckoutClient  () {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    const plan = searchParams.get('plan') || 'Basic'; // Mengambil plan dari URL
    const country = searchParams.get('country') || 'ID'; // Get country from URL
    const [loading, setLoading] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [processingStep, setProcessingStep] = useState<string | null>(null);
    const [selectedCountry, setSelectedCountry] = useState(country); // Set selected country from URL
  
    const planInfo = planDetails[plan as keyof typeof planDetails] || planDetails.Basic;
  
    // Define payment methods inside the component
    const paymentMethods = [
        { 
          name: 'QRIS / GoPay', 
          value: 'gopay',
          icon: <QrCode className="h-5 w-5" />,
          description: 'Pay using any QRIS-compatible e-wallet',
        },
        { 
          name: 'BRI Virtual Account', 
          value: 'bri_va',
          icon: <Building2 className="h-5 w-5" />,
          description: 'Pay via BRI internet banking or ATM',
        },
        { 
          name: 'BCA Virtual Account', 
          value: 'bci_va',
          icon: <Building2 className="h-5 w-5" />,
          description: 'Pay via BCA internet banking or ATM',
        },
        { 
          name: 'Mandiri Virtual Account', 
          value: 'mandiri_va',
          icon: <Building2 className="h-5 w-5" />,
          description: 'Pay via Mandiri internet banking or ATM',
        },
        // Add other Midtrans payment methods here...  
      ];
      
      // Filter payment methods based on selected country
      const filteredPaymentMethods = selectedCountry === 'US' ? [
        { 
          name: 'PayPal',
          value: 'paypal',
          icon: <CreditCard className="h-5 w-5" />,
          description: 'Pay using your PayPal account',
        },
        {
            name: 'Credit Card',
            value: 'credit_card',
            icon: <CreditCard className="h-5 w-5" />,
            description: 'Pay using your credit card',
          
        }
      ] : paymentMethods;
      
     
    useEffect(() => {
      const script = document.createElement('script');
      script.src = process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL as string;
      script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY);
      script.async = true;
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    }, []);
  
    const handlePayment = async () => {
        if (!plan || !selectedMethod) return;
        setLoading(true);
        setProcessingStep('initializing');
        setProgress(10);
      
        try {
          const response = await fetch('/api/payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan, method: selectedMethod, country: selectedCountry }),
          });
      
          const data = await response.json();
      
          if (data.token) {
            // Handle Midtrans payment
            (window as any).snap.pay(data.token, {
              onSuccess: async (result) => {
                await confirmPayment(result.order_id);
              },
              onPending: () => {
                toast({
                  title: "Payment Pending",
                  description: "Your payment is currently pending. Please check back later.",
                  variant: "default"
                });
                router.push('/pending');
              },
              onError: () => {
                toast({
                  title: "Payment Failed",
                  description: "There was an error processing your payment.",
                  variant: "destructive"
                });
                router.push('/failed');
              },
              onClose: () => {
                setLoading(false);
                setProgress(0);
                setProcessingStep(null);
              },
            });
          } else {
            // Handle PayPal payment
            if (data.links && Array.isArray(data.links)) {
                const approvalUrl = data.links.find(link => link.rel === 'approval_url');
                if (approvalUrl) {
                    window.location.href = approvalUrl.href; // Redirect to PayPal for approval
              } else {
                throw new Error("Approval URL not found in PayPal response.");
              }
            } else {
              throw new Error("Invalid response structure from PayPal.");
            }
          }
        } catch (err) {
          console.error('Payment error', err);
          toast({
            title: "Connection Error",
            description: "Could not connect to payment gateway. Please try again.",
            variant: "destructive"
          });
        } finally {
          setLoading(false);
        }
      };
  
    const confirmPayment = async (orderId) => {
      const auth = getAuth();
      const user = auth.currentUser ;
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to complete this transaction.",
          variant: "destructive"
        });
        return;
      }
    
      const user_id = user.uid;
      const res = await fetch('/api/payment-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, user_id, order_id: orderId }),
      });
    
      const json = await res.json();
      if (json.message === "Credits updated successfully") {
        router.push('/success');
      } else {
        router.push('/failed');
      }
    };
  
    return (
      <div className="min-h-screen to-muted/20 py-6 sm:py-12">
        <div className="max-w-3xl mx-auto px-3 sm:px-4">
          <Card className="border shadow-lg overflow-hidden">
            <CardHeader className="bg-muted/30 border-b p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-xl sm:text-2xl">Checkout</CardTitle>
                  <CardDescription>Complete your purchase to get credits</CardDescription>
                </div>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 py-1.5 w-fit">
                  {planInfo.name}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 sm:p-6 space-y-6 sm:space-y-8">
              {/* Order Summary */}
              <div className="bg-muted/20 rounded-lg p-3 sm:p-4 border">
                <h3 className="font-medium mb-3">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{planInfo.name}</span>
                    <span className="font-medium">{selectedCountry === 'US' ? planInfo.priceUSD : planInfo.priceIDR}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Credits</span>
                    <span className="font-medium">{planInfo.credits.toLocaleString()}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total</span>
                    <span className="font-bold text-lg">{selectedCountry === 'US' ? planInfo.priceUSD : planInfo.priceIDR}</span>
                  </div>
                </div>
              </div>
              
              {/* Payment Methods */}
              <div>
                <h3 className="font-medium mb-4">Select Payment Method</h3>
                <RadioGroup 
                    value={selectedMethod || ""} 
                    onValueChange={setSelectedMethod}
                    className="space-y-3"
                >
                    <AnimatePresence>
                    {filteredPaymentMethods.map((method) => (
                        <motion.div
                        key={method.value}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="relative"
                        >
                        <div 
                            className={`
                            flex items-start space-x-3 border rounded-lg p-4 transition-all
                            ${selectedMethod === method.value 
                                ? 'border-primary bg-primary/5 ring-1 ring-primary/30' 
                                : 'hover:border-muted-foreground/30 hover:bg-muted/30'
                            }
                            `}
                        >
                            <RadioGroupItem 
                            value={method.value} 
                            id={method.value} 
                            disabled={false} // Ganti dengan kondisi loading jika perlu
                            className="mt-1"
                            />
                            <Label 
                            htmlFor={method.value} 
                            className="flex-1 flex items-start cursor-pointer"
                            >
                            <div className={`
                                p-2 rounded-md mr-3 
                                ${selectedMethod === method.value 
                                ? 'bg-primary/10 text-primary' 
                                : 'bg-muted text-muted-foreground'
                                }
                            `}>
                                {method.icon}
                            </div>
                            <div className="space-y-1">
                                <p className="font-medium">{method.name}</p>
                                <p className="text-sm text-muted-foreground">{method.description}</p>
                            </div>
                            </Label>
                            {selectedMethod === method.value && (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            )}
                        </div>
                        </motion.div>
                    ))}
                    </AnimatePresence>
                </RadioGroup>
                </div>
              
              {/* Security Notice */}
              <Alert variant="default" className="bg-muted/30 border-muted-foreground/20 text-xs sm:text-sm">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                <AlertTitle className="text-xs sm:text-sm font-medium">Secure Payment</AlertTitle>
                <AlertDescription className="text-xs text-muted-foreground">
                  All transactions are secured with SSL encryption. Your payment information is never stored on our servers.
                </AlertDescription>
              </Alert>
            </CardContent>
            
            <CardFooter className="flex flex-col p-4 sm:p-6 pt-0 space-y-4">
              {loading && (
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">{processingStep === 'initializing' 
                      ? 'Initializing payment...' 
                      : processingStep === 'connecting' 
                      ? 'Connecting to payment gateway...' 
                      : 'Ready to proceed'}</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-1.5 sm:h-2" />
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button 
                  variant="outline" 
                  onClick={() => router.back()}
                  disabled={loading}
                  className="sm:w-1/3 text-sm sm:text-base"
                >
                  Back
                </Button>
                <Button
                  onClick={handlePayment}
                  disabled={loading || !selectedMethod}
                  className="sm:w-2/3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-sm sm:text-base"
                >
                  {loading ? (
                    <span className="flex items-center">
                      Processing <motion.span 
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >...</motion.span>
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Pay {selectedCountry === 'US' ? planInfo.priceUSD : planInfo.priceIDR} <Lock className="ml-2 h-4 w-4" />
                    </span>
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    ); 
  }
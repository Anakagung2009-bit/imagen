"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Check, Loader2, CreditCard } from "lucide-react";
import { onAuthStateChanged, getAuth, User } from "firebase/auth";
import app from "@/lib/firebase";
import { motion } from "framer-motion";
import { useCurrentUser } from "@/lib/useCurrentUser";


export default function Plans() {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const router = useRouter();
  const user = useCurrentUser();

  const handleBuyPlan = async (plan: string) => {
    setLoading(true); // Start loading

    try {
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (data.token) {
        // @ts-ignore
        window.snap.pay(data.token, {
          onSuccess: async function (result: any) {
            console.log("Payment success:", result);

            // Kirim ke backend buat update credits
            const paymentConfirmationResponse = await fetch("/api/payment-confirmation", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                order_id: result.order_id,
                plan,
                user_id: user?.uid, // pastikan UID user benar
              }),
            });

            const paymentConfirmationData = await paymentConfirmationResponse.json();
            console.log("Payment Confirmation Response:", paymentConfirmationData);

            if (paymentConfirmationData.message === "Credits updated successfully") {
              router.push("/success");
            } else {
              router.push("/failed");
            }

            setLoading(false);
          },
          onPending: function (result: any) {
            console.log("Payment pending:", result);
            router.push("/pending");
            setLoading(false);
          },
          onError: function (result: any) {
            console.log("Payment failed:", result);
            router.push("/failed");
            setLoading(false);
          },
          onClose: function () {
            console.log("Payment popup closed");
            setLoading(false);
          },
        });
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Payment Error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL as string;
    script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!);
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const plans = [
    {
      name: "Basic",
      description: "Perfect for beginners",
      credits: "2,000 Credits",
      price: "IDR 50,000",
      features: ["HD Downloads"],
      popular: false,
      color: "bg-gradient-to-br from-blue-500/20 to-blue-600/20",
      textColor: "text-blue-600",
      borderColor: "border-blue-200",
    },
    {
      name: "Pro",
      description: "For serious creators",
      credits: "5,000 Credits",
      price: "IDR 100,000",
      features: ["HD downloads"],
      popular: true,
      color: "bg-gradient-to-br from-purple-500/20 to-purple-600/20",
      textColor: "text-purple-600",
      borderColor: "border-purple-200",
    },
    {
      name: "Ultimate",
      description: "For professionals",
      credits: "Unlimited Credits",
      price: "IDR 400,000",
      features: ["Unlimited image generation", "HD Downloads"],
      popular: false,
      color: "bg-gradient-to-br from-amber-500/20 to-amber-600/20",
      textColor: "text-amber-600",
      borderColor: "border-amber-200",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen  p-6">
      <div className="max-w-6xl w-full mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Choose Your Plan</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Unlock your creative potential with our flexible pricing plans. Choose the perfect option for your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`relative h-full overflow-hidden border-2 transition-all duration-300 hover:shadow-lg ${
                  selectedPlan === plan.name ? "ring-2 ring-primary ring-offset-2" : ""
                } ${plan.popular ? "border-primary" : "border-border"}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0">
                    <Badge className="rounded-tl-none rounded-br-none bg-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className={`${plan.color} pb-8`}>
                  <CardTitle className={`text-2xl font-bold ${plan.textColor}`}>{plan.name}</CardTitle>
                  <CardDescription className="text-foreground/70">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-2"></span>
                  </div>
                  <div className="mt-2 font-medium">
                    <Sparkles className="inline-block mr-2 h-4 w-4 text-primary" />
                    {plan.credits}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter className="pt-4">
                  <Button
                    className="w-full"
                    size="lg"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => {
                      setSelectedPlan(plan.name);
                      handleBuyPlan(plan.name);
                    }}
                    disabled={loading && selectedPlan === plan.name}
                  >
                    {loading && selectedPlan === plan.name ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Buy Now
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

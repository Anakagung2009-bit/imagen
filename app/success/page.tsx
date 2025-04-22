"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation"; // Ganti useRouter dengan useSearchParams
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, CreditCard, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import confetti from "canvas-confetti";
import { getAuth } from 'firebase/auth';


export default function SuccessPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const searchParams = useSearchParams();
  const order_id = searchParams.get("order_id");
  const transaction_status = searchParams.get("transaction_status");
  const plan = searchParams.get('plan'); // harus dikirim dari awal saat ke PayPal
  const user = getAuth().currentUser;


  useEffect(() => {
    const confirm = async () => {
      if (!user || !plan) return;

      await fetch('/api/payment-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.uid,
          plan,
          order_id: searchParams.get('paymentId') || 'paypal-' + Date.now(),
        }),
      });
    };

    confirm();
  }, [user, plan]);
  

  useEffect(() => {
    // Trigger confetti effect
    const triggerConfetti = () => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    };

    // Animate progress bar
    const timer = setTimeout(() => {
      setShowConfetti(true);
      triggerConfetti();
    }, 500);

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + 4;
      });
    }, 50);

    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-2 border-green-200 shadow-lg overflow-hidden">
          <CardHeader className="pb-3 pt-6 text-center bg-green-50 dark:bg-green-900/20">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4"
            >
              <CheckCircle className="h-16 w-16 text-green-500" strokeWidth={1.5} />
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text -muted-foreground mt-1">
                {transaction_status === "completed" ? "Your transaction has been processed." : "Your payment is currently pending. Please check back later."}
              </p>
            </motion.div>
          </CardHeader>
  
          <CardContent className="pt-6 pb-4 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Processing payment</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
  
            <div className="bg-muted/40 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="outline" className={`bg-${transaction_status === "completed" ? "green" : "yellow"}-100 text-${transaction_status === "completed" ? "green" : "yellow"}-700`}>
                  {transaction_status === "completed" ? "Completed" : "Pending"}
                </Badge>
              </div>
  
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Order ID</span>
                <span className="font-mono">{order_id}</span>
              </div>
            </div>
  
            {transaction_status === "pending" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center"
              >
                <p className="text-sm text-muted-foreground">
                  Your payment is pending. Credits will be added once the payment is confirmed.
                </p>
              </motion.div>
            )}
          </CardContent>
  
          <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2 pb-6">
            <Button
              variant="outline"
              className="w-full sm:w-1/2"
              onClick={() => router.push("/")}
            >
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
            <Button
              className="w-full sm:w-1/2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              onClick={() => router.push("/dashboard")}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
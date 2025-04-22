"use client"; // Pastikan ini ada di bagian atas file

import { Suspense } from "react"; // Import Suspense
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation"; 
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
  const plan = searchParams.get('plan'); 
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
    const triggerConfetti = () => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    };

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
    <Suspense fallback={<div>Loading...</div>}>
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

            {/* Konten lainnya di sini */}
          </Card>
        </motion.div>
      </div>
    </Suspense>
  );
}

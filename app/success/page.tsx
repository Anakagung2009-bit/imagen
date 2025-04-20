"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, CreditCard, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import confetti from "canvas-confetti";

export default function SuccessPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

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
              <h1 className="text-2xl font-bold text-green-700 dark:text-green-400">Payment Successful!</h1>
              <p className="text-muted-foreground mt-1">Your transaction has been processed</p>
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
                <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800">
                  Completed
                </Badge>
              </div>
        
              
              {/* <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Transaction ID</span>
                <span className="text-xs text-muted-foreground font-mono">TXN-{Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
              </div> */}
            </div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: showConfetti ? 1 : 0 }}
              transition={{ delay: 0.8 }}
              className="text-center"
            >
              <p className="text-sm text-muted-foreground">
                Your account has been credited and you can now generate more amazing AI images!
              </p>
            </motion.div>
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
  
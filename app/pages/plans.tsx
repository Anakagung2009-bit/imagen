// pages/plans.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Plans() {
  const handleBuyPlan = (plan: string) => {
    // Implement Midtrans payment integration here
    console.log(`Buying plan: ${plan}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <h1 className="text-2xl font-bold">Choose Your Plan</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Basic</CardTitle>
            <CardDescription>2,000 Credits</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Price: IDR 50,000</p>
            <Button onClick={() => handleBuyPlan("Basic")}>Buy</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pro</CardTitle>
            <CardDescription>5,000 Credits</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Price: IDR 100,000</p>
            <Button onClick={() => handleBuyPlan("Pro")}>Buy</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ultimate</CardTitle>
            <CardDescription>Unlimited Credits</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Price: IDR 200,000</p>
            <Button onClick={() => handleBuyPlan("Ultimate")}>Buy</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
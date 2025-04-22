"use client";

import { useState } from "react";
import { signInWithEmail as firebaseSignInWithEmail, signInWithGoogle } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { Loader2, AlertCircle, Lock } from "lucide-react";
import Link from "next/link";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>( null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // This returns your custom User type, not Firebase User
      const userData = await firebaseSignInWithEmail(email, password);
      
      // We need to get the actual Firebase user for email verification
      const firebaseUser = auth.currentUser;
      
      if (firebaseUser && !firebaseUser.emailVerified) {
        setError("Please verify your email now.");
        setIsLoading(false);
        return;
      }

      router.push("/image-generator");
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setError("No user found with this email.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else {
        setError("Failed to sign in. Please check your credentials.");
      }
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      router.push("/image-generator");
    } catch (err: any) {
      setError("Failed to sign in with Google.");
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      // Get the current Firebase user instead of using the custom User
      const firebaseUser = auth.currentUser;
      
      if (firebaseUser) {
        await sendEmailVerification(firebaseUser);
        setError("Verification email sent. Please check your inbox.");
      } else {
        // Try to sign in first to get the user
        await firebaseSignInWithEmail(email, password);
        const newFirebaseUser = auth.currentUser;
        
        if (newFirebaseUser) {
          await sendEmailVerification(newFirebaseUser);
          setError("Verification email sent. Please check your inbox.");
        } else {
          throw new Error("Could not get user");
        }
      }
    } catch (err: any) {
      setError("Failed to resend verification email.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center to-muted/30 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-muted-foreground">Sign in to your account to continue</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <Button onClick={handleResendVerification} className="mt-2">
              Resend Verification Email
            </Button>
          </Alert>
        )}

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription>
              Enter your credentials below to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-11" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-2 text-xs text-muted-foreground">
                  OR CONTINUE WITH
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full h-11 border-2"
            >
              <FcGoogle className="mr-2 h-5 w-5" />
              Sign in with Google
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
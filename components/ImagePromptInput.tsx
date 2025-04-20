// ImagePromptInput.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Info } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { useCurrentUser  } from "@/lib/authUtils";
import { Progress } from "./ui/progress";
import { Loader2, Sparkles, ImageIcon } from "lucide-react";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";



interface ImagePromptInputProps {
  onSubmit: (prompt: string) => void;
  isEditing: boolean;
  isLoading: boolean;
}

export function ImagePromptInput({ onSubmit, isEditing, isLoading }: ImagePromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const user = useCurrentUser ();

  const OPERATION_COST = 10;

  const fetchCredits = async (uid: string) => {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) {
      setCredits(snap.data().credits ?? 0);
    } else {
      setCredits(0);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      fetchCredits(user.uid);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      return setError("Please sign in to generate images.");
    }

    if (credits === null) {
      return setError("Unable to fetch your credits. Please try again later.");
    }

    if (credits < OPERATION_COST) {
      return setError(`Not enough credits. You need at least ${OPERATION_COST} credits.`);
    }

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      return setError("Prompt cannot be empty.");
    }

    try {
      setCredits((prev) => (prev ?? 0) - OPERATION_COST); // Optimistic UI update

      await updateDoc(doc(db, "users", user.uid), {
        credits: increment(-OPERATION_COST), // Mengurangi credits di Firestore
      });

      onSubmit(trimmedPrompt); // Kirim prompt ke parent
      setPrompt(""); // Reset input field
      setError(null); // Reset error
    } catch (err) {
      console.error("Error during image generation:", err);
      setError("Failed to deduct credits or generate image. Please try again.");
      setCredits((prev) => (prev ?? 0) + OPERATION_COST); // Revert optimistic update
    }
  };

  return (
    <Card className="w-full bg-card border-border shadow-lg rounded-xl">
      <CardHeader className="pb-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl font-semibold text-foreground">
              {isEditing ? "Edit Image" : "Generate Image"}
            </CardTitle>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-3 bg-muted/30 px-3 py-1 rounded-full">
                  <Progress 
                    value={(prompt.length / 500) * 100} 
                    className="w-[60px] h-1.5" 
                  />
                  <span className="text-xs font-medium">{prompt.length}/500</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">Be descriptive for better results</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {error && (
          <Alert variant="destructive" className="mb-4 border-2">
            <AlertTitle className="font-semibold">Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
  
        {credits !== null && (
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Available Credits</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{credits}</span>
                  <Badge variant="secondary" className="font-normal">
                    Cost: {OPERATION_COST} credits
                  </Badge>
                </div>
              </div>
              <Sparkles className="h-8 w-8 text-primary opacity-50" />
            </div>
          </div>
        )}
  
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">
              {isEditing ? "Describe how you want to edit the image" : "Describe the image you want to generate"}
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                isEditing
                  ? "Example: Make the background blue and add a rainbow..."
                  : "Example: A 3D rendered image of a pig with wings and a top hat flying over a futuristic city..."
              }
              className="min-h-[120px] resize-none rounded-xl border-2 focus-visible:ring-2 focus-visible:ring-primary/20"
              maxLength={500}
            />
            {prompt.trim().length === 0 && (
              <p className="text-xs text-muted-foreground">Please enter a description to continue</p>
            )}
          </div>
  
          <Button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            variant="default"
            size="lg"
            className={cn(
              "w-full relative overflow-hidden group",
              "bg-gradient-to-r from-blue-600 to-blue-700",
              "hover:from-blue-700 hover:to-blue-800",
              "text-white font-medium",
              "hover:scale-[1.02] active:scale-[0.98] transition-all duration-200",
              "shadow-xl shadow-blue-500/25",
              "disabled:opacity-50 disabled:pointer-events-none"
            )}
          >
            <div className="pointer-events-none absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-shimmer" />
            <div className="relative flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>{isEditing ? "Edit Image" : "Generate Image"}</span>
                </>
              )}
            </div>
          </Button>
        </form>
      </CardContent>
    </Card>
  );  
}
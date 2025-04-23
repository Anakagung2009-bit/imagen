// ImagePromptInput.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { useCurrentUser  } from "@/lib/authUtils";
import { Progress } from "./ui/progress";
import { Loader2, Sparkles, ImageIcon, BrainCircuit, Info } from "lucide-react";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface ImagePromptInputProps {
  onSubmit: (prompt: string, model: string) => void;
  isEditing: boolean;
  isLoading: boolean;
}

export function ImagePromptInput({ onSubmit, isEditing, isLoading }: ImagePromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("gemini");
  const user = useCurrentUser();

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

      onSubmit(trimmedPrompt, selectedModel); // Pass the selected model to parent
      setPrompt(""); // Reset input field
      setError(null); // Reset error
    } catch (err) {
      console.error("Error during image generation:", err);
      setError("Failed to deduct credits or generate image. Please try again.");
      setCredits((prev) => (prev ?? 0) + OPERATION_COST); // Revert optimistic update
    }
  };

  return (
    <Card className="w-full bg-card border shadow-md rounded-xl overflow-hidden">
      <CardHeader className="pb-3 border-b px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10">
              <ImageIcon className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-lg sm:text-xl font-semibold text-foreground">
              {isEditing ? "Edit Image" : "Generate Image"}
            </CardTitle>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 bg-muted/40 px-2.5 py-1 rounded-full">
                  <Progress 
                    value={(prompt.length / 500) * 100} 
                    className="w-[50px] sm:w-[60px] h-1.5" 
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
      <CardContent className="p-4 sm:p-6 space-y-5">
        {error && (
          <Alert variant="destructive" className="mb-4 border animate-in fade-in-50 slide-in-from-top-5 duration-300">
            <AlertTitle className="font-semibold flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-destructive-foreground"></div>
              Error
            </AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
  
        {credits !== null && (
          <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-muted/40 to-muted/10 backdrop-blur-sm border border-muted/20">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <div className="h-1 w-1 rounded-full bg-primary/70"></div>
                  Available Credits
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{credits}</span>
                  <Badge variant="secondary" className="font-normal text-xs">
                    Cost: {OPERATION_COST} credits
                  </Badge>
                </div>
              </div>
              <div className="p-2 rounded-full bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary opacity-80" />
              </div>
            </div>
          </div>
        )}
        
        {/* Enhanced AI Model Selection */}
        <div className="mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <div className="h-1 w-1 rounded-full bg-primary/70"></div>
              Select AI Model
            </h3>
            <Badge variant={selectedModel === "gemini" ? "default" : "outline"} className="ml-2 text-xs">
              {selectedModel === "gemini" ? "Google DeepMind" : "DALL-E 3"}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              className={cn(
                "h-auto py-3 px-4 justify-start border",
                selectedModel === "gemini" 
                  ? "bg-primary/10 text-primary border-primary/30 ring-1 ring-primary/20" 
                  : "hover:bg-muted/50"
              )}
              onClick={() => setSelectedModel("gemini")}
              disabled={isLoading}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-1.5 rounded-md",
                  selectedModel === "gemini" ? "bg-primary/20" : "bg-muted"
                )}>
                  <BrainCircuit className={cn(
                    "h-4 w-4",
                    selectedModel === "gemini" ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">Google DeepMind</div>
                  <div className="text-xs text-muted-foreground">Advanced AI for creative images</div>
                </div>
              </div>
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className={cn(
                "h-auto py-3 px-4 justify-start border",
                selectedModel === "dalle" 
                  ? "bg-primary/10 text-primary border-primary/30 ring-1 ring-primary/20" 
                  : "hover:bg-muted/50"
              )}
              onClick={() => setSelectedModel("dalle")}
              disabled={isLoading || isEditing}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-1.5 rounded-md",
                  selectedModel === "dalle" ? "bg-primary/20" : "bg-muted"
                )}>
                  <Sparkles className={cn(
                    "h-4 w-4",
                    selectedModel === "dalle" ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">DALL-E 3</div>
                  <div className="text-xs text-muted-foreground">Realistic and detailed images</div>
                </div>
              </div>
            </Button>
          </div>
          
          {isEditing && selectedModel === "dalle" && (
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>DALL-E 3 doesn't support image editing. Please use Google DeepMind for editing.</p>
            </div>
          )}
        </div>
  
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80 flex items-center gap-1.5">
              <div className="h-1 w-1 rounded-full bg-primary/70"></div>
              {isEditing ? "Describe how you want to edit the image" : "Describe the image you want to generate"}
            </label>
            
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                isEditing
                  ? "Example: Make the background blue and add a rainbow..."
                  : selectedModel === "gemini" 
                    ? "Example: A 3D rendered image of a pig with wings and a top hat flying over a futuristic city..."
                    : "Example: A photorealistic portrait of a medieval knight with ornate armor in a forest setting..."
              }
              className="min-h-[120px] resize-none rounded-xl border focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/30"
              maxLength={500}
            />
            {prompt.trim().length === 0 && (
              <p className="text-xs text-muted-foreground">Please enter a description to continue</p>
            )}
          </div>
  
          <Button
            type="submit"
            disabled={!prompt.trim() || isLoading || (isEditing && selectedModel === "dalle")}
            className={cn(
              "w-full relative overflow-hidden group h-12",
              selectedModel === "gemini" 
                ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800" 
                : "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800",
              "text-white font-medium",
              "hover:scale-[1.01] active:scale-[0.99] transition-all duration-200",
              "shadow-lg",
              selectedModel === "gemini" ? "shadow-blue-500/20" : "shadow-purple-500/20",
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
                  {selectedModel === "gemini" ? <BrainCircuit className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
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
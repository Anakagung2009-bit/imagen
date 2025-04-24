"use client";

import { useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Download, Eraser, ImageIcon, Loader2, RefreshCw, Sparkles, Wand2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function BackgroundRemover() {
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("original");

  const handleImageSelect = (imageData: string) => {
    setInputImage(imageData);
    setOutputImage(null);
    setError(null);
    setActiveTab("original");
  };

  const handleRemoveBackground = async () => {
    if (!inputImage) {
      setError("Please upload an image first");
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 10;
        return newProgress >= 95 ? 95 : newProgress;
      });
    }, 300);

    try {
      const response = await fetch("/api/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: inputImage,
          action: "remove-background"
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to remove background");
      }

      setProgress(100);
      setOutputImage(result.image);
      setActiveTab("processed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove background");
    } finally {
      clearInterval(progressInterval);
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleDownload = () => {
    if (!outputImage) return;
    
    const link = document.createElement("a");
    link.href = outputImage;
    link.download = `background-removed-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setInputImage(null);
    setOutputImage(null);
    setError(null);
    setProgress(0);
    setActiveTab("original");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Background Remover</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upload an image and our AI will automatically remove the background, creating a clean, 
            transparent version perfect for your projects.
          </p>
        </div>

        <Card className="border shadow-lg overflow-hidden bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10">
                <Eraser className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>AI Background Remover</CardTitle>
                <CardDescription>Upload your image to get started</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            {error && (
              <Alert variant="destructive" className="mb-4 animate-in fade-in-50 slide-in-from-top-5 duration-300">
                <AlertTitle className="font-semibold flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-destructive-foreground"></div>
                  Error
                </AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground/80 flex items-center gap-1.5">
                    <div className="h-1 w-1 rounded-full bg-primary/70"></div>
                    Upload Image
                  </h3>
                  {inputImage && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleReset}
                      className="h-8 text-xs"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Reset
                    </Button>
                  )}
                </div>
                
                <ImageUpload 
                  onImageSelect={handleImageSelect} 
                  currentImage={inputImage} 
                  onError={setError}
                />
                
                {inputImage && !outputImage && (
                  <Button 
                    onClick={handleRemoveBackground} 
                    disabled={isProcessing || !inputImage}
                    className={cn(
                      "w-full relative overflow-hidden group h-12",
                      "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70",
                      "text-white font-medium",
                      "hover:scale-[1.01] active:scale-[0.99] transition-all duration-200",
                      "shadow-lg shadow-primary/20",
                      "disabled:opacity-50 disabled:pointer-events-none"
                    )}
                  >
                    <div className="pointer-events-none absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-shimmer" />
                    <div className="relative flex items-center justify-center gap-2">
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Removing Background...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-5 w-5" />
                          <span>Remove Background</span>
                        </>
                      )}
                    </div>
                  </Button>
                )}
                
                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>Processing</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2 rounded-full" />
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                {(inputImage || outputImage) && (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-foreground/80 flex items-center gap-1.5">
                        <div className="h-1 w-1 rounded-full bg-primary/70"></div>
                        Preview
                      </h3>
                      {outputImage && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleDownload}
                          className="h-8 text-xs border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                    
                    {outputImage && (
                      <Tabs 
                        defaultValue={activeTab} 
                        value={activeTab} 
                        onValueChange={setActiveTab}
                        className="w-full"
                      >
                        <TabsList className="grid grid-cols-2 mb-4">
                          <TabsTrigger value="original">Original</TabsTrigger>
                          <TabsTrigger value="processed">Background Removed</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="original" className="mt-0">
                          <Card className="overflow-hidden border">
                            <CardContent className="p-0">
                              <div className="relative aspect-video bg-muted/30 flex items-center justify-center">
                                {inputImage ? (
                                  <img 
                                    src={inputImage} 
                                    alt="Original" 
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                                    <ImageIcon className="h-10 w-10 mb-2" />
                                    <span>No image uploaded</span>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                        
                        <TabsContent value="processed" className="mt-0">
                          <Card className="overflow-hidden border">
                            <CardContent className="p-0">
                              <div className="relative aspect-video bg-[url('/checkered-background.png')] bg-repeat flex items-center justify-center">
                                {outputImage ? (
                                  <img 
                                    src={outputImage} 
                                    alt="Background Removed" 
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                                    <Sparkles className="h-10 w-10 mb-2" />
                                    <span>Processing image...</span>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </Tabs>
                    )}
                    
                    {inputImage && !outputImage && (
                      <Card className="overflow-hidden border">
                        <CardContent className="p-0">
                          <div className="relative aspect-video bg-muted/30 flex items-center justify-center">
                            <img 
                              src={inputImage} 
                              alt="Original" 
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
                
                {!inputImage && !outputImage && (
                  <div className="flex flex-col items-center justify-center h-full min-h-[300px] border border-dashed rounded-lg p-6 bg-muted/10">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Eraser className="h-8 w-8 text-primary/70" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No Image Yet</h3>
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      Upload an image on the left to remove its background
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="bg-muted/20 border-t p-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3 w-3" />
              <span>Powered by AI Background Removal Technology</span>
            </div>
          </CardFooter>
        </Card>
        
        <div className="bg-card/80 backdrop-blur-sm border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">How It Works</h2>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ImageIcon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-medium">1. Upload Image</h3>
              <p className="text-sm text-muted-foreground">
                Upload any image with a clear subject and background
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Wand2 className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-medium">2. AI Processing</h3>
              <p className="text-sm text-muted-foreground">
                Our AI automatically detects and removes the background
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Download className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-medium">3. Download Result</h3>
              <p className="text-sm text-muted-foreground">
                Get your image with transparent background ready to use
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
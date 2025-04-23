// page.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { ImagePromptInput } from "@/components/ImagePromptInput";
import { ImageResultDisplay } from "@/components/ImageResultDisplay";
import { Sparkles, Wand2, ImageIcon, Rocket, Zap, History, Settings } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { HistoryItem } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import * as Tooltip from "@radix-ui/react-tooltip";
import { GeneratedImageGallery } from "@/components/GeneratedImageGallery";
import { useCurrentUser } from "@/lib/authUtils";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { uploadToImageKit } from "@/lib/uploadToImageKit";
import { CreditDialog } from "@/components/CreditDialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link"

export default function ImageGenerator() {
  const [images, setImages] = useState<string[]>([]); // Array of strings
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>("create");
  const [isMobile, setIsMobile] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Initializing AI...");
  const [isCreditDialogOpen, setCreditDialogOpen] = useState(false);
  const [userCredits, setUserCredits] = useState<number>(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messageIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const user = useCurrentUser();
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>("gemini");


  const loadingMessages = [
    "Initializing AI...",
    "Analyzing your prompt...",
    "Generating creative concepts...",
    "AI is thinking...",
    "Creating visual elements...",
    "Refining the composition...",
    "Adding artistic details...",
    "Applying finishing touches...",
    "Almost there...",
  ];

  // Load user's history and credits from Firestore when user is authenticated
  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserCredits(userData.credits || 1000);
            
            const imagesSnapshot = await getDocs(collection(db, "users", user.uid, "generatedImages"));
            const images = imagesSnapshot.docs.map(doc => {
              const data = doc.data();
              return {
                role: "model",
                parts: [
                  { image: data.imageUrl },
                  { text: data.prompt }
                ]
              } as HistoryItem;
            });
            setHistory(prevHistory => [...prevHistory, ...images]);
          } else {
            await setDoc(userDocRef, { 
              imageHistory: [],
              credits: 1000
            }, { merge: true });
            setUserCredits(1000);
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      }
    };

    fetchUserData();
  }, [user]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
    };
  }, []);

  // Modified to handle both string and array inputs
  const handleImageSelect = (imageData: string | string[]) => {
    if (Array.isArray(imageData)) {
      setImages(imageData);
      if (imageData.length > 0) {
        setActiveTab("edit");
      }
    } else {
      // Handle single string case (for backward compatibility)
      setImages(imageData ? [imageData] : []);
      if (imageData) {
        setActiveTab("edit");
      }
    }
  };

  const handlePromptSubmit = async (prompt: string, model: string) => {
    try {
      // If editing an image and DALL-E is selected, show error
      if (currentImage && model === "dalle") {
        setError("DALL-E 3 doesn't support image editing. Please switch to Google DeepMind for editing.");
        setIsLoading(false);
        return;
      }
      
      // Set loading states
      setLoading(true);
      setError(null);
      setProgress(0);
      setLoadingMessage(loadingMessages[0]);
      setSelectedModel(model); // Store the selected model

      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev < 15) return prev + (Math.random() * 1);
          if (prev < 40) return prev + (Math.random() * 0.8);
          if (prev < 60) return prev + (Math.random() * 0.6);
          if (prev < 80) return prev + (Math.random() * 0.4);
          if (prev < 95) return prev + (Math.random() * 0.2);
          return 95;
        });
      }, 500);

      let messageIndex = 0;
      messageIntervalRef.current = setInterval(() => {
        if (messageIndex < loadingMessages.length - 1) {
          messageIndex++;
          setLoadingMessage(loadingMessages[messageIndex]);
        }
      }, 2000);

      const imageToEdit = generatedImage || (images.length > 0 ? images[0] : null);

      const requestData = {
        prompt,
        image: imageToEdit,
        history: history.length > 0 ? history : undefined,
        model: currentImage ? "gemini" : model, // Force gemini if editing an image
      };

      const response = await fetch("/api/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      clearInterval(progressIntervalRef.current);
      clearInterval(messageIntervalRef.current);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate image");
      }

      const data = await response.json();

      if (data.image) {
        setGeneratedImage(data.image);
        setDescription(data.description || null);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);

        // Deduct credits
        const newCredits = userCredits - 10;
        setUserCredits(newCredits);

        const userMessage: HistoryItem = {
          role: "user",
          parts: [
            { text: prompt },
            ...(imageToEdit ? [{ image: imageToEdit }] : []),
          ],
        };

        const aiResponse: HistoryItem = {
          role: "model",
          parts: [
            ...(data.description ? [{ text: data.description }] : []),
            ...(data.image ? [{ image: data.image }] : []),
          ],
        };

        const newHistory = [...history, userMessage, aiResponse];
        setHistory(newHistory);

        // Save the updated history and image URL to Firestore
        if (user?.uid && data.image) {
          // Update user credits
          await setDoc(doc(db, "users", user.uid), { credits: newCredits }, { merge: true });
          
          // Upload base64 to ImageKit
          const imageKitUrl = await uploadToImageKit(data.image, prompt);
        
          // Save URL to Firestore, not base64
          await addDoc(collection(db, "users", user.uid, "generatedImages"), {
            imageUrl: imageKitUrl,
            prompt: prompt,
            createdAt: serverTimestamp()
          });
        }
      } else {
        setError("No image returned from API");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
      console.error("Error processing request:", error);
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setImages([]);
    setGeneratedImage(null);
    setDescription(null);
    setLoading(false);
    setError(null);
    setHistory([]);
    setActiveTab("create");
    setLoadingMessage("Initializing AI...");
  };

  const isEditing = !!currentImage;
  const displayImage = generatedImage;

  return (
    <main className="min-h-screen to-muted/20">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {/* Confetti animation would go here */}
        </div>
      )}
      
      <div className="container px-4 py-8 mx-auto max-w-7xl">
        <header className="flex flex-col md:flex-row items-center justify-between mb-12">
          <div className="space-y-2 text-center md:text-left mb-6 md:mb-0">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
                Agung Imagen AI
              </h1>
            </div>
            <p className="text-sm md:text-base text-muted-foreground">
              Unleash your creativity with AI-powered image generation
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">{userCredits}</span>
                    <span className="sr-only md:not-sr-only text-xs text-muted-foreground">credits</span>
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Content className="p-2 text-xs bg-background border rounded-md shadow-md">
                  Your remaining AI credits
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
            
            {user && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="px-2 py-1 text-xs">
                  {user.email?.split('@')[0] || 'User'}
                </Badge>
              </div>
            )}
          </div>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab + (loading ? '-loading' : '')}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border bg-card/50 backdrop-blur-sm shadow-md overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-full bg-primary/10">
                          <Wand2 className="w-5 h-5 text-primary" />
                        </div>
                        <CardTitle className="text-xl font-medium">AI Image Studio</CardTitle>
                      </div>
                      <HoverCard>
                        <HoverCardTrigger>
                
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <div className="flex justify-between space-x-4">
                            <div className="space-y-1">
                              <h4 className="text-sm font-semibold">Google DeepMind Gemini 2.0 Flash</h4>
                              <p className="text-sm text-muted-foreground">
                                Using cutting-edge AI technology for high-quality image generation and editing
                              </p>
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </div>
                  </CardHeader>
                  
                  <Separator />
                  
                  <CardContent className="p-6">
                    {error && (
                      <Alert variant="destructive" className="mb-6">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="create" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                          <ImageIcon className="w-4 h-4 mr-2" />
                          Create
                        </TabsTrigger>
                        <TabsTrigger value="edit" disabled={!currentImage} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                          <Wand2 className="w-4 h-4 mr-2" />
                          Edit
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="create" className="space-y-6">
                        {loading ? (
                          <div className="space-y-6 p-8 rounded-lg border bg-card/50">
                            <div className="space-y-2">
                              <Progress value={progress} className="h-2" />
                              <p className="text-sm text-center text-muted-foreground animate-pulse">
                                {loadingMessage}
                              </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                              {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="aspect-square rounded-lg" />
                              ))}
                            </div>
                          </div>
                        ) : !displayImage ? (
                          <>
                             <ImageUpload 
                              onImageSelect={setCurrentImage} 
                              currentImage={currentImage} 
                              onError={setError}
                              selectedModel={selectedModel} // Pass the selected model
                            />
                                                  <ImagePromptInput
                              onSubmit={handlePromptSubmit}
                              isEditing={!!currentImage}
                              isLoading={isLoading}
                            />
                          </>
                        ) : (
                          <ImageResultDisplay
                            imageUrl={displayImage}
                            description={description}
                            onReset={handleReset}
                            conversationHistory={history}
                          />
                        )}
                      </TabsContent>
                      
                      <TabsContent value="edit">
                        {isEditing && (
                          <div className="space-y-6">
                            <div className="relative aspect-square max-w-md mx-auto rounded-lg overflow-hidden border shadow-md">
                              <img 
                                src={currentImage} 
                                alt="Image to edit" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <ImagePromptInput
                              onSubmit={handlePromptSubmit}
                              isEditing={true}
                              isLoading={loading}
                            />
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                  
                  <CardFooter className="p-6 pt-0">
                    <div className="w-full flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={handleReset}
                        variant="outline"
                        className="flex-1 hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Rocket className="w-4 h-4 mr-2" />
                        Start New Project
                      </Button>
                      <Link href="/plans" className="flex-1">
                        <Button variant="default" className="w-full">
                            <Zap className="w-4 h-4 mr-2" />
                            Get More Credits
                        </Button>
                        </Link>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
          
          <div className="lg:col-span-3">
            <Card className="border bg-card/50 backdrop-blur-sm shadow-md h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-muted-foreground" />
                  <CardTitle className="text-lg font-medium">Recent Images</CardTitle>
                </div>
              </CardHeader>
              
              <Separator />
              
              <CardContent className="p-4">
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    {history.length > 0 ? (
                      history
                        .filter(item => item.role === "model" && item.parts.some(part => "image" in part))
                        .slice(-10)
                        .reverse()
                        .map((item, index) => {
                          const imagePart = item.parts.find(part => "image" in part);
                          const textPart = item.parts.find(part => "text" in part);
                          return imagePart && "image" in imagePart ? (
                            <div key={index} className="group relative rounded-md overflow-hidden border">
                              <img 
                                src={imagePart.image} 
                                alt={textPart && "text" in textPart ? textPart.text : "Generated image"} 
                                className="w-full aspect-square object-cover transition-transform group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                <p className="text-xs text-white line-clamp-2">
                                  {textPart && "text" in textPart ? textPart.text : "Generated image"}
                                </p>
                              </div>
                            </div>
                          ) : null;
                        })
                    ) : (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No images generated yet
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* <div className="mt-16">
          <GeneratedImageGallery history={history} />
        </div> */}
      </div>
      
      <CreditDialog 
        isOpen={isCreditDialogOpen} 
        onClose={() => setCreditDialogOpen(false)}
      />
    </main>
  );
}
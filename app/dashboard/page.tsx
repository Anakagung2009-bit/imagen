// pages/dashboard.tsx
"use client";

import { useState, useEffect } from "react";
import { useCurrentUser } from "@/lib/authUtils";
import { GeneratedImageGallery } from "@/components/GeneratedImageGallery";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { HistoryItem } from "@/lib/types";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  ImageIcon, 
  Zap, 
  History, 
  CreditCard,
  ChevronRight,
  Calendar,
  BarChart3,
  Sparkles,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const user = useCurrentUser();
  const [activeTab, setActiveTab] = useState("overview");
  const [userCredits, setUserCredits] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalImages: 0,
    thisMonth: 0,
    creditsUsed: 0
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        try {
          setIsLoading(true);
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserCredits(userData.credits || 0);
            
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
            
            setHistory(images);
            setStats({
              totalImages: images.length,
              thisMonth: images.filter(img => {
                // Count images from current month
                const now = new Date();
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                return true; // Placeholder - would need timestamp data to filter properly
              }).length,
              creditsUsed: images.length * 10 // Assuming 10 credits per image
            });
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserData();
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen to-muted/20 p-4">
        <Card className="w-full max-w-md border shadow-lg backdrop-blur-sm bg-card/80">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto rounded-full bg-primary/10 p-3 w-fit">
              <LayoutDashboard className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Access Required</CardTitle>
            <CardDescription>Please sign in to view your dashboard</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <Button variant="default" size="lg" className="w-full sm:w-auto px-8 font-medium" asChild>
              <a href="/signin">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b  to-muted/10 pb-10">
      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-primary/20 to-primary/40 blur-sm"></div>
                <Avatar className="h-16 w-16 border-2 border-background relative">
                  <AvatarImage src={user.photoURL || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome, {user.displayName || user.email?.split('@')[0]}</h1>
                <p className="text-muted-foreground">Manage your AI image generation dashboard</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-2 md:mt-0">
              <Badge variant="outline" className="px-3 py-1.5 gap-1.5 text-sm border-primary/20 bg-primary/5 rounded-full">
                <Zap className="h-4 w-4 text-primary" />
                <span className="font-semibold">{userCredits}</span> credits
              </Badge>
              <Link href="/plans" passHref>
                <Button className="rounded-full shadow-md bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300" size="sm">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Buy Credits
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="bg-card/80 backdrop-blur-sm rounded-xl shadow-sm border p-1.5">
            <TabsList className="grid grid-cols-3 md:grid-cols-5 h-14 bg-muted/50 rounded-lg">
              <TabsTrigger value="overview" className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md transition-all">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="gallery" className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md transition-all">
                <ImageIcon className="h-4 w-4 mr-2" />
                Gallery
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md transition-all">
                <History className="h-4 w-4 mr-2" />
                History
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <Card className="overflow-hidden border bg-card/80 backdrop-blur-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="pb-2 border-b border-border/40">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-primary" />
                      Total Images
                    </CardTitle>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-xs">
                      All time
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-3xl font-bold">{stats.totalImages}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      {stats.thisMonth} this month
                    </p>
                  </div>
                </CardContent>
                <div className="h-1 w-full bg-gradient-to-r from-primary/40 to-primary/10"></div>
              </Card>
              
              <Card className="overflow-hidden border bg-card/80 backdrop-blur-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="pb-2 border-b border-border/40">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Credits Used
                    </CardTitle>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-xs">
                      10 per image
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-3xl font-bold">{stats.creditsUsed}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      {userCredits} remaining
                    </p>
                  </div>
                </CardContent>
                <div className="h-1 w-full bg-gradient-to-r from-primary/40 to-primary/10"></div>
              </Card>
              
              <Card className="overflow-hidden border bg-card/80 backdrop-blur-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="pb-2 border-b border-border/40">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      Credit Usage
                    </CardTitle>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-xs">
                      {Math.round((stats.creditsUsed / (stats.creditsUsed + userCredits || 1)) * 100)}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-3xl font-bold">{Math.round((stats.creditsUsed / (stats.creditsUsed + userCredits || 1)) * 100)}%</div>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>0</span>
                      <span>Used vs. Available</span>
                      <span>100%</span>
                    </div>
                    <Progress 
                      value={(stats.creditsUsed / (stats.creditsUsed + userCredits || 1)) * 100} 
                      className="h-2 rounded-full" 
                    />
                  </div>
                </CardContent>
                <div className="h-1 w-full bg-gradient-to-r from-primary/40 to-primary/10"></div>
              </Card>
            </div>

            <Card className="border bg-card/80 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-primary/10">
                        <ImageIcon className="h-4 w-4 text-primary" />
                      </div>
                      Recent Creations
                    </CardTitle>
                    <CardDescription>Your latest AI-generated images</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => setActiveTab("gallery")}>
                    View all
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <Separator className="opacity-50" />
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {isLoading ? (
                    Array(4).fill(0).map((_, i) => (
                      <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg"></div>
                    ))
                  ) : history.length > 0 ? (
                    history.slice(0, 4).map((item, index) => {
                      const imagePart = item.parts.find(part => "image" in part);
                      const textPart = item.parts.find(part => "text" in part);
                      
                      return imagePart && "image" in imagePart ? (
                        <div key={index} className="group relative rounded-lg overflow-hidden border shadow-sm">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <img 
                            src={imagePart.image} 
                            alt={textPart && "text" in textPart ? textPart.text : "Generated image"} 
                            className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 flex flex-col justify-between p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Badge variant="outline" className="w-fit bg-black/50 text-white border-white/20 backdrop-blur-sm text-xs self-end">
                              <Clock className="h-3 w-3 mr-1" />
                              Recent
                            </Badge>
                            <p className="text-xs text-white line-clamp-2 bg-black/50 p-2 rounded-md backdrop-blur-sm">
                              {textPart && "text" in textPart ? textPart.text : "Generated image"}
                            </p>
                          </div>
                        </div>
                      ) : null;
                    })
                  ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-10 text-muted-foreground">
                      <div className="p-3 rounded-full bg-muted mb-3">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p>No images generated yet</p>
                      <Button variant="outline" size="sm" className="mt-4" asChild>
                        <Link href="/image-generator">Create your first image</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
              {history.length > 4 && (
                <CardFooter className="pt-0 pb-6 flex justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab("gallery")}
                    className="rounded-full px-6 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary"
                  >
                    View All Images
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              )}
            </Card>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery">
            <Card className="border bg-card/80 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-primary/10">
                    <ImageIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle>My Gallery</CardTitle>
                    <CardDescription>All your AI-generated masterpieces in one place</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <Separator className="opacity-50" />
              <CardContent className="pt-6">
                <GeneratedImageGallery history={history} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card className="border bg-card/80 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-primary/10">
                    <History className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Generation History</CardTitle>
                    <CardDescription>Track your image generation activity</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <Separator className="opacity-50" />
              <CardContent className="pt-6">
                {isLoading ? (
                  <div className="space-y-4">
                    {Array(5).fill(0).map((_, i) => (
                      <div key={i} className="h-16 bg-muted animate-pulse rounded-md"></div>
                    ))}
                  </div>
                ) : history.length > 0 ? (
                  <div className="space-y-3">
                    {history.map((item, index) => {
                      const imagePart = item.parts.find(part => "image" in part);
                      const textPart = item.parts.find(part => "text" in part);
                      
                      return imagePart && "image" in imagePart ? (
                        <div key={index} className="flex items-center gap-4 p-3 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors">
                          <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 border">
                            <img 
                              src={imagePart.image} 
                              alt="Thumbnail" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="font-medium truncate">
                              {textPart && "text" in textPart ? textPart.text : "Generated image"}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">
                                Generated on {new Date().toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="flex-shrink-0 bg-primary/5 border-primary/20 text-primary">
                            <Zap className="h-3 w-3 mr-1" />
                            10 credits
                          </Badge>
                        </div>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    <div className="p-3 rounded-full bg-muted mb-3">
                      <History className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p>No generation history available</p>
                    <Button variant="outline" size="sm" className="mt-4" asChild>
                      <Link href="/image-generator">Create your first image</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
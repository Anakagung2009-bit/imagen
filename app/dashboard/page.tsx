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
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  ImageIcon, 
  Zap, 
  History, 
  CreditCard 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

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
        <Card className="w-full max-w-md border shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Access Required</CardTitle>
            <CardDescription>Please sign in to view your dashboard</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <Button variant="default" size="lg" asChild>
              <a href="/signin">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen to-muted/20 pb-10">
      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-4 border-primary/10">
                <AvatarImage src={user.photoURL || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">Welcome, {user.displayName || user.email?.split('@')[0]}</h1>
                <p className="text-muted-foreground">Manage your AI image generation dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="px-3 py-1 gap-1 text-sm border-primary/20 bg-primary/5">
                <Zap className="h-4 w-4 text-primary" />
                <span className="font-semibold">{userCredits}</span> credits
              </Badge>
              <Link href="/plans" passHref>
              <Button asChild variant="default" size="sm">
                <span>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Buy Credits
                </span>
              </Button>
            </Link>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="bg-card rounded-lg shadow-sm border p-1">
            <TabsList className="grid grid-cols-3 md:grid-cols-5 h-14">
              <TabsTrigger value="overview" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="gallery" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <ImageIcon className="h-4 w-4 mr-2" />
                Gallery
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <History className="h-4 w-4 mr-2" />
                History
              </TabsTrigger>
              {/* <TabsTrigger value="profile" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger> */}
              {/* <TabsTrigger value="settings" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger> */}
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalImages}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.thisMonth} this month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Credits Used</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.creditsUsed}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {userCredits} remaining
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Credit Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{Math.round((stats.creditsUsed / (stats.creditsUsed + userCredits)) * 100)}%</div>
                  <div className="mt-2">
                    <Progress value={(stats.creditsUsed / (stats.creditsUsed + userCredits)) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Creations</CardTitle>
                <CardDescription>Your latest AI-generated images</CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {isLoading ? (
                    Array(4).fill(0).map((_, i) => (
                      <div key={i} className="aspect-square bg-muted animate-pulse rounded-md"></div>
                    ))
                  ) : history.length > 0 ? (
                    history.slice(0, 4).map((item, index) => {
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
                    <div className="col-span-full text-center py-10 text-muted-foreground">
                      No images generated yet
                    </div>
                  )}
                </div>
                {history.length > 4 && (
                  <div className="mt-6 text-center">
                    <Button variant="outline" onClick={() => setActiveTab("gallery")}>
                      View All Images
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery">
            <Card>
              <CardHeader>
                <CardTitle>My Gallery</CardTitle>
                <CardDescription>All your AI-generated masterpieces in one place</CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                <GeneratedImageGallery history={history} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Generation History</CardTitle>
                <CardDescription>Track your image generation activity</CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                {isLoading ? (
                  <div className="space-y-4">
                    {Array(5).fill(0).map((_, i) => (
                      <div key={i} className="h-16 bg-muted animate-pulse rounded-md"></div>
                    ))}
                  </div>
                ) : history.length > 0 ? (
                  <div className="space-y-4">
                    {history.map((item, index) => {
                      const imagePart = item.parts.find(part => "image" in part);
                      const textPart = item.parts.find(part => "text" in part);
                      
                      return imagePart && "image" in imagePart ? (
                        <div key={index} className="flex items-center gap-4 p-3 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors">
                          <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
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
                            <p className="text-xs text-muted-foreground">
                              Generated on {new Date().toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="outline" className="flex-shrink-0">
                            10 credits
                          </Badge>
                        </div>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    No generation history available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>User Profile</CardTitle>
                <CardDescription>Manage your account information</CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <Avatar className="h-24 w-24 border-4 border-primary/10">
                      <AvatarImage src={user.photoURL || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-3xl">
                        {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h3 className="text-xl font-medium">{user.displayName || 'User'}</h3>
                      <p className="text-muted-foreground">{user.email}</p>
                      {/* <div className="flex gap-2 mt-2">
                        <Button variant="outline" size="sm">Change Avatar</Button>
                        <Button variant="outline" size="sm">Edit Profile</Button>
                      </div> */}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Account Details</h4>
                      <Card>
                        <CardContent className="p-4 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Account Type</span>
                            <span>Standard</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Member Since</span>
                            <span>{new Date().toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Last Login</span>
                            <span>{new Date().toLocaleDateString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Credit Information</h4>
                      <Card>
                        <CardContent className="p-4 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Available Credits</span>
                            <span className="font-medium">{userCredits}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Used</span>
                            <span>{stats.creditsUsed}</span>
                          </div>
                          <div className="mt-4">
                            <link href="/plans">
                            <Button variant="default" size="sm" className="w-full">
                              <CreditCard className="h-4 w-4 mr-2" />
                              Purchase More Credits
                            </Button>
                            </link>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your preferences and application settings</CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <p className="text-muted-foreground text-center py-10">
                    Settings functionality coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
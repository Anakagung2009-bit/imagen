import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { 
  Download, 
  Share, 
  ImageIcon, 
  Info, 
  Sparkles, 
  Grid3X3, 
  Grid2X2, 
  Eye,
  Loader2,
  Filter,
  SlidersHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Define the HistoryItem type
interface HistoryItem {
  role: string;
  parts: Array<{ image?: string; text?: string }>;
} 

interface GeneratedImageGalleryProps {
  history: HistoryItem[];
}

export function GeneratedImageGallery({ history }: GeneratedImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<{ url: string; prompt: string } | null>(null);
  const [layout, setLayout] = useState<"grid" | "masonry">("grid");
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const generatedImages = history.filter(item => item.role === "model" && item.parts.some(part => "image" in part));

  // Sort images based on selection
  const sortedImages = [...generatedImages].sort((a, b) => {
    return sortBy === "newest" ? -1 : 1; // Simple sort for demo purposes
  });

  const downloadImage = async (imageUrl: string, promptText: string) => {
    setIsLoading(true);
    try {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `geminiart-${promptText.substring(0, 20).replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const shareImage = async (imageUrl: string, promptText: string) => {
    setIsLoading(true);
    try {
      if (navigator.share) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'geminiart.png', { type: 'image/png' });

        await navigator.share({
          title: 'My GeminiArt Creation',
          text: `AI-generated image: ${promptText}`,
          files: [file]
        });
      } else {
        await navigator.clipboard.writeText(`Check out this AI-generated image: ${promptText}`);
        alert('Link copied to clipboard! Share it wherever you like.');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (generatedImages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-gradient-to-b from-muted/5 to-muted/20 rounded-xl border border-dashed">
        <div className="w-20 h-20 rounded-full bg-background flex items-center justify-center mb-6 shadow-md border border-muted/30">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping opacity-75"></div>
            <ImageIcon className="h-10 w-10 text-muted-foreground/60 relative" />
          </div>
        </div>
        <h3 className="text-xl font-medium mb-2">Your gallery is empty</h3>
        <p className="text-sm max-w-md text-center mb-6">
          Generate your first image to start building your collection
        </p>
        <Button asChild className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg">
          <a href="/image-generator">
            <Sparkles className="h-4 w-4 mr-2" />
            Create Your First Image
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full py-6">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/50 p-4 rounded-lg border shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">Your Gallery</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {generatedImages.length} image{generatedImages.length !== 1 ? 's' : ''} generated with AI
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9 gap-1">
                        <SlidersHorizontal className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Sort</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Sort Images</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className={cn(sortBy === "newest" && "bg-primary/10 text-primary font-medium")}
                        onClick={() => setSortBy("newest")}
                      >
                        Newest First
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className={cn(sortBy === "oldest" && "bg-primary/10 text-primary font-medium")}
                        onClick={() => setSortBy("oldest")}
                      >
                        Oldest First
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">Sort your gallery</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Tabs defaultValue={layout} onValueChange={(value) => setLayout(value as "grid" | "masonry")}>
              <TabsList className="h-9">
                <TabsTrigger value="grid" className="px-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Grid</span>
                </TabsTrigger>
                <TabsTrigger value="masonry" className="px-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  <Grid2X2 className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Masonry</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                  <Info className="h-4 w-4" />
                </Button>
              </HoverCardTrigger>
              <HoverCardContent side="top" align="end" className="w-80 p-4">
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-primary"></div>
                    Gallery Tips
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Click on any image to view it in full size. You can download or share your creations directly.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={layout + sortBy}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={layout === "grid" 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
              : "columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6"
            }
          >
            {sortedImages.map((item, index) => {
              const imagePart = item.parts.find(part => "image" in part);
              if (!imagePart || !("image" in imagePart)) return null;

              const userPrompt = index > 0 && history[index - 1].role === "user" 
                ? history[index - 1].parts.find(part => "text" in part)?.text || "Generated image"
                : "Generated image";

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={layout === "masonry" ? "mb-6 break-inside-avoid" : ""}
                >
                  <Card className="group overflow-hidden bg-card hover:shadow-xl transition-all duration-300 border border-muted hover:border-primary/20">
                    <CardContent className="p-0 relative cursor-pointer" onClick={() => setSelectedImage({ url: imagePart.image, prompt: userPrompt })}>
                      <AspectRatio ratio={1}>
                        <img 
                          src={imagePart.image}
                          alt={userPrompt}
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                        />
                      </AspectRatio>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-6">
                        <Button variant="secondary" size="sm" className="bg-white/20 backdrop-blur-sm text-white border-white/10 hover:bg-white/30">
                          <Eye className="h-4 w-4 mr-2" />
                          View Full Size
                        </Button>
                      </div>
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary" className="bg-white/10 text-white backdrop-blur-sm border-white/10">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI Generated
                          </Badge>
                          <Badge variant="outline" className="bg-black/30 text-white backdrop-blur-sm border-white/10">
                            {index + 1}/{generatedImages.length}
                          </Badge>
                        </div>
                        <p className="text-white text-sm font-medium line-clamp-2">{userPrompt}</p>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between p-3 bg-muted/30 border-t">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadImage(imagePart.image, userPrompt);
                              }}
                              variant="ghost"
                              size="sm"
                              className="h-9 w-[48%] hover:bg-background"
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4 mr-2" />
                              )}
                              <span className="hidden sm:inline">Download</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p className="text-xs">Download image</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                shareImage(imagePart.image, userPrompt);
                              }}
                              variant="ghost"
                              size="sm"
                              className="h-9 w-[48%] hover:bg-background"
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Share className="h-4 w-4 mr-2" />
                              )}
                              <span className="hidden sm:inline">Share</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p className="text-xs">Share image</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] p-0 overflow-hidden bg-black/95 border-muted">
          <ScrollArea className="h-full max-h-[80vh]">
            <div className="relative">
              <img 
                src={selectedImage?.url} 
                alt={selectedImage?.prompt || "Generated image"} 
                className="w-full h-full object-contain"
              />
            </div>
          </ScrollArea>
          <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/95 via-black/80 to-transparent backdrop-blur-sm">
            <p className="text-white mb-4 text-sm sm:text-base">{selectedImage?.prompt}</p>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <div className="flex gap-2">
                <Button 
                  onClick={() => selectedImage && downloadImage(selectedImage.url, selectedImage.prompt)}
                  variant="secondary"
                  className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white/10"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Download
                </Button>
                <Button 
                  onClick={() => selectedImage && shareImage(selectedImage.url, selectedImage.prompt)}
                  variant="secondary"
                  className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white/10"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Share className="h-4 w-4 mr-2" />
                  )}
                  Share
                </Button>
              </div>
              <DialogClose asChild>
                <Button variant="secondary" className="sm:ml-auto bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white/10">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
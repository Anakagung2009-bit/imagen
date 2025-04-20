import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Download, Share, ImageIcon, Info, Sparkles, Grid3X3, Grid2X2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";

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
  const generatedImages = history.filter(item => item.role === "model" && item.parts.some(part => "image" in part));

  const downloadImage = (imageUrl: string, promptText: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `geminiart-${promptText.substring(0, 20).replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareImage = async (imageUrl: string, promptText: string) => {
    if (navigator.share) {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'geminiart.png', { type: 'image/png' });

        await navigator.share({
          title: 'My GeminiArt Creation',
          text: `AI-generated image: ${promptText}`,
          files: [file]
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(`Check out this AI-generated image: ${promptText}`);
      alert('Link copied to clipboard! Share it wherever you like.');
    }
  };

  if (generatedImages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-muted/30 rounded-xl border border-dashed">
        <div className="w-20 h-20 rounded-full bg-background flex items-center justify-center mb-6 shadow-sm">
          <ImageIcon className="h-10 w-10 text-muted-foreground/60" />
        </div>
        <h3 className="text-xl font-medium mb-2">Your gallery is empty</h3>
        <p className="text-sm max-w-md text-center">
          Generate your first image to start building your collection
        </p>
      </div>
    );
  }

  return (
    <div className="w-full py-10">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-3xl font-bold tracking-tight">Your Gallery</h2>
            </div>
            <p className="text-muted-foreground">
              {generatedImages.length} image{generatedImages.length !== 1 ? 's' : ''} generated with AI
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Tabs defaultValue={layout} onValueChange={(value) => setLayout(value as "grid" | "masonry")}>
              <TabsList className="h-9">
                <TabsTrigger value="grid" className="px-3">
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  Grid
                </TabsTrigger>
                <TabsTrigger value="masonry" className="px-3">
                  <Grid2X2 className="h-4 w-4 mr-2" />
                  Masonry
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Info className="h-4 w-4" />
                </Button>
              </HoverCardTrigger>
              <HoverCardContent side="top" align="end" className="w-80">
                <div className="space-y-2">
                  <h4 className="font-medium">Gallery Tips</h4>
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
            key={layout}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={layout === "grid" 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
              : "columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6"
            }
          >
            {generatedImages.map((item, index) => {
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
                  <Card className="group overflow-hidden bg-card hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
                    <CardContent className="p-0 relative cursor-pointer" onClick={() => setSelectedImage({ url: imagePart.image, prompt: userPrompt })}>
                      <AspectRatio ratio={4/3}>
                        <img 
                          src={imagePart.image}
                          alt={userPrompt}
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                        />
                      </AspectRatio>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Button variant="secondary" size="sm" className="bg-white/20 backdrop-blur-sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                        <Badge variant="secondary" className="bg-white/10 text-white mb-2 backdrop-blur-sm">
                          AI Generated
                        </Badge>
                        <p className="text-white text-sm font-medium line-clamp-2">{userPrompt}</p>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between p-3 bg-muted/30 border-t">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadImage(imagePart.image, userPrompt);
                        }}
                        variant="ghost"
                        size="sm"
                        className="h-9 w-[48%] hover:bg-background"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          shareImage(imagePart.image, userPrompt);
                        }}
                        variant="ghost"
                        size="sm"
                        className="h-9 w-[48%] hover:bg-background"
                      >
                        <Share className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-5xl w-[90vw] max-h-[90vh] p-0 overflow-hidden">
          <div className="relative h-full">
            <img 
              src={selectedImage?.url} 
              alt={selectedImage?.prompt || "Generated image"} 
              className="w-full h-full object-contain bg-black/90"
            />
            <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
              <p className="text-white mb-4">{selectedImage?.prompt}</p>
              <div className="flex gap-2">
                <Button 
                  onClick={() => selectedImage && downloadImage(selectedImage.url, selectedImage.prompt)}
                  variant="secondary"
                  className="bg-white/10 backdrop-blur-sm hover:bg-white/20"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button 
                  onClick={() => selectedImage && shareImage(selectedImage.url, selectedImage.prompt)}
                  variant="secondary"
                  className="bg-white/10 backdrop-blur-sm hover:bg-white/20"
                >
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <DialogClose asChild>
                  <Button variant="secondary" className="ml-auto bg-white/10 backdrop-blur-sm hover:bg-white/20">
                    Close
                  </Button>
                </DialogClose>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
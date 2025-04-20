"use client";

import { useState } from "react";
import { Download, RotateCcw, MessageCircle, X, ZoomIn } from "lucide-react";
import { HistoryItem, HistoryPart } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import * as Tooltip from "@radix-ui/react-tooltip";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";


interface ImageResultDisplayProps {
  imageUrl: string;
  description: string | null;
  onReset: () => void;
  conversationHistory?: HistoryItem[];
}

export function ImageResultDisplay({
  imageUrl,
  description,
  onReset,
  conversationHistory = [],
}: ImageResultDisplayProps) {
  const [activeTab, setActiveTab] = useState("image");
  const [imageViewerOpen, setImageViewerOpen] = useState(false);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Generated Image</h2>
          <p className="text-sm text-muted-foreground">View and manage your generated image</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleDownload}
            className="hover:bg-primary hover:text-primary-foreground"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onReset}
            className="hover:bg-destructive hover:text-destructive-foreground"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="image">Image</TabsTrigger>
          {description && <TabsTrigger value="description">Description</TabsTrigger>}
          {conversationHistory.length > 0 && (
            <TabsTrigger value="history">History</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="image" className="mt-6">
          <div className="overflow-hidden rounded-xl border bg-background shadow-lg">
            <div 
              className="group relative cursor-zoom-in" 
              onClick={() => setImageViewerOpen(true)}
            >
              <AspectRatio ratio={16 / 9}>
                <img
                  src={imageUrl}
                  alt="Generated"
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </AspectRatio>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          </div>
        </TabsContent>

        {description && (
          <TabsContent value="description" className="mt-6">
            <div className="rounded-xl border bg-muted/50 p-6">
              <p className="text-base leading-relaxed">{description}</p>
            </div>
          </TabsContent>
        )}

        {conversationHistory.length > 0 && (
          <TabsContent value="history" className="mt-6">
            <div className="space-y-4 rounded-xl border p-6">
              {conversationHistory.map((item, index) => (
                <div key={index}>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div className={cn(
                        "p-4 rounded-lg transition-colors",
                        item.role === "user" 
                          ? "bg-muted hover:bg-muted/70" 
                          : "bg-primary/10 hover:bg-primary/20"
                      )}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center",
                            item.role === "user" ? "bg-primary" : "bg-secondary"
                          )}>
                            {item.role === "user" ? "U" : "AI"}
                          </div>
                          <p className="font-medium">
                            {item.role === "user" ? "You" : "AI Assistant"}
                          </p>
                        </div>
                        {/* ... existing parts rendering ... */}
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent>
                      <p className="text-sm">
                        {item.role === "user" ? "Your prompt" : "AI response"}
                      </p>
                    </HoverCardContent>
                  </HoverCard>
                  {index < conversationHistory.length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={imageViewerOpen} onOpenChange={setImageViewerOpen}>
        <DialogContent className="max-w-7xl h-[90vh] flex items-center justify-center">
          <img 
            src={imageUrl} 
            alt="Generated" 
            className="max-w-full max-h-full object-contain rounded-lg"
          />
          <DialogClose className="absolute top-4 right-4">
            <X className="w-4 h-4" />
          </DialogClose>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <Button onClick={handleDownload} className="bg-black/80 hover:bg-black">
              <Download className="w-4 h-4 mr-2" />
              Download Image
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
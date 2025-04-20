// components/CreditDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, CreditCard } from "lucide-react";

interface CreditDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreditDialog({ isOpen, onClose }: CreditDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <DialogTitle>Not Enough Credits</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            You do not have enough credits to perform this action. Please buy more credits.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-muted/50 p-4 rounded-lg my-2">
          <p className="text-sm">
            Credits are required to generate and edit images. Visit our plans page to purchase more credits and continue creating amazing content.
          </p>
        </div>
        
        <DialogFooter className="flex sm:justify-between gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => window.location.href = '/plans'}>
            <CreditCard className="mr-2 h-4 w-4" />
            Buy Credits
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
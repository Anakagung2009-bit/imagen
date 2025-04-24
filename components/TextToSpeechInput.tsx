// components/TextToSpeechInput.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUser } from "@/lib/authUtils";  // Jika ingin menggunakan user yang login
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { useEffect } from "react";


interface TextToSpeechInputProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}


export const TextToSpeechInput = ({ isLoading, setIsLoading, setError }: TextToSpeechInputProps) => {
  const [text, setText] = useState("");
  const [credits, setCredits] = useState<number | null>(null);
  const user = useCurrentUser();
  const OPERATION_COST = 10;  // Tentukan biaya untuk text-to-speech
  
  useEffect(() => {
    if (user && user.uid) {
      fetchCredits(user.uid);
    }
  }, [user]);

  const fetchCredits = async (uid: string) => {
    try {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) {
        setCredits(snap.data().credits ?? 0);  // Pastikan `credits` ada
      } else {
        setCredits(0);  // Jika tidak ada data, set kredit ke 0
      }
    } catch (err) {
      console.error("Error fetching credits:", err);
      setError("Failed to fetch your credits. Please try again later.");
    }
  };  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!user) {
      return setError("Please sign in to generate speech.");
    }
  
    if (credits === null) {
      // Pastikan kita mengambil kredit sebelum melanjutkan
      await fetchCredits(user.uid);
      if (credits === null) {
        return setError("Unable to fetch your credits. Please try again later.");
      }
    }
  
    if (credits < OPERATION_COST) {
      return setError(`Not enough credits. You need at least ${OPERATION_COST} credits.`);
    }
  
    const trimmedText = text.trim();
    if (!trimmedText) {
      return setError("Text cannot be empty.");
    }
  
    try {
      setIsLoading(true);
      setCredits((prev) => (prev ?? 0) - OPERATION_COST); // Optimistic UI update
  
      await updateDoc(doc(db, "users", user.uid), {
        credits: increment(-OPERATION_COST), // Mengurangi credits di Firestore
      });
  
      // Call Text-to-Speech API
      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        body: JSON.stringify({
          text: trimmedText,
        }),
      });
      const data = await response.json();
  
      if (response.ok) {
        // Handle successful response (play audio, etc.)
        new Audio(data.audioUrl).play();
      } else {
        throw new Error("Failed to generate speech.");
      }
  
      setText("");  // Reset input
      setError(null);  // Reset error
    } catch (err) {
      console.error("Error during text-to-speech generation:", err);
      setError("Failed to generate speech. Please try again.");
      setCredits((prev) => (prev ?? 0) + OPERATION_COST);  // Revert optimistic update
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground/80 flex items-center gap-1.5">
          <div className="h-1 w-1 rounded-full bg-primary/70"></div>
          Enter Text to Convert to Speech
        </label>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your text here..."
          className="min-h-[120px] resize-none rounded-xl border focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/30"
          maxLength={500}
        />
        {text.trim().length === 0 && (
          <p className="text-xs text-muted-foreground">Please enter text to continue</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={!text.trim() || isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium shadow-lg"
      >
        {isLoading ? "Processing..." : "Convert to Speech"}
      </Button>
    </form>
  );
};

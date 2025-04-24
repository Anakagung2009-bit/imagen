// pages/text-to-speech/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TextToSpeechInput } from "@/components/TextToSpeechInput";  // Import komponen TextToSpeechInput

const TextToSpeechPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Card className="w-full bg-card border shadow-md rounded-xl overflow-hidden">
        <CardHeader className="pb-3 border-b px-4 sm:px-6">
          <CardTitle className="text-lg sm:text-xl font-semibold text-foreground">
            Text to Speech Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-5">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle className="font-semibold">Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Form untuk mengubah text jadi speech */}
          <TextToSpeechInput isLoading={isLoading} 
                setError={setError} setIsLoading={setIsLoading} />
        </CardContent>
      </Card>
    </div>
  );
};

export default TextToSpeechPage;

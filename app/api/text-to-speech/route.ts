// app/api/text-to-speech/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://open-ai-text-to-speech1.p.rapidapi.com/";

export async function POST(req: NextRequest) {
  const { text } = await req.json();  // Mendapatkan body JSON dari request

  // Memastikan text tidak kosong
  if (!text || text.trim().length === 0) {
    return NextResponse.json(
      { error: "Text is required to generate speech." },
      { status: 400 }
    );
  }

  const data = JSON.stringify({
    model: "tts-1",
    input: text,
    instructions: "Speak in a lively and optimistic tone.",
    voice: "alloy",
  });

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY as string,  // Pastikan RAPIDAPI_KEY ada di .env
        "x-rapidapi-host": "open-ai-text-to-speech1.p.rapidapi.com",
        "Content-Type": "application/json",
      },
      body: data,
    });

    const result = await response.json();

    if (response.ok) {
      return NextResponse.json({ audioUrl: result.audioUrl });
    } else {
      return NextResponse.json({ error: "Failed to fetch text-to-speech." }, { status: 400 });
    }
  } catch (error) {
    console.error("Text to Speech API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

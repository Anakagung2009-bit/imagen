import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { HistoryItem, HistoryPart } from "@/lib/types";

// Initialize the Google Gen AI client with your API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "";
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Define the model ID for Gemini 2.0 Flash experimental
const MODEL_ID = "gemini-2.0-flash-exp-image-generation";

// Define interface for the formatted history item
interface FormattedHistoryItem {
  role: "user" | "model";
  parts: Array<{
    text?: string;
    inlineData?: { data: string; mimeType: string };
  }>;
}

export async function POST(req: NextRequest) {
  try {
    // Parse JSON request instead of FormData
    const requestData = await req.json();
    const { prompt, image: inputImage, history, model = "gemini", action } = requestData;
    

    // Handle background removal if action is specified
    if (action === "remove-background") {
      return await removeBackground(inputImage);
    }

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Add debugging for image editing
    if (inputImage) {
      console.log("Image editing request received");
      console.log("Image data length:", inputImage.length);
      console.log("Image type:", inputImage.substring(0, 30) + "...");
      
      // Force model to gemini for image editing
      if (model === "dalle") {
        return NextResponse.json(
          { error: "Image editing is not supported with DALL-E model. Please use Google DeepMind for image editing." },
          { status: 400 }
        );
      }
    }

    // Choose API based on model selection
    if (model === "gen3") {
      return await generateWithRunwayGen3(prompt);
    } else if (model === "dalle" && !inputImage) {
      return await generateWithDallE(prompt, inputImage);
    } else {
      return await generateWithGemini(prompt, inputImage, history);
    }    
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      {
        error: "Failed to generate image",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// New function to handle background removal
async function removeBackground(imageData: string) {
  try {
    console.log("Background removal request received");
    
    if (!imageData) {
      return NextResponse.json(
        { error: "Image data is required" },
        { status: 400 }
      );
    }
    
    // Extract base64 data from the data URL
    const base64Data = imageData.split(',')[1];
    
    // Create form data for the API request
    const formData = new URLSearchParams();
    formData.append('image_base64', base64Data);
    
    console.log("Sending request to background removal API");
    
    // Make request to RapidAPI - using the correct endpoint
    const response = await fetch('https://ai-background-remover.p.rapidapi.com/image/matte/v1', {
      method: 'POST',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY || '96af46f234mshfeee77a204fe2f7p1693ffjsn33c63d01c2ae',
        'x-rapidapi-host': 'ai-background-remover.p.rapidapi.com',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Background removal API error:", errorText);
      return NextResponse.json(
        { error: "Failed to remove background", details: errorText },
        { status: response.status }
      );
    }
    
    const result = await response.json();
    console.log("Background removal successful");
    
    // Return the processed image
    return NextResponse.json({
      image: result.image_url || result.base64 || result.image,
      success: true
    });
  } catch (error) {
    console.error("Error removing background:", error);
    return NextResponse.json(
      {
        error: "Failed to remove background",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

async function generateWithDallE(prompt: string, inputImage: string | null) {
  try {
    console.log("Generating with DALL-E 3");
    
    const options = {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'dall-e-34.p.rapidapi.com'
      },
      body: JSON.stringify({
        prompt: prompt,
        n: 1,
        model: 'dall-e-3',
        size: '1024x1024',
        quality: 'standard'
      })
    };
    
    const response = await fetch('https://dall-e-34.p.rapidapi.com/v1/images/generations', options);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error?.message || "Failed to generate image with DALL-E");
    }
    
    // Extract image URL from DALL-E response
    const imageUrl = result.data?.[0]?.url;
    
    if (!imageUrl) {
      throw new Error("No image URL returned from DALL-E");
    }
    
    // Convert the image URL to base64
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const mimeType = "image/png";
    
    return NextResponse.json({
      image: `data:${mimeType};base64,${base64Image}`,
      description: prompt,
    });
  } catch (error) {
    console.error("Error with DALL-E:", error);
    throw error;
  }
}


async function generateWithRunwayGen3(prompt: string) {
  try {
    console.log("Generating with Runway Gen-3");

    const response = await fetch("https://runwayml.p.rapidapi.com/generate/text", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": "runwayml.p.rapidapi.com",
      },
      body: JSON.stringify({
        text_prompt: prompt,
        model: "gen3",
        width: 1920,
        height: 1080,
        motion: 5,
        seed: 0,
        callback_url: "",
        time: 5
      })
    });

    const result = await response.json();
    console.log("Runway Gen-3 response:", result);

    if (!response.ok) {
      throw new Error(result.error?.message || "Failed to generate with Runway Gen-3");
    }

    return NextResponse.json({
      videoResult: result,
      description: prompt,
    });
  } catch (error) {
    console.error("Error with Runway Gen-3:", error);
    return NextResponse.json(
      { error: "Failed to generate video with Runway Gen-3" },
      { status: 500 }
    );
  }
}


async function generateWithGemini(prompt: string, inputImage: string | null, history: any) {
  try {
    // Convert history to the format expected by Gemini API
    const formattedHistory = [];
    
    // Add history items if available
    if (history && history.length > 0) {
      history.forEach((item: HistoryItem) => {
        if (item.parts && item.parts.length > 0) {
          const formattedItem = {
            role: item.role,
            parts: item.parts
              .map((part: HistoryPart) => {
                if (part.text) {
                  return { text: part.text };
                }
                if (part.image && item.role === "user") {
                  const imgParts = part.image.split(",");
                  if (imgParts.length > 1) {
                    return {
                      inlineData: {
                        data: imgParts[1],
                        mimeType: part.image.includes("image/png")
                          ? "image/png"
                          : "image/jpeg",
                      },
                    };
                  }
                }
                return null;
              })
              .filter(Boolean), // Remove null parts
          };
          
          if (formattedItem.parts.length > 0) {
            formattedHistory.push(formattedItem);
          }
        }
      });
    }

    // Prepare the current message parts
    const currentParts = [];

    // Add the text prompt
    currentParts.push({ text: prompt });

    // Add the image if provided
    if (inputImage) {
      // For image editing
      console.log("Processing image edit request");

      // Check if the image is a valid data URL
      if (!inputImage.startsWith("data:")) {
        throw new Error("Invalid image data URL format");
      }

      const imageParts = inputImage.split(",");
      if (imageParts.length < 2) {
        throw new Error("Invalid image data URL format");
      }

      const base64Image = imageParts[1];
      const mimeType = inputImage.includes("image/png")
        ? "image/png"
        : "image/jpeg";
      console.log(
        "Base64 image length:",
        base64Image.length,
        "MIME type:",
        mimeType
      );

      // Add the image to message parts
      currentParts.push({
        inlineData: {
          data: base64Image,
          mimeType: mimeType,
        },
      });
    }
    
    // Add the current message to the history
    formattedHistory.push({
      role: "user",
      parts: currentParts,
    });

    console.log("Sending request to Gemini with formatted history:", 
      JSON.stringify(formattedHistory, null, 2).substring(0, 200) + "...");

    // Generate the content
    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: formattedHistory,
      config: {
        temperature: 1,
        topP: 0.95,
        topK: 40,
        responseModalities: ["Text", "Image"],
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
        ],
      }        
    });
    
    console.log("Response received from Gemini API");
    
    let textResponse = null;
    let imageData = null;
    let mimeType = "image/png";
    let imageKitUrl = null;

    // Process the response - Add error handling for missing properties
    if (response && response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      
      // Check for safety issues
      if (candidate.finishReason === "IMAGE_SAFETY") {
        return NextResponse.json(
          { 
            error: "The image couldn't be processed due to safety concerns. Please try a different image or prompt.",
            details: "IMAGE_SAFETY"
          },
          { status: 400 }
        );
      }
      
      // Check if content and parts exist before accessing them
      if (candidate.content && candidate.content.parts) {
        const parts = candidate.content.parts;
        console.log("Number of parts in response:", parts.length);
      
        for (const part of parts) {
          if ("inlineData" in part && part.inlineData) {
            // Get the image data
            imageData = part.inlineData.data;
            mimeType = part.inlineData.mimeType || "image/png";
            console.log(
              "Image data received, length:",
              imageData?.length,
              "MIME type:",
              mimeType
            );
          } else if ("text" in part && part.text) {
            // Store the text
            textResponse = part.text;
            console.log(
              "Text response received:",
              textResponse.substring(0, 50) + "..."
            );
          }
        }
      } else {
        console.log("Response candidate doesn't have expected content structure:", candidate);
        return NextResponse.json(
          { 
            error: "The AI couldn't generate an image. Please try a different prompt.",
            details: "No content in response"
          },
          { status: 400 }
        );
      }
      
      if (imageData) {
        try {
          const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/upload-image`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              file: `data:${mimeType};base64,${imageData}`,
              fileName: `gemini-image-${Date.now()}.png`,
            }),
          });
      
          const uploadResult = await uploadResponse.json();
          imageKitUrl = uploadResult.url;
          console.log("Image uploaded to ImageKit:", imageKitUrl);
        } catch (uploadErr) {
          console.error("Failed to upload image to ImageKit:", uploadErr);
        }
      }
    } else {
      console.log("No valid candidates found in the API response:", response);
      return NextResponse.json(
        { 
          error: "The AI couldn't generate an image. Please try a different prompt.",
          details: "No valid candidates in response"
        },
        { status: 400 }
      );
    }    

    // Return just the base64 image and description as JSON
    return NextResponse.json({
      image: imageData ? `data:${mimeType};base64,${imageData}` : null,
      description: textResponse,
    });
  } catch (error) {
    console.error("Error in generateWithGemini:", error);
    throw error;
  }
}

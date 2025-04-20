// lib/uploadToImageKit.ts
export const uploadToImageKit = async (base64Image: string, prompt: string) => {
  const response = await fetch('/api/upload-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      file: base64Image,
      fileName: `gemini-${Date.now()}.png`,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Upload to ImageKit failed:", errorText);
    throw new Error(`Upload failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.url;
};

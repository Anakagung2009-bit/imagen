// app/api/upload-image/route.ts
import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

export async function POST(req: Request) {
  try {
    const { file, fileName } = await req.json(); // Mengambil file dan fileName dari body request

    const uploadResponse = await imagekit.upload({
      file, // base64 string
      fileName, // Nama file
    });

    return NextResponse.json({ url: uploadResponse.url }); // Mengirimkan URL hasil upload
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ error: "Failed to upload image", details: error.message }, { status: 500 });
  }
}

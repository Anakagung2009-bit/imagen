import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProviders } from "@/components/providers";
import { Navbar } from "@/components/Navbar";
import { GeneratedImageGallery } from "@/components/GeneratedImageGallery";
import { Footer } from "@/components/Footer";

const openSans = Poppins({
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-open-sans",
});

export const metadata: Metadata = {
  title: "Agung Imagen AI | AI Image Generator",
  description: "Create and edit images with AI",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        className={`${openSans.className} h-full antialiased bg-white dark:bg-slate-950`}
        suppressHydrationWarning
      >
        <ThemeProviders>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8">
              {children}
            </main>
            <Footer />
          </div>

        </ThemeProviders>
      </body>
    </html>
  );
}

import Link from "next/link";
import { Wand2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Wand2 className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Agung Imagen AI</span>
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              Transform your ideas into stunning visuals with advanced AI image generation platform.
            </p>
            <div className="flex space-x-4">
              <a href="//x.com/AgungDevelop" className="text-muted-foreground hover:text-primary">Twitter</a>
              <a href="//instagram.com/agung_anal2" className="text-muted-foreground hover:text-primary">Instagram</a>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="//about.agungdev.com" className="text-muted-foreground hover:text-primary">About</Link></li>
              <li><Link href="//blog.agungdev.com" className="text-muted-foreground hover:text-primary">Blog</Link></li>

            </ul>
          </div>
        </div>
        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Agung Dev. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="https://agungdev.com/privacy-policy" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, useScroll, useInView, useAnimation } from "framer-motion";
import { 
  Sparkles, 
  ImageIcon, 
  Wand2, 
  Zap, 
  Layers, 
  PenTool, 
  Check, 
  ArrowRight, 
  ChevronRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentUser } from "@/lib/authUtils";
import { useRef } from "react";

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const user = useCurrentUser();
  
  // Refs for Framer Motion animations
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);
  const ctaRef = useRef(null);
  const step1Ref = useRef(null);
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);
  
  // Check if elements are in view
  const heroInView = useInView(heroRef, { once: true, amount: 0.3 });
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.2 });
  const howItWorksInView = useInView(howItWorksRef, { once: true, amount: 0.2 });
  const ctaInView = useInView(ctaRef, { once: true, amount: 0.5 });
  const step1InView = useInView(step1Ref, { once: true, amount: 0.7 });
  const step2InView = useInView(step2Ref, { once: true, amount: 0.7 });
  const step3InView = useInView(step3Ref, { once: true, amount: 0.7 });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: <ImageIcon className="h-6 w-6" />,
      title: "AI Image Generation",
      description: "Create stunning images from text descriptions using advanced AI technology."
    },
    {
      icon: <Layers className="h-6 w-6" />,
      title: "Multiple Styles",
      description: "Generate images in various artistic styles from photorealistic to abstract."
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Fast Processing",
      description: "Get your AI-generated images in seconds with our optimized processing."
    }
  ];

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.22, 1, 0.36, 1] 
      }
    }
  };

  const fadeInScale = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.7, 
        ease: [0.22, 1, 0.36, 1] 
      }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: [0.22, 1, 0.36, 1] 
      }
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.7, 
        ease: [0.22, 1, 0.36, 1] 
      }
    }
  };

  return (
    <div className="min-h-screen to-muted/30 flex flex-col items-center">
      {/* Hero Section */}
      <motion.section 
        className="container mx-auto max-w-7xl px-4 sm:px-6 pt-20 pb-16 md:pt-32 md:pb-24 w-full" 
        ref={heroRef}
        initial="hidden"
        animate={heroInView ? "visible" : "hidden"}
        variants={fadeInUp}
      >
        <div className="flex flex-col items-center text-center">
          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
            variants={fadeInUp}
          >
            Create Amazing Images <br />
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              With AI Technology
            </span>
          </motion.h1>
          <motion.p 
            className="text-xl text-muted-foreground max-w-2xl mb-10"
            variants={fadeInUp}
          >
            Transform your ideas into stunning visuals with our advanced AI image generation platform.
            No design skills required.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4"
            variants={fadeInUp}
          >
            <Button size="lg" asChild className="hover:scale-105 transition-transform">
              <Link href={user ? "/image-generator" : "/signin"}>
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Preview Image */}
        <motion.div 
          className="mt-16 md:mt-24 relative"
          variants={fadeInScale}
          initial="hidden"
          animate={heroInView ? "visible" : "hidden"}
          transition={{ delay: 0.3 }}
        >
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-xl shadow-2xl border">
            <div className="bg-muted/30 p-2 border-b">
              <div className="flex space-x-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>
            </div>
            <img 
              src="/demo-image.jpg" 
              alt="AI Generated Image Example" 
              className="w-full h-auto"
              onError={(e) => {
                e.currentTarget.src = "https://assets.agungdev.com/Screenshot%202025-04-20%20141601.png";
              }}
            />
          </div>
          <motion.div 
            className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-background border shadow-lg rounded-lg p-4 flex items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <div className="bg-primary/10 p-2 rounded-full">
              <Wand2 className="h-5 w-5 text-primary" />
            </div>
            <span className="font-medium">Generated in just 10 seconds</span>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        id="features" 
        className="container py-20 md:py-32" 
        ref={featuresRef}
        initial="hidden"
        animate={featuresInView ? "visible" : "hidden"}
        variants={staggerContainer}
      >
        <motion.div className="text-center mb-16" variants={fadeInUp}>
          <Badge variant="outline" className="mb-4">Features</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Create Amazing Images</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our platform offers powerful tools to help you generate and edit images with ease.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={staggerContainer}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card"
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <Card className="h-full border-2 hover:border-primary/50 transition-all hover:shadow-lg duration-300">
                <CardHeader>
                  <motion.div 
                    className="p-3 rounded-full bg-primary/10 w-fit mb-4"
                    whileHover={{ 
                      scale: 1.1, 
                      backgroundColor: "rgba(var(--primary), 0.2)",
                      transition: { duration: 0.2 } 
                    }}
                  >
                    {feature.icon}
                  </motion.div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section 
        id="how-it-works" 
        className="container py-20 md:py-32 relative" 
        ref={howItWorksRef}
        initial="hidden"
        animate={howItWorksInView ? "visible" : "hidden"}
        variants={fadeInUp}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-3xl -z-10" />
        <motion.div className="text-center mb-16" variants={fadeInUp}>
          <Badge variant="outline" className="mb-4">How It Works</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Create Images in Three Simple Steps</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our intuitive platform makes it easy to generate stunning images in just a few clicks.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <motion.div 
            className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary/50 to-purple-500/50 -z-10"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={howItWorksInView ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            style={{ transformOrigin: "left" }}
          />
          
          <motion.div
            ref={step1Ref}
            className="flex flex-col items-center text-center"
            initial="hidden"
            animate={step1InView ? "visible" : "hidden"}
            variants={stepVariants}
          >
            <div className="relative mb-6">
              <motion.div 
                className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"
                whileHover={{ scale: 1.1, backgroundColor: "rgba(var(--primary), 0.2)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="text-2xl font-bold text-primary">1</span>
              </motion.div>
            </div>
            <h3 className="text-xl font-bold mb-2">Describe Your Idea</h3>
            <p className="text-muted-foreground">Enter a detailed description of the image you want to create.</p>
          </motion.div>

          <motion.div
            ref={step2Ref}
            className="flex flex-col items-center text-center"
            initial="hidden"
            animate={step2InView ? "visible" : "hidden"}
            variants={stepVariants}
            transition={{ delay: 0.2 }}
          >
            <div className="relative mb-6">
              <motion.div 
                className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"
                whileHover={{ scale: 1.1, backgroundColor: "rgba(var(--primary), 0.2)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="text-2xl font-bold text-primary">2</span>
              </motion.div>
            </div>
            <h3 className="text-xl font-bold mb-2">AI Generates Options</h3>
            <p className="text-muted-foreground">Our AI will process your description and generate multiple image options.</p>
          </motion.div>

          <motion.div
            ref={step3Ref}
            className="flex flex-col items-center text-center"
            initial="hidden"
            animate={step3InView ? "visible" : "hidden"}
            variants={stepVariants}
            transition={{ delay: 0.4 }}
          >
            <div className="relative mb-6">
              <motion.div 
                className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"
                whileHover={{ scale: 1.1, backgroundColor: "rgba(var(--primary), 0.2)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="text-2xl font-bold text-primary">3</span>
              </motion.div>
            </div>
            <h3 className="text-xl font-bold mb-2">Edit & Download</h3>
            <p className="text-muted-foreground">Fine-tune your favorite image and download the final result.</p>
          </motion.div>
        </div>

        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={howItWorksInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <Button size="lg" asChild className="hover:scale-105 transition-transform">
            <Link href={user ? "/image-generator" : "/signup"}>
              Try It Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="container py-20 md:py-32" 
        ref={ctaRef}
        initial="hidden"
        animate={ctaInView ? "visible" : "hidden"}
        variants={fadeInScale}
      >
        <motion.div 
          className="bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-3xl p-8 md:p-16 text-center hover:shadow-xl transition-shadow duration-500"
          whileHover={{ 
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            backgroundColor: "rgba(var(--primary), 0.15)"
          }}
        >
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            variants={fadeInUp}
          >
            Ready to Create Amazing Images?
          </motion.h2>
          <motion.p 
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
            variants={fadeInUp}
          >
            Join thousands of users who are already creating stunning visuals with Agung Imagen AI.
          </motion.p>
          <motion.div
            variants={fadeInUp}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 transition-all duration-300" 
              asChild
            >
              <Link href={user ? "/image-generator" : "/signup"}>
                Get Started Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </motion.section>
    </div>
  );
}
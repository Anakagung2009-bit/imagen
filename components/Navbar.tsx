"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Wand2, 
  LogIn, 
  User, 
  CreditCard, 
  LayoutDashboard, 
  LogOut,
  Menu,
  Bell,
  Settings,
  ChevronDown
} from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import { useCurrentUser , signOut } from "@/lib/authUtils"
import { db } from "@/lib/firebase"
import { getDoc, doc, onSnapshot } from "firebase/firestore"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

export function Navbar() {
  const [credits, setCredits] = useState<number | null>(null)
  const [prevCredits, setPrevCredits] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showCreditUpdate, setShowCreditUpdate] = useState(false)
  const user = useCurrentUser()
  const router = useRouter()

  // Use Firestore listener for real-time updates
  useEffect(() => {
    if (user?.uid) {
      setIsLoading(true)
      
      // Set up real-time listener to user document
      const unsubscribe = onSnapshot(
        doc(db, "users", user.uid),
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data()
            const newCredits = userData.credits ?? 0
            
            // Store previous credits to detect changes
            if (credits !== null && credits !== newCredits) {
              setPrevCredits(credits)
              setShowCreditUpdate(true)
              
              // Hide the update notification after 3 seconds
              setTimeout(() => {
                setShowCreditUpdate(false)
              }, 3000)
            }
            
            setCredits(newCredits)
          } else {
            setCredits(0)
          }
          setIsLoading(false)
        },
        (error) => {
          console.error("Error listening to user document:", error)
          setCredits(0)
          setIsLoading(false)
        }
      )
      
      // Clean up listener on unmount
      return () => unsubscribe()
    } else {
      setCredits(null)
      setPrevCredits(null)
    }
  }, [user])

  const handleSignOut = () => {
    signOut()
    window.location.href = "/"
  }

  // Mobile Navigation Content
  const MobileNavContent = () => (
    <div className="flex flex-col space-y-4 pt-6">
      <div className="px-2 py-4 mb-2 bg-muted/40 rounded-lg">
        {user ? (
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              <AvatarImage src={user.photoURL || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary/40 text-white">
                {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="font-medium text-sm">{user.displayName || user.email?.split('@')[0]}</p>
              <p className="text-xs text-muted-foreground truncate max-w-[180px]">{user.email}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-sm text-muted-foreground">Sign in to access all features</p>
          </div>
        )}
      </div>

      <Link href="/plans" className="w-full">
        <Button className="w-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 hover:from-amber-500 hover:via-yellow-600 hover:to-amber-700 text-black font-semibold shadow-md hover:shadow-lg transition-all duration-200">
          <CreditCard className="h-4 w-4 mr-2" />
          Get Premium
        </Button>
      </Link>

      {user ? (
        <>
          <div className="flex items-center justify-center py-2">
            <Badge variant="outline" className="font-semibold text-sm px-4 py-1.5 bg-primary/5 border-primary/20">
              <span className={cn("flex items-center gap-1.5", isLoading && "opacity-70")}>
                <span className={cn("h-2 w-2 rounded-full bg-primary", isLoading && "animate-pulse")}></span>
                {isLoading ? "Loading..." : `${credits} Credits`}
              </span>
            </Badge>
          </div>
          
          <Separator className="my-2" />
          
          <div className="space-y-1.5">
            <Link href="/" className="w-full">
              <Button variant="ghost" className="w-full justify-start">
                <Wand2 className="h-4 w-4 mr-2 text-primary" />
                Create Images
              </Button>
            </Link>
            <Link href="/dashboard" className="w-full">
              <Button variant="ghost" className="w-full justify-start">
                <LayoutDashboard className="h-4 w-4 mr-2 text-indigo-500" />
                Dashboard
              </Button>
            </Link>
            {/* <Link href="/settings" className="w-full">
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2 text-zinc-500" />
                Settings
              </Button>
            </Link> */}
          </div>
          
          <Separator className="my-2" />
          
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </>
      ) : (
        <Button 
          onClick={() => router.push("/signin")}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
        >
          <LogIn className="h-4 w-4 mr-2" />
          Sign In
        </Button>
      )}
      
      <SheetFooter className="mt-auto pt-4">
        <div className="flex justify-between w-full text-xs text-muted-foreground">
          <span>Agung Imagen AI</span>
          <ThemeToggle />
        </div>
      </SheetFooter>
    </div>
  )

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20">
              <Wand2 className="h-5 w-5 text-primary animate-pulse" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Agung Imagen AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/plans">
                    <Button 
                      className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 hover:from-amber-500 hover:via-yellow-600 hover:to-amber-700 text-black font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Get Premium
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Upgrade for more credits</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {user ? (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative">
                        <motion.div
                          animate={{ 
                            scale: showCreditUpdate ? [1, 1.1, 1] : 1,
                          }}
                          transition={{ duration: 0.5 }}
                        >
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "font-semibold text-sm px-4 py-1.5 bg-primary/5 border-primary/20",
                              showCreditUpdate && "border-green-400"
                            )}
                          >
                            <span className={cn("flex items-center gap-1.5", isLoading && "opacity-70")}>
                              <span className={cn(
                                "h-2 w-2 rounded-full", 
                                isLoading ? "bg-primary animate-pulse" : showCreditUpdate ? "bg-green-500" : "bg-primary"
                              )}></span>
                              <AnimatePresence mode="wait">
                                <motion.span
                                  key={credits?.toString()}
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 10 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  {isLoading ? "Loading..." : `${credits} Credits`}
                                </motion.span>
                              </AnimatePresence>
                            </span>
                          </Badge>
                        </motion.div>
                        
                        {/* Credit change notification */}
                        <AnimatePresence>
                          {showCreditUpdate && prevCredits !== null && credits !== null && (
                            <motion.div 
                              className={cn(
                                "absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-xs font-medium",
                                credits > prevCredits ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              )}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.3 }}
                            >
                              {credits > prevCredits ? (
                                <>+{credits - prevCredits} credits</>
                              ) : (
                                <>-{prevCredits - credits} credits</>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Your remaining credits</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 px-3 space-x-1.5 rounded-full border border-border/50 hover:bg-muted">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.photoURL || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary/40 text-white text-xs">
                          {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium hidden sm:inline-block">
                        {user.displayName?.split(' ')[0] || user.email?.split('@')[0] || "User"}
                      </span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user.displayName || "User"}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="flex items-center cursor-pointer">
                          <LayoutDashboard className="mr-2 h-4 w-4 text-indigo-500" />
                          Dashboard
                          <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
                        </Link>
                      </DropdownMenuItem>
                      {/* <DropdownMenuItem asChild>
                        <Link href="/settings" className="flex items-center cursor-pointer">
                          <Settings className="mr-2 h-4 w-4 text-zinc-500" />
                          Settings
                          <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                        </Link>
                      </DropdownMenuItem> */}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      className="text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                      <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button 
                onClick={() => router.push("/signin")}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
            
            <ThemeToggle />
          </div>

          {/* Mobile Navigation */}
          <div className="flex items-center md:hidden space-x-2">
            {user && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <motion.div
                        animate={{ 
                          scale: showCreditUpdate ? [1, 1.1, 1] : 1,
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "font-semibold text-xs px-2 py-1 bg-primary/5 border-primary/20",
                            showCreditUpdate && "border-green-400"
                          )}
                        >
                          <span className={cn("flex items-center gap-1", isLoading && "opacity-70")}>
                            <span className={cn(
                              "h-1.5 w-1.5 rounded-full", 
                              isLoading ? "bg-primary animate-pulse" : showCreditUpdate ? "bg-green-500" : "bg-primary"
                            )}></span>
                            <AnimatePresence mode="wait">
                              <motion.span
                                key={credits?.toString()}
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                transition={{ duration: 0.2 }}
                              >
                                {isLoading ? "..." : credits}
                              </motion.span>
                            </AnimatePresence>
                          </span>
                        </Badge>
                      </motion.div>
                      
                      {/* Mobile credit change notification */}
                      <AnimatePresence>
                        {showCreditUpdate && prevCredits !== null && credits !== null && (
                          <motion.div 
                            className={cn(
                              "absolute -top-6 left-1/2 transform -translate-x-1/2 px-1.5 py-0.5 rounded text-xs font-medium",
                              credits > prevCredits ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            )}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.3 }}
                          >
                            {credits > prevCredits ? (
                              <>+{credits - prevCredits}</>
                            ) : (
                              <>-{prevCredits - credits}</>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Your remaining credits</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            <ThemeToggle />
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[380px] p-6">
                <SheetHeader className="text-left">
                  <SheetTitle className="flex items-center space-x-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20">
                      <Wand2 className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-bold">Agung Imagen AI</span>
                  </SheetTitle>
                </SheetHeader>
                <MobileNavContent />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
"use client"

import { Sparkles } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export function AnimatedSparkles({ className }: { className?: string }) {
  const [isAnimating, setIsAnimating] = useState(false)

  // Set up a timer to trigger the animation periodically
  useEffect(() => {
    // Initial animation after a short delay
    const initialTimer = setTimeout(() => {
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 1000)
    }, 1000)

    // Set up interval for periodic animation
    const intervalId = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 1000)
    }, 5000) // Twinkle every 5 seconds

    return () => {
      clearTimeout(initialTimer)
      clearInterval(intervalId)
    }
  }, [])

  return (
    <Sparkles
      className={cn("transition-all duration-700", isAnimating ? "text-yellow-400 scale-110" : "", className)}
    />
  )
}

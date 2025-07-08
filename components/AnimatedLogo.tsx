"use client"

import { useEffect, useState } from "react"

export const AnimatedLogo = () => {
  const [isAnimating, setIsAnimating] = useState(true)

  useEffect(() => {
    // Auto-start animation on load (immediately)
    setIsAnimating(true)
    const timer = setTimeout(() => {
      setIsAnimating(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className="flex items-end h-16 space-x-1 cursor-pointer"
      onMouseEnter={() => setIsAnimating(true)}
      onMouseLeave={() => setIsAnimating(false)}
    >
      {/* Four bars with different heights */}
      <div
        className={`w-4 h-12 bg-black rounded-sm transition-all duration-500 ${
          isAnimating ? "transform -translate-y-2" : ""
        }`}
        style={{ transitionDelay: "0ms" }}
      ></div>
      <div
        className={`w-4 h-16 bg-[#00c02a] rounded-sm transition-all duration-500 ${
          isAnimating ? "transform -translate-y-3" : ""
        }`}
        style={{ transitionDelay: "150ms" }}
      ></div>
      <div
        className={`w-4 h-10 bg-black rounded-sm transition-all duration-500 ${
          isAnimating ? "transform -translate-y-4" : ""
        }`}
        style={{ transitionDelay: "300ms" }}
      ></div>
      <div
        className={`w-4 h-8 bg-black rounded-sm transition-all duration-500 ${
          isAnimating ? "transform -translate-y-2" : ""
        }`}
        style={{ transitionDelay: "450ms" }}
      ></div>
    </div>
  )
}

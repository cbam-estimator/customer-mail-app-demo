export const CircularLogo = () => {
  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      {/* Rotating circular frame */}
      <div className="absolute w-full h-full animate-spin-slow">
        <div
          className="absolute inset-0 rounded-full border-2 border-[#00c02a] opacity-70"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 85%, 0 85%)" }}
        ></div>
      </div>

      {/* Static logo */}
      <div className="flex items-end space-x-1 scale-75 z-10">
        <div className="w-4 h-12 bg-black rounded-sm"></div>
        <div className="w-4 h-16 bg-[#00c02a] rounded-sm"></div>
        <div className="w-4 h-10 bg-black rounded-sm"></div>
        <div className="w-4 h-8 bg-black rounded-sm"></div>
      </div>
    </div>
  )
}

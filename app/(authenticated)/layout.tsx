"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/toaster"
import { CompanyProvider, useCompany } from "@/context/company-context"
import { CompanyDialog } from "@/components/CompanyDialog"
import { Sidebar } from "@/components/Sidebar"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, Loader2 } from "lucide-react"

function ProfileIcon() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { company } = useCompany()
  const router = useRouter()

  const getInitials = () => {
    if (!company.name) return "CO"
    const words = company.name.split(" ")
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase()
    }
    return company.name.substring(0, 2).toUpperCase()
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  return (
    <>
      <div className="relative">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 rounded-full bg-primary text-primary-foreground">
              {getInitials()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
              <User className="mr-2 h-4 w-4" />
              <span>Company Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <CompanyDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </>
  )
}

function AuthenticatedLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<{ email: string; isAdmin: boolean } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { company, updateCompany } = useCompany()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    } else {
      router.push("/")
    }
  }, [router])

  // Set default company to Example Corp on initial load
  useEffect(() => {
    // Only set the default company once when the component mounts
    if (!isInitialized) {
      updateCompany({ name: "Example Corp" })
      setIsInitialized(true)
    }
  }, [updateCompany, isInitialized])

  if (!user) return null

  const handleCompanyChange = (companyName: string) => {
    // Set loading state
    setIsLoading(true)

    // Update company in context
    updateCompany({ name: companyName })

    // Simulate loading and hide loader after 1.5 seconds
    setTimeout(() => {
      setIsLoading(false)
    }, 1500) // 1.5 second delay for visual feedback
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-white shadow fixed top-0 left-0 right-0 z-10">
        <div className="w-full py-4 px-12 flex justify-between items-center">
          <div className="flex items-center">
            <Image
              src="https://www.cbam-estimator.com/wp-content/uploads/2024/12/logo_new_black_new.png"
              alt="CBAM Estimator Logo"
              width={200}
              height={50}
              priority
            />
          </div>
          <div className="flex items-center justify-end space-x-6">
            <ProfileIcon />
            <div className="flex flex-col items-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-9 px-3 py-2 font-medium text-right flex items-center gap-2 border-gray-200 shadow-sm w-56"
                    disabled={isLoading}
                  >
                    <div className="flex items-center w-full justify-between">
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span>Loading...</span>
                        </>
                      ) : (
                        <>
                          <span>{company.name || "Example Corp"}</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        </>
                      )}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => handleCompanyChange("Example Corp")} className="cursor-pointer">
                    Example Corp
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleCompanyChange("Company One")} className="cursor-pointer">
                    Company One
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCompanyChange("Company Two")} className="cursor-pointer">
                    Company Two
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCompanyChange("Company Three")} className="cursor-pointer">
                    Company Three
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {user.isAdmin && (
              <div className="flex items-center px-4 py-1 bg-green-50 rounded-full border border-gray-200 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                <span className="text-green-600 font-medium">Admin</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <Sidebar />

      <main className="pt-20 pl-64">
        <div className="max-w-[100rem] mx-auto py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
      <Toaster />
    </div>
  )
}

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CompanyProvider>
      <AuthenticatedLayoutContent>{children}</AuthenticatedLayoutContent>
    </CompanyProvider>
  )
}

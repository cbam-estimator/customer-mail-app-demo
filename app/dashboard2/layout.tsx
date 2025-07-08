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

function ProfileIcon() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { company } = useCompany()

  const getInitials = () => {
    if (!company.name) return "AB"
    const words = company.name.split(" ")
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase()
    }
    return company.name.substring(0, 2).toUpperCase()
  }

  return (
    <>
      <Button
        variant="ghost"
        className="h-8 w-8 rounded-full bg-primary text-primary-foreground"
        onClick={() => setIsDialogOpen(true)}
      >
        {getInitials()}
      </Button>
      <CompanyDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </>
  )
}

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<{ email: string; isAdmin: boolean } | null>(null)
  const router = useRouter()
  const { company } = useCompany()

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    } else {
      router.push("/")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  if (!user) return null

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-white shadow fixed top-0 left-0 right-0 z-10">
        <div className="max-w-[100rem] mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <Image
              src="https://www.cbam-estimator.com/wp-content/uploads/2024/12/logo_new_black_new.png"
              alt="CBAM Estimator Logo"
              width={200}
              height={50}
              priority
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-end">
              <span className="font-semibold">{company.name || "Company Name"}</span>
              <span className="text-sm text-gray-500">{user.email}</span>
            </div>
            {user.isAdmin && <span className="mr-4 text-green-500">Admin</span>}
            <ProfileIcon />
            <Button onClick={handleLogout}>Log out</Button>
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CompanyProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </CompanyProvider>
  )
}

"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { BarChart2, FileText, Users, Mail, LayoutDashboard, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    // Clear any authentication tokens from localStorage
    localStorage.removeItem("authToken")
    localStorage.removeItem("user")

    // Clear any cookies if needed
    document.cookie.split(";").forEach((cookie) => {
      const eqPos = cookie.indexOf("=")
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
    })

    // Redirect to the login page
    router.push("/")
  }

  const menuItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Suppliers",
      href: "/dashboard-new",
      icon: Users,
    },
    {
      name: "Insights",
      href: "/insights",
      icon: BarChart2,
      subMenu: [
        {
          name: "Imports & Emissions",
          href: "/insights/imports-emissions",
        },
        {
          name: "Financial Forecast",
          href: "/insights/financial-forecast",
        },
      ],
    },
    {
      name: "CBAM Report",
      href: "/cbam-report",
      icon: FileText,
    },
    {
      name: "Contact Us",
      href: "/contact",
      icon: Mail,
    },
  ]

  const [expandedMenu, setExpandedMenu] = useState<string | null>(null)

  return (
    <div className="fixed left-0 top-0 bottom-0 w-64 bg-gray-900 text-white pt-20 z-0 flex flex-col">
      <div className="flex flex-col space-y-2 px-3 mt-6 flex-grow">
        {menuItems.map((item) => {
          // Skip rendering only the CBAM Report tab
          if (item.name === "CBAM Report") return null

          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const hasSubMenu = item.subMenu && item.subMenu.length > 0
          const isExpanded = item.name === "Insights" ? true : expandedMenu === item.name || isActive

          return (
            <div key={item.name} className="flex flex-col">
              <Link
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-3 rounded-md transition-colors",
                  isActive ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800",
                )}
                onClick={(e) => {
                  if (hasSubMenu) {
                    e.preventDefault()
                    if (item.name !== "Insights") {
                      setExpandedMenu(expandedMenu === item.name ? null : item.name)
                    }
                  }
                }}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
                {/* Remove chevron for Insights tab */}
                {hasSubMenu && item.name !== "Insights" && (
                  <svg
                    className={`ml-auto h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </Link>

              {/* Sub-menu items */}
              {hasSubMenu && isExpanded && (
                <div className="ml-6 mt-2 space-y-3 relative">
                  {item.subMenu.map((subItem, index) => {
                    const isSubActive = pathname === subItem.href || pathname.startsWith(`${subItem.href}/`)
                    return (
                      <div key={subItem.name} className="relative py-1">
                        {/* Segmented vertical line for each item - shorter version */}
                        <div
                          className={cn(
                            "absolute left-3 top-1 bottom-1 w-0.5",
                            isSubActive ? "bg-teal-500" : "bg-gray-700",
                          )}
                        />
                        <Link
                          href={subItem.href}
                          className={cn(
                            "flex items-center space-x-4 pl-6 py-1.5 transition-colors",
                            isSubActive ? "text-white" : "text-gray-400 hover:text-white",
                          )}
                        >
                          <span>{subItem.name}</span>
                        </Link>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="mt-auto border-t border-gray-700 pt-4 pb-4 px-3">
        <button
          className="flex items-center space-x-3 px-3 py-3 rounded-md transition-colors w-full text-gray-400 hover:text-white hover:bg-gray-800"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

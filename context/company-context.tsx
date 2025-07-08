"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { type CompanyInfo, DEFAULT_COMPANY } from "@/types/company"

type CompanyContextType = {
  company: CompanyInfo
  updateCompany: (info: Partial<CompanyInfo>) => void
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [company, setCompany] = useState<CompanyInfo>(DEFAULT_COMPANY)

  useEffect(() => {
    const stored = localStorage.getItem("company")
    if (stored) {
      setCompany(JSON.parse(stored))
    }
  }, [])

  const updateCompany = (info: Partial<CompanyInfo>) => {
    setCompany((prev) => {
      const updated = { ...prev, ...info }
      localStorage.setItem("company", JSON.stringify(updated))
      return updated
    })
  }

  return <CompanyContext.Provider value={{ company, updateCompany }}>{children}</CompanyContext.Provider>
}

export function useCompany() {
  const context = useContext(CompanyContext)
  if (context === undefined) {
    throw new Error("useCompany must be used within a CompanyProvider")
  }
  return context
}

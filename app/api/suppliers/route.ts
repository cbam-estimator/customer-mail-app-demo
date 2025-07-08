import { NextResponse } from "next/server"
import { SupplierStatus } from "@/types/supplier"

// Mock data to use as fallback
const MOCK_SUPPLIERS = [
  {
    id: 1,
    name: "Acme Steel Corporation",
    country: "Germany",
    status: SupplierStatus.EmissionDataReceived,
    rawStatus: "emission_data_received",
    lastUpdate: new Date().toISOString(),
    seeDirect: 120,
    seeIndirect: 80,
    seeTotal: 200,
    emissionFactor: 0.85,
    electricityEmissions: 45,
    address: {
      country: "Germany",
      street: "Industriestraße",
      streetNumber: "42",
      additionalLine: "Building B",
      postcode: "10115",
      city: "Berlin",
    },
    contactPerson: {
      name: "Hans Schmidt",
      email: "h.schmidt@acmesteel.de",
      phone: "+49 30 12345678",
    },
    cnCodes: ["7208", "7209"],
    remarks: "Regular supplier since 2020",
    files: [],
    consultationHours: 3,
  },
  {
    id: 2,
    name: "Global Metal Industries",
    country: "France",
    status: SupplierStatus.SupportingDocumentsReceived,
    rawStatus: "supporting_docs",
    lastUpdate: new Date().toISOString(),
    seeDirect: 95,
    seeIndirect: 65,
    seeTotal: 160,
    emissionFactor: 0.72,
    electricityEmissions: 38,
    address: {
      country: "France",
      street: "Rue de l'Industrie",
      streetNumber: "15",
      additionalLine: "",
      postcode: "75011",
      city: "Paris",
    },
    contactPerson: {
      name: "Marie Dubois",
      email: "m.dubois@globalmetal.fr",
      phone: "+33 1 23456789",
    },
    cnCodes: ["7210", "7211"],
    remarks: "New supplier, first delivery in Q1 2023",
    files: [],
    consultationHours: 2,
  },
  {
    id: 3,
    name: "EcoTech Solutions",
    country: "Spain",
    status: SupplierStatus.Contacted,
    rawStatus: "contacted",
    lastUpdate: new Date().toISOString(),
    seeDirect: 0,
    seeIndirect: 0,
    seeTotal: 0,
    emissionFactor: 0,
    electricityEmissions: 0,
    address: {
      country: "Spain",
      street: "Calle Industrial",
      streetNumber: "28",
      additionalLine: "Floor 3",
      postcode: "28001",
      city: "Madrid",
    },
    contactPerson: {
      name: "Carlos Rodriguez",
      email: "c.rodriguez@ecotech.es",
      phone: "+34 91 1234567",
    },
    cnCodes: ["7212"],
    remarks: "Specializes in low-carbon production methods",
    files: [],
    consultationHours: 0,
  },
]

export async function GET() {
  try {
    console.log("API: Returning mock supplier data")

    // Return mock data directly without attempting database access
    return NextResponse.json({
      success: true,
      data: MOCK_SUPPLIERS,
      source: "mock",
    })
  } catch (error) {
    console.error("API Error in suppliers route:", error)

    // Even if there's an error in the try block, return mock data
    return NextResponse.json({
      success: true,
      data: MOCK_SUPPLIERS,
      source: "mock (fallback)",
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"
import * as schema from "./schema"

// Check if database environment variables are available
const isDatabaseConfigured = process.env.MAIL_APP_DATABASE_URL && process.env.MAIL_APP_DATABASE_AUTH_TOKEN

// Create a mock client if database is not configured
const createMockClient = () => {
  console.warn("Database environment variables not found. Using mock database client.")
  return {
    execute: async () => ({ rows: [] }),
    batch: async () => [],
    sync: async () => {},
  }
}

// Create a database client using environment variables or mock client
const client = 
//isDatabaseConfigured
// ? 
  createClient({
      url: process.env.MAIL_APP_DATABASE_URL || "libsql://customer-mail-app-cbam-estimator.turso.io",
      authToken: process.env.MAIL_APP_DATABASE_AUTH_TOKEN || "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTE4MDA4NDUsImlkIjoiZWExMWM2ZjYtMjZkYS00OGRlLTlkNmUtNTJjYWEzMjhiOWQwIn0.UyQHZuV1VS4xuiU6b9UKn9iDQtAECuqVfnI5RLa8JSwXDd8bRJoNdBoYTgVwjIHOKAM2Zr3L8jkudW5Jn4kyDA",
    });
 // : (createMockClient() as any)

// Export the drizzle instance with the schema
export const db = drizzle(client, { schema })

// Simple function to test the database connection
export async function testDatabaseConnection() {
  if (!isDatabaseConfigured) {
    return {
      success: false,
      message:
        "Database not configured. Please set MAIL_APP_DATABASE_URL and MAIL_APP_DATABASE_AUTH_TOKEN environment variables.",
      data: null,
    }
  }

  try {
    // Try to query the cn_codes table
    const result = await db.query.cnCodes.findMany({
      limit: 5,
    })

    return {
      success: true,
      message: `Connection successful! Found ${result.length} CN codes.`,
      data: result,
    }
  } catch (error) {
    console.error("Database connection test failed:", error)
    return {
      success: false,
      message: `Connection failed: ${error instanceof Error ? error.message : String(error)}`,
      data: null,
    }
  }
}

// Fetch suppliers with fallback to mock data if database is not configured
export async function fetchSuppliers() {
  if (!isDatabaseConfigured) {
    // Return mock data
    return {
      success: true,
      message: "Using mock supplier data (database not configured).",
      data: getMockSuppliers(),
    }
  }

  try {
    // Query the suppliers table
    const result = await db.query.suppliers.findMany({
      limit: 20,
    })

    return {
      success: true,
      message: `Successfully fetched ${result.length} suppliers.`,
      data: result,
    }
  } catch (error) {
    console.error("Failed to fetch suppliers:", error)
    return {
      success: false,
      message: `Failed to fetch suppliers: ${error instanceof Error ? error.message : String(error)}`,
      data: getMockSuppliers(), // Fallback to mock data on error
    }
  }
}

// Fetch CN codes with fallback
export async function fetchCnCodes() {
  if (!isDatabaseConfigured) {
    return {
      success: true,
      message: "Using mock CN code data (database not configured).",
      data: getMockCnCodes(),
    }
  }

  try {
    const result = await db.query.cnCodes.findMany({
      limit: 20,
    })

    return {
      success: true,
      message: `Successfully fetched ${result.length} CN codes.`,
      data: result,
    }
  } catch (error) {
    console.error("Failed to fetch CN codes:", error)
    return {
      success: false,
      message: `Failed to fetch CN codes: ${error instanceof Error ? error.message : String(error)}`,
      data: getMockCnCodes(), // Fallback to mock data
    }
  }
}

// Fetch persons with fallback
export async function fetchPersons() {
  if (!isDatabaseConfigured) {
    return {
      success: true,
      message: "Using mock person data (database not configured).",
      data: getMockPersons(),
    }
  }

  try {
    const result = await db.query.persons.findMany({
      limit: 20,
    })

    return {
      success: true,
      message: `Successfully fetched ${result.length} persons.`,
      data: result,
    }
  } catch (error) {
    console.error("Failed to fetch persons:", error)
    return {
      success: false,
      message: `Failed to fetch persons: ${error instanceof Error ? error.message : String(error)}`,
      data: getMockPersons(), // Fallback to mock data
    }
  }
}

// Fetch supplier CN code mappings with fallback
export async function fetchSupplierCnCodeMappings() {
  if (!isDatabaseConfigured) {
    return {
      success: true,
      message: "Using mock supplier-CN code mapping data (database not configured).",
      data: getMockSupplierCnCodeMappings(),
    }
  }

  try {
    const result = await db.query.supplierCnCodeMappings.findMany({
      limit: 20,
    })

    return {
      success: true,
      message: `Successfully fetched ${result.length} supplier-CN code mappings.`,
      data: result,
    }
  } catch (error) {
    console.error("Failed to fetch supplier-CN code mappings:", error)
    return {
      success: false,
      message: `Failed to fetch supplier-CN code mappings: ${error instanceof Error ? error.message : String(error)}`,
      data: getMockSupplierCnCodeMappings(), // Fallback to mock data
    }
  }
}

// Fetch goods with fallback
export async function fetchGoods() {
  if (!isDatabaseConfigured) {
    return {
      success: true,
      message: "Using mock goods data (database not configured).",
      data: getMockGoods(),
    }
  }

  try {
    const result = await db.query.goods.findMany({
      limit: 20,
    })

    return {
      success: true,
      message: `Successfully fetched ${result.length} goods.`,
      data: result,
    }
  } catch (error) {
    console.error("Failed to fetch goods:", error)
    return {
      success: false,
      message: `Failed to fetch goods: ${error instanceof Error ? error.message : String(error)}`,
      data: getMockGoods(), // Fallback to mock data
    }
  }
}

// Mock data functions
function getMockSuppliers() {
  return [
    { id: 1, name: "Steel Corp China", country: "CN", status: "active" },
    { id: 2, name: "Aluminum Turkey Ltd", country: "TR", status: "active" },
    { id: 3, name: "Cement Industries", country: "IN", status: "pending" },
    { id: 4, name: "Global Fertilizers", country: "BR", status: "active" },
    { id: 5, name: "Chemical Solutions", country: "US", status: "inactive" },
  ]
}

function getMockCnCodes() {
  return [
    { id: 1, code: "7208", description: "Flat-rolled products of iron or non-alloy steel" },
    { id: 2, code: "7601", description: "Unwrought aluminium" },
    { id: 3, code: "2523", description: "Portland cement, aluminous cement" },
    { id: 4, code: "3102", description: "Mineral or chemical fertilisers, nitrogenous" },
    { id: 5, code: "2804", description: "Hydrogen, rare gases and other non-metals" },
  ]
}

function getMockPersons() {
  return [
    { id: 1, name: "John Smith", email: "john@example.com", role: "manager" },
    { id: 2, name: "Maria Garcia", email: "maria@example.com", role: "contact" },
    { id: 3, name: "Li Wei", email: "li@example.com", role: "manager" },
    { id: 4, name: "Ahmed Hassan", email: "ahmed@example.com", role: "contact" },
    { id: 5, name: "Anna Kowalski", email: "anna@example.com", role: "manager" },
  ]
}

function getMockSupplierCnCodeMappings() {
  return [
    { id: 1, supplierId: 1, cnCodeId: 1 },
    { id: 2, supplierId: 2, cnCodeId: 2 },
    { id: 3, supplierId: 3, cnCodeId: 3 },
    { id: 4, supplierId: 4, cnCodeId: 4 },
    { id: 5, supplierId: 5, cnCodeId: 5 },
  ]
}

function getMockGoods() {
  return [
    {
      id: 1,
      supplierId: 1,
      cnCodeId: 1,
      quantity: 5000,
      unit: "kg",
      seeDirect: 1.2,
      seeIndirect: 0.3,
      importDate: new Date().toISOString(),
    },
    {
      id: 2,
      supplierId: 2,
      cnCodeId: 2,
      quantity: 3000,
      unit: "kg",
      seeDirect: 0.9,
      seeIndirect: 0.2,
      importDate: new Date().toISOString(),
    },
    {
      id: 3,
      supplierId: 3,
      cnCodeId: 3,
      quantity: 10000,
      unit: "kg",
      seeDirect: 2.1,
      seeIndirect: 0.5,
      importDate: new Date().toISOString(),
    },
    {
      id: 4,
      supplierId: 4,
      cnCodeId: 4,
      quantity: 2000,
      unit: "kg",
      seeDirect: 1.5,
      seeIndirect: 0.4,
      importDate: new Date().toISOString(),
    },
    {
      id: 5,
      supplierId: 5,
      cnCodeId: 5,
      quantity: 8000,
      unit: "kg",
      seeDirect: 1.8,
      seeIndirect: 0.6,
      importDate: new Date().toISOString(),
    },
  ]
}

"use server"

import { db } from "@/lib/db/config"
import {
  suppliers as suppliersTable,
  goods as goodsTable,
  cnCodes as cnCodesTable,
  persons as personsTable,
  suppliers,
  cnCodes,
} from "@/lib/db/schema"
import { SupplierStatus } from "@/types/supplier"
import { InferModel } from "drizzle-orm";

type Person = {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null ; // if not marked .notNull()
};

export type Supplier = InferModel<typeof suppliers>;
export type CnCode = InferModel<typeof cnCodes>;
// Helper function to convert Unix timestamp to Date object
const unixTimestampToDate = (timestamp: number | null | undefined): Date | null => {
  if (timestamp === null || timestamp === undefined) return null
  // Check if the timestamp is in seconds (Unix timestamp) or milliseconds (JS timestamp)
  return new Date(timestamp * (timestamp > 10000000000 ? 1 : 1000))
}

export async function fetchSuppliers() {
  try {
    // Fetch suppliers from the database
    const dbSuppliers = await db.select().from(suppliersTable)

    // Defensive check - if no suppliers are returned, return an empty array
    if (!dbSuppliers || !Array.isArray(dbSuppliers)) {
      console.log("No suppliers found or invalid response format")
      return { success: true, data: [] }
    }

    // Fetch all persons for contact information - with error handling
    //let persons = Person[]
    let persons: Person[] = [];
    try {
      persons = await db.select().from(personsTable)
      if (!Array.isArray(persons)) persons = []
    } catch (personErr) {
      console.error("Error fetching persons:", personErr)
      persons = [] // Continue with empty persons array
    }

    // Transform database suppliers to match the frontend model
    const transformedSuppliers = dbSuppliers
      .map((supplier) => {
        // Skip null or undefined suppliers
        if (!supplier) return null

        // Find contact person - with null checks
        const contactPerson = persons.find((p) => p && p.id === supplier.contact_person_id) || null

        // Map status from database to enum using exact matching
        let status = SupplierStatus.None
        if (supplier.emission_data_status) {
          switch (supplier.emission_data_status) {
            case "emission_data_received":
              status = SupplierStatus.EmissionDataReceived
              break
            case "supporting_docs":
              status = SupplierStatus.SupportingDocumentsReceived
              break
            case "contact_failed":
              status = SupplierStatus.ContactFailed
              break
            case "pending_info":
              status = SupplierStatus.Pending
              break
            case "contacted":
              status = SupplierStatus.Contacted
              break
            case "consultation_requested":
              status = SupplierStatus.ConsultationRequested
              break
            default:
              // Log unexpected status values for debugging
              console.log(`Unrecognized status: ${supplier.emission_data_status}`)
              status = SupplierStatus.None
          }
        }

        // Safely convert timestamps with error handling
        let lastUpdateIso = ""
        let validUntilIso = undefined

        try {
          // Convert Unix timestamp to Date object for lastUpdate
          if (supplier.last_update) {
            const lastUpdateDate = unixTimestampToDate(Number(supplier.last_update))
            lastUpdateIso = lastUpdateDate ? lastUpdateDate.toISOString() : ""
          }
        } catch (dateErr) {
          console.error("Error parsing last_update date:", dateErr)
        }

        try {
          // Convert Unix timestamp to Date object for validUntil
          if (supplier.emission_data_valid_until) {
            const validUntilDate = unixTimestampToDate(Number(supplier.emission_data_valid_until))
            validUntilIso = validUntilDate ? validUntilDate.toISOString() : undefined
          }
        } catch (dateErr) {
          console.error("Error parsing emission_data_valid_until date:", dateErr)
        }

        return {
          id: supplier.id,
          name: supplier.name || "Unnamed Supplier",
          country: supplier.country || "Unknown",
          address: {
            country: supplier.country || "Unknown",
            street: supplier.street || "",
            streetNumber: supplier.street_num || "",
            additionalLine: supplier.addr_additional_line || "",
            postcode: supplier.post_code || "",
            city: supplier.city || "",
          },
          contactPerson: {
            name: contactPerson?.name || "",
            email: contactPerson?.email || supplier.company_mail || "",
            phone: contactPerson?.phone || "",
          },
          cnCodes: [], // Will be populated later
          remarks: supplier.remarks || "",
          status: status,
          rawStatus: supplier.emission_data_status || "none", // Add the raw status
          lastUpdate: lastUpdateIso || "", // Use empty string instead of current date
          validUntil: validUntilIso,
          files: [], // Files are not in the database schema yet
          consultationHours: supplier.consulting_hours || 0,
          // Add these fields to match the expected Supplier type
          seeDirect: 0,
          seeIndirect: 0,
          seeTotal: 0,
          emissionFactor: 0,
          electricityEmissions: 0,
        }
      })
      .filter(Boolean) // Remove any null entries

    return { success: true, data: transformedSuppliers }
  } catch (error) {
    console.error("Error fetching suppliers:", error)
    // Return a properly formatted error response
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      data: [], // Always include data property, even if empty
    }
  }
}

export async function fetchGoods() {
  try {
    // Fetch goods from the database
    const dbGoods = await db.select().from(goodsTable)

    // Defensive check - if no goods are returned, return an empty array
    if (!dbGoods || !Array.isArray(dbGoods)) {
      console.log("No goods found or invalid response format")
      return { success: true, data: [] }
    }

   
    // Fetch suppliers for relation - with error handling
    let dbSuppliers: Supplier[] =[];
    try {
      dbSuppliers = await db.select().from(suppliersTable)
      if (!Array.isArray(dbSuppliers)) dbSuppliers = []
    } catch (supplierErr) {
      console.error("Error fetching suppliers for goods relation:", supplierErr)
      dbSuppliers = [] // Continue with empty suppliers array
    }

    let dbCnCodes: CnCode[] =[];
    // Fetch CN codes for relation - with error handling
    
    try {
      dbCnCodes = await db.select().from(cnCodesTable)
      if (!Array.isArray(dbCnCodes)) dbCnCodes = []
    } catch (cnCodeErr) {
      console.error("Error fetching CN codes for goods relation:", cnCodeErr)
      dbCnCodes = [] // Continue with empty CN codes array
    }

    // Transform database goods to match the frontend model
    const transformedGoods = dbGoods
      .map((good) => {
        // Skip null or undefined goods
        if (!good) return null

        // Find related supplier - with null checks
        const supplier = dbSuppliers.find((s) => s && s.id === good.supplier_id)

        // Find related CN code - with null checks
        const cnCode = dbCnCodes.find((c) => c && c.id === good.cn_code_id)

        // Safely convert date with error handling
        let goodDate = null
        let quarter = "Unknown"

        try {
          // Convert Unix timestamp to Date object
          if (good.date) {
            goodDate = unixTimestampToDate(Number(good.date))

            // Generate a quarter string from the date
            if (goodDate) {
              const quarterNum = Math.floor(goodDate.getMonth() / 3) + 1
              const year = goodDate.getFullYear()
              quarter = `Q${quarterNum}-${year}`
            }
          }
        } catch (dateErr) {
          console.error("Error parsing goods date:", dateErr)
        }

        return {
          remarks: good.remarks || "",
          cnCode: cnCode?.code || "Unknown",
          manufacturer: supplier?.name || "Unknown Supplier",
          quantity: good.quantity || 0,
          unit: "Kg", // Default unit if not specified
          productionMethod: good.production_method_code
            ? `${good.production_method_code}${good.production_method_desc ? ` - ${good.production_method_desc}` : ""}`
            : "",
          customsProcedure: good.customer_proc_code
            ? `${good.customer_proc_code}${good.customer_proc_desc ? ` - ${good.customer_proc_desc}` : ""}`
            : "",
          date: goodDate,
          quarter: quarter,
          seeDirect: good.see_direct !== null ? good.see_direct : 0,
          seeIndirect: good.see_indirect !== null ? good.see_indirect : 0,
        }
      })
      .filter(Boolean) // Remove any null entries

    return { success: true, data: transformedGoods }
  } catch (error) {
    console.error("Error fetching goods:", error)
    // Return a properly formatted error response
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      data: [], // Always include data property, even if empty
    }
  }
}

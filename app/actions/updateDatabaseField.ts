"use server"

import { db } from "@/lib/db/config"
import { eq } from "drizzle-orm"
import * as schema from "@/lib/db/schema"

type UpdateFieldParams = {
  tableName: string
  recordId: number
  fieldName: string
  fieldValue: any
}

export async function updateDatabaseField({ tableName, recordId, fieldName, fieldValue }: UpdateFieldParams) {
  try {
    // Validate inputs
    if (!tableName || !recordId || !fieldName) {
      return {
        success: false,
        message: "Missing required parameters for database update",
      }
    }

    // Get the appropriate table schema
    let table
    switch (tableName) {
      case "suppliers":
        table = schema.suppliers
        break
      case "cn_codes":
        table = schema.cnCodes
        break
      case "persons":
        table = schema.persons
        break
      case "supplier_cn_code_mappings":
        table = schema.supplierCnCodeMappings
        break
      case "goods":
        table = schema.goods
        break
      default:
        return {
          success: false,
          message: `Unknown table: ${tableName}`,
        }
    }

    // Create update object with the field to update
    const updateData: Record<string, any> = {}
    updateData[fieldName] = fieldValue

    console.log(`Attempting to update ${tableName}.${fieldName} for record ${recordId} with value:`, fieldValue)

    // Execute the update
    const result = await db.update(table).set(updateData).where(eq(table.id, recordId)).returning({ id: table.id })

    if (!result || result.length === 0) {
      return {
        success: false,
        message: `Failed to update ${fieldName} in ${tableName}. Record with ID ${recordId} not found.`,
      }
    }

    // Return a simple, serializable response
    return {
      success: true,
      message: `Successfully updated ${fieldName} in ${tableName}`,
    }
  } catch (error) {
    console.error(`Error updating ${fieldName} in ${tableName}:`, error)

    // Provide detailed error message
    let errorMessage = "An unknown error occurred during database update"

    if (error instanceof Error) {
      errorMessage = error.message
    }

    // Return a simple, serializable error response
    return {
      success: false,
      message: errorMessage,
    }
  }
}

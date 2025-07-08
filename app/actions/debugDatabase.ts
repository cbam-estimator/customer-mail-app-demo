"use server"

import { getTableStructure, debugTableData } from "@/lib/db/debug"

export async function getTableInfo(tableName: string) {
  try {
    const structure = await getTableStructure(tableName)
    const sampleData = await debugTableData(tableName, 2)

    return {
      success: true,
      tableName,
      structure,
      sampleData,
    }
  } catch (error) {
    console.error(`Error getting table info for ${tableName}:`, error)
    return {
      success: false,
      tableName,
      error: String(error),
    }
  }
}

import { db } from "./config"
import * as schema from "./schema"

export async function getTableStructure(tableName: string) {
  try {
    // This is a SQLite-specific query to get table info
    const query = `PRAGMA table_info(${tableName});`

    // Execute the raw query
    const result = await db.execute(query)

    return {
      success: true,
      tableName,
      columns: result.rows,
    }
  } catch (error) {
    console.error(`Error getting structure for table ${tableName}:`, error)
    return {
      success: false,
      tableName,
      error: String(error),
    }
  }
}

export async function debugTableData(tableName: string, limit = 5) {
  try {
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
        throw new Error(`Unknown table: ${tableName}`)
    }

    const result = await db.select().from(table).limit(limit)

    return {
      success: true,
      tableName,
      data: result,
      count: result.length,
    }
  } catch (error) {
    console.error(`Error debugging table ${tableName}:`, error)
    return {
      success: false,
      tableName,
      error: String(error),
    }
  }
}

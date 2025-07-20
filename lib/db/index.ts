import { db } from "./config"
import { suppliers, cnCodes } from "./schema"
import { eq, inArray } from "drizzle-orm"

export async function getSuppliers() {
  try {
    const result = await db.select().from(suppliers)
    const supplierIds = result.map((s) => s.id)
    const cnCodesResult = await db.select().from(cnCodes).where(inArray(cnCodes.supplierId, supplierIds))

    return result.map((supplier) => ({
      ...supplier,
      cnCodes: cnCodesResult.filter((cc) => cc.supplierId === supplier.id).map((cc) => cc.code),
    }))
  } catch (error) {
    console.error("Error fetching suppliers:", error)
    throw error // Re-throw the error so it can be handled by the caller
  }
}

export async function getSupplierById(id: number) {
  const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id))
  if (!supplier) return null

  const supplierCnCodes = await db.select().from(cnCodes).where(eq(cnCodes.supplierId, id))

  return {
    ...supplier,
    cnCodes: supplierCnCodes.map((cc) => cc.code),
  }
}

export async function createSupplier(supplier: typeof suppliers.$inferInsert) {
  return await db.insert(suppliers).values(supplier)
}

export async function updateSupplier(id: number, supplier: Partial<typeof suppliers.$inferInsert>) {
  return await db.update(suppliers).set(supplier).where(eq(suppliers.id, id))
}

export async function deleteSupplier(id: number) {
  return await db.delete(suppliers).where(eq(suppliers.id, id))
}

// Functions for cnCodes and supplierFiles...

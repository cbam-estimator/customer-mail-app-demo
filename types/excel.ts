import { Address } from "cluster"
import { Supplier } from "./supplier"

export interface GoodsImportRow {
  id: number
  remarks: string
  cnCode: string
  manufacturer: string
  quantity: number
  unit: string
  productionMethod: string
  customsProcedure: string
  date: Date | null
  quarter: string
  importFile?: string
  seeDirect: number // New property for SEE direct value
  seeIndirect: number // New property for SEE indirect value
  supplierId:number
}

// export interface Supplier {
//   id: number
//   name: string
//   streetNumber:string;
//   street:string;
//   additionalLine:string;
//   postcode:string;
//   country:string;
//   city:string;
//   email:string;
// }

export interface ImportPreviewData {
  suppliers: Supplier[]
  goodsImports: GoodsImportRow[]
  totalSuppliers: number
  totalGoodsEntries: number
  period: string
}

export interface ImportedFile {
  id: string
  filename: string
  importDate: string
  suppliers: number
  goodsEntries: number
  selected?: boolean
  supplierIds: number[]
  goodsEntryIndices: number[]
  period:string;
}

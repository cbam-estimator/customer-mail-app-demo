import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"

export const suppliers = sqliteTable("suppliers", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  country: text("country").notNull(),
  status: text("status").notNull(),
  lastUpdate: text("last_update").notNull(),
  validUntil: text("valid_until"),
  consultationHours: integer("consultation_hours").default(0),
})

export const cnCodes = sqliteTable("cn_codes", {
  id: integer("id").primaryKey(),
  supplierId: integer("supplier_id").notNull(),
  code: text("code").notNull(),
})

export const supplierFiles = sqliteTable("supplier_files", {
  id: integer("id").primaryKey(),
  supplierId: integer("supplier_id").notNull(),
  filename: text("filename").notNull(),
  dateReceived: text("date_received").notNull(),
  documentType: text("document_type").notNull(),
  filesize: integer("filesize").notNull(),
  url: text("url").notNull(),
})

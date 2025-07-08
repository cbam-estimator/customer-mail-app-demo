import { sqliteTable, text, integer, real, primaryKey } from "drizzle-orm/sqlite-core"

// Update the cnCodes table to add see_direct and see_indirect fields
export const cnCodes = sqliteTable("cn_codes", {
  id: integer("id").primaryKey(),
  code: text("code").notNull(),
  good_category: text("good_category"),
  description: text("description"),
  see_direct: real("see_direct"),
  see_indirect: real("see_indirect"),
})

export const persons = sqliteTable("persons", {
  id: integer("id").primaryKey(),
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
})

// Update the suppliers table to add consulting, consulting_hours, and last_update fields
export const suppliers = sqliteTable("suppliers", {
  id: integer("id").primaryKey(),
  name: text("name"),
  country: text("country"),
  city: text("city"),
  street: text("street"),
  street_num: text("street_num"),
  addr_additional_line: text("addr_additional_line"),
  post_code: text("post_code"),
  contact_person_id: integer("contact_person_id"),
  company_mail: text("company_mail"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  remarks: text("remarks"),
  emission_data_status: text("emission_data_status"),
  emission_data_valid_until: integer("emission_data_valid_until"),
  consulting: integer("consulting"),
  consulting_hours: integer("consulting_hours"),
  last_update: text("last_update"),
})

export const supplierCnCodeMappings = sqliteTable(
  "supplier_cn_code_mappings",
  {
    supplier_id: integer("supplier_id").notNull(),
    cn_code_id: integer("cn_code_id").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.supplier_id, table.cn_code_id] }),
    }
  },
)

// Update the goods table to add remarks, date, see_direct, and see_indirect fields
export const goods = sqliteTable("goods", {
  id: integer("id").primaryKey(),
  supplier_id: integer("supplier_id"),
  cn_code_id: integer("cn_code_id"),
  quantity: integer("quantity"),
  production_method_code: text("production_method_code"),
  production_method_desc: text("production_method_desc"),
  customer_proc_code: text("customer_proc_code"),
  customer_proc_desc: text("customer_proc_desc"),
  remarks: text("remarks"),
  date: text("date"),
  see_direct: real("see_direct"),
  see_indirect: real("see_indirect"),
})

// Keep the supplierFiles table for backward compatibility
export const supplierFiles = sqliteTable("supplier_files", {
  id: integer("id").primaryKey(),
  supplierId: integer("supplier_id").notNull(),
  filename: text("filename").notNull(),
  dateReceived: text("date_received").notNull(),
  documentType: text("document_type").notNull(),
  filesize: integer("filesize").notNull(),
  url: text("url").notNull(),
})

export const goodsImports = sqliteTable("goods_imports", {
  id: integer("id").primaryKey(),
  supplier_id: integer("supplier_id"),
  cn_code: text("cn_code"),
  goods_description: text("goods_description"),
  quarter: text("quarter"),
  imported_amount: real("imported_amount"),
  unit: text("unit"),
  imported_value: real("imported_value"),
  currency: text("currency"),
})

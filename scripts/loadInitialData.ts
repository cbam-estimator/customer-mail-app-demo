import { email } from "zod/v4/core/regexes.cjs";
import { db } from "../lib/db/config"
import { suppliers, cnCodes, persons, supplierCnCodeMappings, goods, supplierFiles, goodsImports } from "../lib/db/schema"
import { SupplierStatus } from "../types/supplier"
import { Phone } from "lucide-react";


// Extended goods data (continuing from id: 3)
// Extended goods data (starting from id: 20 to avoid conflicts)
// const initialgoodsImports = [
//   {
//     id: 20,
//     supplier_id: 4,
//     cn_code_id: 2,
//     quantity: 80,
//     production_method_code: "PM004",
//     production_method_desc: "Blast Furnace",
//     customer_proc_code: "CP004",
//     customer_proc_desc: "Customs Procedure D",
//     remarks: "Heavy-duty industrial steel",
//     date: "1759296000", // Q1 2025
//     see_direct: 1.8,
//     see_indirect: 0.5,
//   },
//   {
//     id: 21,
//     supplier_id: 5,
//     cn_code_id: 4,
//     quantity: 65,
//     production_method_code: "PM005",
//     production_method_desc: "Induction Furnace",
//     customer_proc_code: "CP001",
//     customer_proc_desc: "Customs Procedure A",
//     remarks: "Precision alloy steel",
//     date: "1766721600", // Q2 2025
//     see_direct: 2.1,
//     see_indirect: 0.6,
//   },
//   {
//     id: 22,
//     supplier_id: 6,
//     cn_code_id: 6,
//     quantity: 45,
//     production_method_code: "PM006",
//     production_method_desc: "Open Hearth Furnace",
//     customer_proc_code: "CP005",
//     customer_proc_desc: "Customs Procedure E",
//     remarks: "Recycled copper grade A",
//     date: "1774147200", // Q3 2025
//     see_direct: 1.3,
//     see_indirect: 0.25,
//   },
//   {
//     id: 23,
//     supplier_id: 7,
//     cn_code_id: 7,
//     quantity: 120,
//     production_method_code: "PM007",
//     production_method_desc: "Direct Reduction",
//     customer_proc_code: "CP002",
//     customer_proc_desc: "Customs Procedure B",
//     remarks: "High carbon steel sheets",
//     date: "1781485200", // Q4 2025
//     see_direct: 1.9,
//     see_indirect: 0.7,
//   },
//   {
//     id: 24,
//     supplier_id: 8,
//     cn_code_id: 8,
//     quantity: 90,
//     production_method_code: "PM008",
//     production_method_desc: "Vacuum Degassing",
//     customer_proc_code: "CP003",
//     customer_proc_desc: "Customs Procedure C",
//     remarks: "Ultra-low carbon steel",
//     date: "1759296000", // Q1 2025
//     see_direct: 2.3,
//     see_indirect: 0.8,
//   },
//   {
//     id: 25,
//     supplier_id: 9,
//     cn_code_id: 9,
//     quantity: 75,
//     production_method_code: "PM009",
//     production_method_desc: "Ladle Refining",
//     customer_proc_code: "CP006",
//     customer_proc_desc: "Customs Procedure F",
//     remarks: "Stainless steel grade 316",
//     date: "1766721600", // Q2 2025
//     see_direct: 1.7,
//     see_indirect: 0.45,
//   },
//   {
//     id: 26,
//     supplier_id: 1, // Same supplier as goods id:1
//     cn_code_id: 10,
//     quantity: 55,
//     production_method_code: "PM010",
//     production_method_desc: "Powder Metallurgy",
//     customer_proc_code: "CP004",
//     customer_proc_desc: "Customs Procedure D",
//     remarks: "Sintered metal components",
//     date: "1774147200", // Q3 2025
//     see_direct: 1.6,
//     see_indirect: 0.35,
//   },
//   {
//     id: 27,
//     supplier_id: 2, // Same supplier as goods id:2
//     cn_code_id: 11,
//     quantity: 40,
//     production_method_code: "PM011",
//     production_method_desc: "Cold Rolling",
//     customer_proc_code: "CP007",
//     customer_proc_desc: "Customs Procedure G",
//     remarks: "Aluminum sheets thin gauge",
//     date: "1781485200", // Q4 2025
//     see_direct: 1.4,
//     see_indirect: 0.28,
//   },
//   {
//     id: 28,
//     supplier_id: 3, // Same supplier as goods id:3
//     cn_code_id: 12,
//     quantity: 95,
//     production_method_code: "PM012",
//     production_method_desc: "Hot Forging",
//     customer_proc_code: "CP001",
//     customer_proc_desc: "Customs Procedure A",
//     remarks: "Carbon fiber reinforced",
//     date: "1759296000", // Q1 2025
//     see_direct: 2.5,
//     see_indirect: 0.9,
//   },
//   {
//     id: 29,
//     supplier_id: 4, // Same supplier as goods id:4
//     cn_code_id: 13,
//     quantity: 110,
//     production_method_code: "PM013",
//     production_method_desc: "Electroplating",
//     customer_proc_code: "CP005",
//     customer_proc_desc: "Customs Procedure E",
//     remarks: "Zinc coated steel",
//     date: "1766721600", // Q2 2025
//     see_direct: 1.2,
//     see_indirect: 0.32,
//   },
//   {
//     id: 30,
//     supplier_id: 5, // Same supplier as goods id:5
//     cn_code_id: 14,
//     quantity: 70,
//     production_method_code: "PM014",
//     production_method_desc: "Annealing",
//     customer_proc_code: "CP008",
//     customer_proc_desc: "Customs Procedure H",
//     remarks: "Soft magnetic alloys",
//     date: "1774147200", // Q3 2025
//     see_direct: 1.85,
//     see_indirect: 0.55,
//   },
//   {
//     id: 31,
//     supplier_id: 6, // Same supplier as goods id:6
//     cn_code_id: 15,
//     quantity: 85,
//     production_method_code: "PM015",
//     production_method_desc: "Extrusion",
//     customer_proc_code: "CP002",
//     customer_proc_desc: "Customs Procedure B",
//     remarks: "Copper tubes and profiles",
//     date: "1781485200", // Q4 2025
//     see_direct: 1.55,
//     see_indirect: 0.42,
//   },
//   // Q2-2026 goods for new suppliers
//   {
//     id: 40,
//     supplier_id: 21,
//     cn_code_id: 2,
//     quantity: 120,
//     production_method_code: "PM021",
//     production_method_desc: "Electric Arc Furnace",
//     customer_proc_code: "CP021",
//     customer_proc_desc: "Customs Procedure Q2",
//     remarks: "Q2-2026 steel batch for Q2 Metals GmbH",
//     date: "1772688000", // May 3, 2026
//     see_direct: 2.2,
//     see_indirect: 0.9,
//   },
//   {
//     id: 41,
//     supplier_id: 22,
//     cn_code_id: 3,
//     quantity: 95,
//     production_method_code: "PM022",
//     production_method_desc: "Basic Oxygen Furnace",
//     customer_proc_code: "CP022",
//     customer_proc_desc: "Customs Procedure Q2",
//     remarks: "Q2-2026 spring steel for Spring Steel Ltd",
//     date: "1774051200", // May 19, 2026
//     see_direct: 1.7,
//     see_indirect: 1.1,
//   },
//   {
//     id: 42,
//     supplier_id: 23,
//     cn_code_id: 4,
//     quantity: 110,
//     production_method_code: "PM023",
//     production_method_desc: "Open Hearth Furnace",
//     customer_proc_code: "CP023",
//     customer_proc_desc: "Customs Procedure Q2",
//     remarks: "Q2-2026 iron batch for Baltic Ironworks",
//     date: "1775097600", // June 1, 2026
//     see_direct: 2.0,
//     see_indirect: 0.8,
//   },
//   {
//     id: 43,
//     supplier_id: 24,
//     cn_code_id: 5,
//     quantity: 130,
//     production_method_code: "PM024",
//     production_method_desc: "Direct Reduction",
//     customer_proc_code: "CP024",
//     customer_proc_desc: "Customs Procedure Q2",
//     remarks: "Q2-2026 steel for Danube Steelworks",
//     date: "1775097600", // June 1, 2026
//     see_direct: 1.9,
//     see_indirect: 1.0,
//   },
//   {
//     id: 44,
//     supplier_id: 25,
//     cn_code_id: 6,
//     quantity: 105,
//     production_method_code: "PM025",
//     production_method_desc: "Vacuum Degassing",
//     customer_proc_code: "CP025",
//     customer_proc_desc: "Customs Procedure Q2",
//     remarks: "Q2-2026 steel for Nordic Steelworks",
//     date: "1773288000", // April 10, 2026
//     see_direct: 2.3,
//     see_indirect: 0.7,
//   },
//   {
//     id: 45,
//     supplier_id: 26,
//     cn_code_id: 7,
//     quantity: 115,
//     production_method_code: "PM026",
//     production_method_desc: "Induction Furnace",
//     customer_proc_code: "CP026",
//     customer_proc_desc: "Customs Procedure Q2",
//     remarks: "Q2-2026 steel for Alpine Metals AG",
//     date: "1773888000", // April 17, 2026
//     see_direct: 2.0,
//     see_indirect: 0.9,
//   },
//   {
//     id: 46,
//     supplier_id: 27,
//     cn_code_id: 8,
//     quantity: 125,
//     production_method_code: "PM027",
//     production_method_desc: "Hot Rolling",
//     customer_proc_code: "CP027",
//     customer_proc_desc: "Customs Procedure Q2",
//     remarks: "Q2-2026 steel for Iberian Steel Group",
//     date: "1774488000", // April 24, 2026
//     see_direct: 1.8,
//     see_indirect: 1.2,
//   },
//   {
//     id: 47,
//     supplier_id: 28,
//     cn_code_id: 9,
//     quantity: 100,
//     production_method_code: "PM028",
//     production_method_desc: "Annealing",
//     customer_proc_code: "CP028",
//     customer_proc_desc: "Customs Procedure Q2",
//     remarks: "Q2-2026 steel for Balkan Metalworks",
//     date: "1775097600", // June 1, 2026
//     see_direct: 2.1,
//     see_indirect: 0.85,
//   },
// ];

// More seed data for various quarters and suppliers
const initialGoods = [
  // Q1-2025
  {
    id: 48,
    supplier_id: 21,
    cn_code_id: 2,
    quantity: 90,
    production_method_code: "PM021",
    production_method_desc: "Electric Arc Furnace",
    customer_proc_code: "CP021",
    customer_proc_desc: "Customs Procedure Q1",
    remarks: "Q1-2025 steel batch for Q2 Metals GmbH",
    date: "1735689600", // Jan 1, 2025
    see_direct: 2.0,
    see_indirect: 0.8,
  },
  // Q2-2025
  {
    id: 49,
    supplier_id: 22,
    cn_code_id: 3,
    quantity: 110,
    production_method_code: "PM022",
    production_method_desc: "Basic Oxygen Furnace",
    customer_proc_code: "CP022",
    customer_proc_desc: "Customs Procedure Q2",
    remarks: "Q2-2025 spring steel for Spring Steel Ltd",
    date: "1766721600", // May 26, 2025
    see_direct: 1.9,
    see_indirect: 1.0,
  },
  // Q3-2025
  {
    id: 50,
    supplier_id: 23,
    cn_code_id: 4,
    quantity: 120,
    production_method_code: "PM023",
    production_method_desc: "Open Hearth Furnace",
    customer_proc_code: "CP023",
    customer_proc_desc: "Customs Procedure Q3",
    remarks: "Q3-2025 iron batch for Baltic Ironworks",
    date: "1780032000", // Aug 28, 2025
    see_direct: 2.2,
    see_indirect: 0.7,
  },
  // Q4-2025
  {
    id: 51,
    supplier_id: 24,
    cn_code_id: 5,
    quantity: 130,
    production_method_code: "PM024",
    production_method_desc: "Direct Reduction",
    customer_proc_code: "CP024",
    customer_proc_desc: "Customs Procedure Q4",
    remarks: "Q4-2025 steel for Danube Steelworks",
    date: "1790956800", // Dec 1, 2025
    see_direct: 1.8,
    see_indirect: 1.1,
  },
  // Q1-2026
  {
    id: 52,
    supplier_id: 25,
    cn_code_id: 6,
    quantity: 115,
    production_method_code: "PM025",
    production_method_desc: "Vacuum Degassing",
    customer_proc_code: "CP025",
    customer_proc_desc: "Customs Procedure Q1",
    remarks: "Q1-2026 steel for Nordic Steelworks",
    date: "1798780800", // Mar 1, 2026
    see_direct: 2.4,
    see_indirect: 0.9,
  },
  // Q2-2026
  {
    id: 53,
    supplier_id: 26,
    cn_code_id: 7,
    quantity: 125,
    production_method_code: "PM026",
    production_method_desc: "Induction Furnace",
    customer_proc_code: "CP026",
    customer_proc_desc: "Customs Procedure Q2",
    remarks: "Q2-2026 steel for Alpine Metals AG",
    date: "1773888000", // April 17, 2026
    see_direct: 2.1,
    see_indirect: 1.0,
  },
  // Q3-2026
  {
    id: 54,
    supplier_id: 27,
    cn_code_id: 8,
    quantity: 135,
    production_method_code: "PM027",
    production_method_desc: "Hot Rolling",
    customer_proc_code: "CP027",
    customer_proc_desc: "Customs Procedure Q3",
    remarks: "Q3-2026 steel for Iberian Steel Group",
    date: "1811990400", // Sep 1, 2026
    see_direct: 1.7,
    see_indirect: 1.3,
  },
  // Q4-2026
  {
    id: 55,
    supplier_id: 28,
    cn_code_id: 9,
    quantity: 140,
    production_method_code: "PM028",
    production_method_desc: "Annealing",
    customer_proc_code: "CP028",
    customer_proc_desc: "Customs Procedure Q4",
    remarks: "Q4-2026 steel for Balkan Metalworks",
    date: "1822915200", // Dec 5, 2026
    see_direct: 2.2,
    see_indirect: 1.1,
  },
];

// Add to initialGoods
//initialGoods.push(...moreGoods);

// // Extended suppliers data (starting from id: 20 to avoid conflicts)
// const initialSuppliers = [

//   // Additional Q2-2026 suppliers
//   {
//     id: 21,
//     name: "Q2 Metals GmbH",
//     country: "Germany",
//     city: "Berlin",
//     street: "Industriestrasse",
//     street_num: "12",
//     addr_additional_line: "",
//     post_code: "10115",
//     contact_person_id: 31,
//     company_mail: "info@q2metals.de",
//     latitude: 52.5200,
//     longitude: 13.4050,
//     remarks: "Q2-2026 test supplier.",
//     emission_data_status: "Emission Data Received",
//     emission_data_valid_until: 1772688000, // May 3, 2026
//     consulting: 1,
//     lastUpdate: new Date().toISOString(),
//   },
//   {
//     id: 22,
//     name: "Spring Steel Ltd",
//     country: "UK",
//     city: "Sheffield",
//     street: "Steel Road",
//     street_num: "7",
//     addr_additional_line: "",
//     post_code: "S1 2HH",
//     contact_person_id: 32,
//     company_mail: "contact@springsteel.co.uk",
//     latitude: 53.3811,
//     longitude: -1.4701,
//     remarks: "Another Q2-2026 supplier.",
//     emission_data_status: "Emission Data Received",
//     emission_data_valid_until: 1774051200, // May 19, 2026
//     consulting: 1,
//     lastUpdate: new Date().toISOString(),
//   },
//   {
//     id: 23,
//     name: "Baltic Ironworks",
//     country: "Estonia",
//     city: "Tallinn",
//     street: "Sadama",
//     street_num: "5",
//     addr_additional_line: "Harju County",
//     post_code: "10111",
//     contact_person_id: 33,
//     company_mail: "info@balticiron.ee",
//     latitude: 59.4370,
//     longitude: 24.7536,
//     remarks: "Baltic region Q2-2026 supplier.",
//     emission_data_status: "Emission Data Received",
//     emission_data_valid_until: 1775097600, // June 1, 2026
//     consulting: 1,
//     lastUpdate: new Date().toISOString(),
//   },
//   {
//     id: 24,
//     name: "Danube Steelworks",
//     country: "Hungary",
//     city: "Budapest",
//     street: "Duna utca",
//     street_num: "10",
//     addr_additional_line: "",
//     post_code: "1056",
//     contact_person_id: 34,
//     company_mail: "office@danubesteel.hu",
//     latitude: 47.4979,
//     longitude: 19.0402,
//     remarks: "Central Europe Q2-2026 supplier.",
//     emission_data_status: "Emission Data Received",
//     emission_data_valid_until: 1775097600, // June 1, 2026
//     consulting: 1,
//     lastUpdate: new Date().toISOString(),
//   },
//   {
//     id: 25,
//     name: "Nordic Steelworks",
//     country: "Sweden",
//     city: "Stockholm",
//     street: "Vasagatan",
//     street_num: "18",
//     addr_additional_line: "Norrmalm",
//     post_code: "11120",
//     contact_person_id: 35,
//     company_mail: "info@nordicsteel.se",
//     latitude: 59.3293,
//     longitude: 18.0686,
//     remarks: "Nordic Q2-2026 supplier.",
//     emission_data_status: "Emission Data Received",
//     emission_data_valid_until: 1773288000, // April 10, 2026
//     consulting: 1,
//     lastUpdate: new Date().toISOString(),
//   },
//   {
//     id: 26,
//     name: "Alpine Metals AG",
//     country: "Switzerland",
//     city: "Zurich",
//     street: "Bahnhofstrasse",
//     street_num: "55",
//     addr_additional_line: "",
//     post_code: "8001",
//     contact_person_id: 36,
//     company_mail: "contact@alpinemetals.ch",
//     latitude: 47.3769,
//     longitude: 8.5417,
//     remarks: "Swiss Q2-2026 supplier.",
//     emission_data_status: "Emission Data Received",
//     emission_data_valid_until: 1773888000, // April 17, 2026
//     consulting: 1,
//     lastUpdate: new Date().toISOString(),
//   },
//   {
//     id: 27,
//     name: "Iberian Steel Group",
//     country: "Spain",
//     city: "Madrid",
//     street: "Gran Via",
//     street_num: "30",
//     addr_additional_line: "Centro",
//     post_code: "28013",
//     contact_person_id: 37,
//     company_mail: "info@iberiansteel.es",
//     latitude: 40.4168,
//     longitude: -3.7038,
//     remarks: "Iberian Q2-2026 supplier.",
//     emission_data_status: "Emission Data Received",
//     emission_data_valid_until: 1774488000, // April 24, 2026
//     consulting: 1,
//     lastUpdate: new Date().toISOString(),
//   },
//   {
//     id: 28,
//     name: "Balkan Metalworks",
//     country: "Serbia",
//     city: "Belgrade",
//     street: "Knez Mihailova",
//     street_num: "14",
//     addr_additional_line: "Stari Grad",
//     post_code: "11000",
//     contact_person_id: 38,
//     company_mail: "office@balkanmetal.rs",
//     latitude: 44.7866,
//     longitude: 20.4489,
//     remarks: "Balkan Q2-2026 supplier.",
//     emission_data_status: "Emission Data Received",
//     emission_data_valid_until: 1775097600, // June 1, 2026
//     consulting: 1,
//     lastUpdate: new Date().toISOString(),
//   },
// ];


export async function loadInitialData() {
  console.log("Loading initial data...")

  try {
    //Insert suppliers
    // for (const supplier of initialSuppliers) {
    //   console.log(`Attempting to insert supplier: ${supplier.name}`)
    //   const result = await db.insert(suppliers).values(supplier).returning({ insertedId: suppliers.id })
    //   console.log(`Inserted supplier ${supplier.name} with ID ${result[0].insertedId}`)
    // }

    // Insert CN codes
    // for (const cnCode of initialcnCodes) {
    //   const result = await db.insert(cnCodes).values(cnCode).returning({ insertedId: cnCodes.id })
    //   console.log(`Inserted CN code ${cnCode.code} with ID ${result[0].insertedId}`)
    // }

    //Insert Persons
    // for (const person of initialcnPersons) {
    //   const result = await db.insert(persons).values(person).returning({ insertedId: persons.id })
    //   //console.log(`Inserted CN code ${cnCode.code} with ID ${result[0].insertedId}`)
    // }

    //Insert supplierCnCodeMappings 
    // for (const supplierCnCodeMapping  of initialsupplierCnCodeMappings ) {
    //   const result = await db.insert(supplierCnCodeMappings).values(supplierCnCodeMapping).returning({ insertedId: supplierCnCodeMappings.supplier_id })
    //   //console.log(`Inserted CN code ${cnCode.code} with ID ${result[0].insertedId}`)
    // }

    //Insert goods 
    for (const good of initialGoods) {
      const result = await db.insert(goods).values(good).returning({ insertedId: goods.id })
      //console.log(`Inserted CN code ${cnCode.code} with ID ${result[0].insertedId}`)
    }

    //Insert goods 
    // for (const file  of initialsupplierFiles ) {
    //   const result = await db.insert(supplierFiles).values(file).returning({ insertedId: supplierFiles.id })
    //   //console.log(`Inserted CN code ${cnCode.code} with ID ${result[0].insertedId}`)
    // }

    //Insert goods 
    // for (const gi of initialgoodsImports) {
    //   const result = await db.insert(goodsImports).values(gi).returning({ insertedId: goodsImports.id })
    //   //console.log(`Inserted CN code ${cnCode.code} with ID ${result[0].insertedId}`)
    // }

    console.log("Initial data loaded successfully")
  } catch (error) {
    console.error("Error loading initial data:", error)
    throw error
  }
}

loadInitialData();
import { email } from "zod/v4/core/regexes.cjs";
import { db } from "../lib/db/config"
import { suppliers, cnCodes, persons, supplierCnCodeMappings, goods, supplierFiles, goodsImports } from "../lib/db/schema"
import { SupplierStatus } from "../types/supplier"
import { Phone } from "lucide-react";


// Extended goods data (continuing from id: 3)
// Extended goods data (starting from id: 20 to avoid conflicts)
const initialGoods = [
  {
    id: 20,
    supplier_id: 4,
    cn_code_id: 2,
    quantity: 80,
    production_method_code: "PM004",
    production_method_desc: "Blast Furnace",
    customer_proc_code: "CP004",
    customer_proc_desc: "Customs Procedure D",
    remarks: "Heavy-duty industrial steel",
    date: "1759296000", // Q1 2025
    see_direct: 1.8,
    see_indirect: 0.5,
  },
  {
    id: 21,
    supplier_id: 5,
    cn_code_id: 4,
    quantity: 65,
    production_method_code: "PM005",
    production_method_desc: "Induction Furnace",
    customer_proc_code: "CP001",
    customer_proc_desc: "Customs Procedure A",
    remarks: "Precision alloy steel",
    date: "1766721600", // Q2 2025
    see_direct: 2.1,
    see_indirect: 0.6,
  },
  {
    id: 22,
    supplier_id: 6,
    cn_code_id: 6,
    quantity: 45,
    production_method_code: "PM006",
    production_method_desc: "Open Hearth Furnace",
    customer_proc_code: "CP005",
    customer_proc_desc: "Customs Procedure E",
    remarks: "Recycled copper grade A",
    date: "1774147200", // Q3 2025
    see_direct: 1.3,
    see_indirect: 0.25,
  },
  {
    id: 23,
    supplier_id: 7,
    cn_code_id: 7,
    quantity: 120,
    production_method_code: "PM007",
    production_method_desc: "Direct Reduction",
    customer_proc_code: "CP002",
    customer_proc_desc: "Customs Procedure B",
    remarks: "High carbon steel sheets",
    date: "1781485200", // Q4 2025
    see_direct: 1.9,
    see_indirect: 0.7,
  },
  {
    id: 24,
    supplier_id: 8,
    cn_code_id: 8,
    quantity: 90,
    production_method_code: "PM008",
    production_method_desc: "Vacuum Degassing",
    customer_proc_code: "CP003",
    customer_proc_desc: "Customs Procedure C",
    remarks: "Ultra-low carbon steel",
    date: "1759296000", // Q1 2025
    see_direct: 2.3,
    see_indirect: 0.8,
  },
  {
    id: 25,
    supplier_id: 9,
    cn_code_id: 9,
    quantity: 75,
    production_method_code: "PM009",
    production_method_desc: "Ladle Refining",
    customer_proc_code: "CP006",
    customer_proc_desc: "Customs Procedure F",
    remarks: "Stainless steel grade 316",
    date: "1766721600", // Q2 2025
    see_direct: 1.7,
    see_indirect: 0.45,
  },
  {
    id: 26,
    supplier_id: 1, // Same supplier as goods id:1
    cn_code_id: 10,
    quantity: 55,
    production_method_code: "PM010",
    production_method_desc: "Powder Metallurgy",
    customer_proc_code: "CP004",
    customer_proc_desc: "Customs Procedure D",
    remarks: "Sintered metal components",
    date: "1774147200", // Q3 2025
    see_direct: 1.6,
    see_indirect: 0.35,
  },
  {
    id: 27,
    supplier_id: 2, // Same supplier as goods id:2
    cn_code_id: 11,
    quantity: 40,
    production_method_code: "PM011",
    production_method_desc: "Cold Rolling",
    customer_proc_code: "CP007",
    customer_proc_desc: "Customs Procedure G",
    remarks: "Aluminum sheets thin gauge",
    date: "1781485200", // Q4 2025
    see_direct: 1.4,
    see_indirect: 0.28,
  },
  {
    id: 28,
    supplier_id: 3, // Same supplier as goods id:3
    cn_code_id: 12,
    quantity: 95,
    production_method_code: "PM012",
    production_method_desc: "Hot Forging",
    customer_proc_code: "CP001",
    customer_proc_desc: "Customs Procedure A",
    remarks: "Carbon fiber reinforced",
    date: "1759296000", // Q1 2025
    see_direct: 2.5,
    see_indirect: 0.9,
  },
  {
    id: 29,
    supplier_id: 4, // Same supplier as goods id:4
    cn_code_id: 13,
    quantity: 110,
    production_method_code: "PM013",
    production_method_desc: "Electroplating",
    customer_proc_code: "CP005",
    customer_proc_desc: "Customs Procedure E",
    remarks: "Zinc coated steel",
    date: "1766721600", // Q2 2025
    see_direct: 1.2,
    see_indirect: 0.32,
  },
  {
    id: 30,
    supplier_id: 5, // Same supplier as goods id:5
    cn_code_id: 14,
    quantity: 70,
    production_method_code: "PM014",
    production_method_desc: "Annealing",
    customer_proc_code: "CP008",
    customer_proc_desc: "Customs Procedure H",
    remarks: "Soft magnetic alloys",
    date: "1774147200", // Q3 2025
    see_direct: 1.85,
    see_indirect: 0.55,
  },
  {
    id: 31,
    supplier_id: 6, // Same supplier as goods id:6
    cn_code_id: 15,
    quantity: 85,
    production_method_code: "PM015",
    production_method_desc: "Extrusion",
    customer_proc_code: "CP002",
    customer_proc_desc: "Customs Procedure B",
    remarks: "Copper tubes and profiles",
    date: "1781485200", // Q4 2025
    see_direct: 1.55,
    see_indirect: 0.42,
  }
];

// // Extended suppliers data (starting from id: 20 to avoid conflicts)
// const initialSuppliers = [
//   {
//     id: 20,
//     name: "Pacific Metals Australia",
//     country: "Australia",
//     city: "Perth",
//     street: "St Georges Terrace",
//     street_num: "200",
//     addr_additional_line: "Mining District",
//     post_code: "6000",
//     contact_person_id: 21,
//     company_mail: "operations@pacmet.au",
//     latitude: -31.9505,
//     longitude: 115.8605,
//     remarks: "Mining and metal processing specialist",
//     emission_data_status: "Emission Data Received",
//     emission_data_valid_until: 1750720709,
//     consulting: 1,
//     lastUpdate: new Date().toISOString(),
//   },
//   {
//     id: 11,
//     name: "Canadian Steel Corp",
//     country: "Canada",
//     city: "Toronto",
//     street: "Bay Street",
//     street_num: "350",
//     addr_additional_line: "Financial District",
//     post_code: "M5H 2S6",
//     contact_person_id: 12,
//     company_mail: "info@cansteel.ca",
//     latitude: 43.6532,
//     longitude: -79.3832,
//     remarks: "North American steel distributor",
//     emission_data_status: "Pending",
//     emission_data_valid_until: 1750720709,
//     consulting: 0,
//     lastUpdate: new Date().toISOString(),
//   },
//   {
//     id: 12,
//     name: "Brasília Metalúrgica",
//     country: "Brazil",
//     city: "São Paulo",
//     street: "Avenida Paulista",
//     street_num: "1578",
//     addr_additional_line: "Conjunto 142",
//     post_code: "01310-200",
//     contact_person_id: 13,
//     company_mail: "vendas@brasmetal.br",
//     latitude: -23.5615,
//     longitude: -46.6566,
//     remarks: "South American metallurgy leader",
//     emission_data_status: "Emission Data Received",
//     emission_data_valid_until: 1750720709,
//     consulting: 1,
//     lastUpdate: new Date().toISOString(),
//   },
//   {
//     id: 13,
//     name: "Moscow Industrial Metals",
//     country: "Russia",
//     city: "Moscow",
//     street: "Tverskaya Street",
//     street_num: "15",
//     addr_additional_line: "Building 1",
//     post_code: "125009",
//     contact_person_id: 14,
//     company_mail: "export@mipmetal.ru",
//     latitude: 55.7558,
//     longitude: 37.6176,
//     remarks: "Heavy industry metals supplier",
//     emission_data_status: "Not Available",
//     emission_data_valid_until: null,
//     consulting: 0,
//     lastUpdate: new Date().toISOString(),
//   },
//   {
//     id: 14,
//     name: "African Mining Consortium",
//     country: "South Africa",
//     city: "Johannesburg",
//     street: "Main Street",
//     street_num: "45",
//     addr_additional_line: "Mining Quarter",
//     post_code: "2001",
//     contact_person_id: 15,
//     company_mail: "trading@amc.za",
//     latitude: -26.2041,
//     longitude: 28.0473,
//     remarks: "Precious and industrial metals",
//     emission_data_status: SupplierStatus.EmissionDataReceived,
//     emission_data_valid_until: 1750720709,
//     consulting: 1,
//     lastUpdate: new Date().toISOString(),
//   },
//   {
//     id: 15,
//     name: "Nihon Steel Industries",
//     country: "Japan",
//     city: "Tokyo",
//     street: "Shibuya",
//     street_num: "2-21-1",
//     addr_additional_line: "Shibuya Hikarie",
//     post_code: "150-8510",
//     contact_person_id: 16,
//     company_mail: "international@nihonsteel.jp",
//     latitude: 35.6586,
//     longitude: 139.7454,
//     remarks: "Advanced steel technology",
//     emission_data_status: SupplierStatus.EmissionDataReceived,
//     emission_data_valid_until: 1750720709,
//     consulting: 1,
//     lastUpdate: new Date().toISOString(),
//   },
//   {
//     id: 16,
//     name: "UK Steel Solutions",
//     country: "United Kingdom",
//     city: "Sheffield",
//     street: "Steel City Boulevard",
//     street_num: "100",
//     addr_additional_line: "Industrial Park",
//     post_code: "S1 2HH",
//     contact_person_id: 17,
//     company_mail: "sales@uksteel.co.uk",
//     latitude: 53.3811,
//     longitude: -1.4701,
//     remarks: "Traditional steel manufacturing",
//     emission_data_status: "",
//     emission_data_valid_until: 1750720709,
//     consulting: 0,
//     lastUpdate: new Date().toISOString(),
//   },
//   {
//     id: 17,
//     name: "French Metallurgie SA",
//     country: "France",
//     city: "Lyon",
//     street: "Rue de la République",
//     street_num: "25",
//     addr_additional_line: "Zone Industrielle",
//     post_code: "69002",
//     contact_person_id: 18,
//     company_mail: "export@frenchmetal.fr",
//     latitude: 45.7640,
//     longitude: 4.8357,
//     remarks: "European specialty alloys",
//     emission_data_status: SupplierStatus.EmissionDataReceived,
//     emission_data_valid_until: 1750720709,
//     consulting: 1,
//     lastUpdate: new Date().toISOString(),
//   },
//   {
//     id: 18,
//     name: "Singapore Metal Hub",
//     country: "Singapore",
//     city: "Singapore",
//     street: "Raffles Place",
//     street_num: "1",
//     addr_additional_line: "Tower 2, Level 30",
//     post_code: "048616",
//     contact_person_id: 19,
//     company_mail: "hub@sgmetal.sg",
//     latitude: 1.2840,
//     longitude: 103.8510,
//     remarks: "Asian metals trading center",
//     emission_data_status: "",
//     emission_data_valid_until: 1750720709,
//     consulting: 1,
//     lastUpdate: new Date().toISOString(),
//   },
//   {
//     id: 19,
//     name: "Mexican Siderúrgica",
//     country: "Mexico",
//     city: "Monterrey",
//     street: "Avenida Constitución",
//     street_num: "400",
//     addr_additional_line: "Zona Rosa",
//     post_code: "64000",
//     contact_person_id: 30,
//     company_mail: "ventas@mexsider.mx",
//     latitude: 25.6866,
//     longitude: -100.3161,
//     remarks: "North American steel hub",
//     emission_data_status: SupplierStatus.EmissionDataReceived,
//     emission_data_valid_until: 1750720709,
//     consulting: 0,
//     lastUpdate: new Date().toISOString(),
//   }
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
      for (const good  of initialGoods ) {
        const result = await db.insert(goods).values(good).returning({ insertedId: goods.id })
        //console.log(`Inserted CN code ${cnCode.code} with ID ${result[0].insertedId}`)
      }

        //Insert goods 
        // for (const file  of initialsupplierFiles ) {
        //   const result = await db.insert(supplierFiles).values(file).returning({ insertedId: supplierFiles.id })
        //   //console.log(`Inserted CN code ${cnCode.code} with ID ${result[0].insertedId}`)
        // }

          //Insert goods 
          // for (const gi  of initialgoodsImports ) {
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
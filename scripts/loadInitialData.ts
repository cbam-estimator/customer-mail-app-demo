import { email } from "zod/v4/core/regexes.cjs";
import { db } from "../lib/db/config"
import { suppliers, cnCodes, persons, supplierCnCodeMappings, goods, supplierFiles, goodsImports } from "../lib/db/schema"
import { SupplierStatus } from "../types/supplier"
import { Phone } from "lucide-react";



const initialSuppliers = [
  {
    id:1,
    name: "St-Steel Trading",
    country: "Turkey",
    city: "Istanbul",
    street: "Istiklal Caddesi",
    street_num: "123",
    addr_additional_line: "Near Taksim Square",
    post_code: "34430",
    contact_person_id: 1,
    company_mail: "steel@c.co.uk",
    latitude: 41.0082,
    longitude: 28.9784,
    remarks: "Leading steel supplier in Turkey",
    emission_data_status: SupplierStatus.EmissionDataReceived,
    emission_data_valid_until: 1750720709,
    consulting: 1,
    lastUpdate: new Date().toISOString(),
  },
  {
    id:2,
    name: "Alumax GmbH",
    country: "Germany",
    city: "Düsseldorf",
    street: "Königsallee",
    street_num: "45",
    addr_additional_line: "Suite B",
    post_code: "40212",
    contact_person_id: 2,
    company_mail: "info@alumax.de",
    latitude: 51.2277,
    longitude: 6.7735,
    remarks: "Premium aluminum extrusions",
    emission_data_status: "",
    emission_data_valid_until: 1750720709,
    consulting: 0,
    lastUpdate: new Date().toISOString(),
  },
  {
    id:3,
    name: "CarbonTrade Inc.",
    country: "USA",
    city: "Pittsburgh",
    street: "5th Avenue",
    street_num: "500",
    addr_additional_line: "Near Steel Tower",
    post_code: "15219",
    contact_person_id: 3,
    company_mail: "contact@carbontrade.us",
    latitude: 40.4418,
    longitude: -79.9901,
    remarks: "Carbon material specialist",
    emission_data_status: "",
    emission_data_valid_until: 1750720709,
    consulting: 1,
    lastUpdate: new Date().toISOString(),
  },
  {
    id:4,
    name: "Metallo Polska",
    country: "Poland",
    city: "Katowice",
    street: "Aleja Korfantego",
    street_num: "32A",
    addr_additional_line: "Floor 2",
    post_code: "40-005",
    contact_person_id: 4,
    company_mail: "sales@metallo.pl",
    latitude: 50.2599,
    longitude: 19.0216,
    remarks: "Metals and scrap expert",
    emission_data_status: SupplierStatus.EmissionDataReceived,
    emission_data_valid_until: 1750720709,
    consulting: 0,
    lastUpdate: new Date().toISOString(),
  },
  {
    id:5,
    name: "Nordic Metalworks",
    country: "Sweden",
    city: "Gothenburg",
    street: "Lindholmsallén",
    street_num: "9",
    addr_additional_line: "Science Park",
    post_code: "417 55",
    contact_person_id: 5,
    company_mail: "info@nordicmetal.se",
    latitude: 57.7063,
    longitude: 11.9402,
    remarks: "Environmentally conscious supplier",
    emission_data_status: SupplierStatus.EmissionDataReceived,
    emission_data_valid_until: 1750720709,
    consulting: 1,
    lastUpdate: new Date().toISOString(),
  },
  {
    name: "EcoSteel Italia",
    country: "Italy",
    city: "Turin",
    street: "Via Roma",
    street_num: "88",
    addr_additional_line: "3rd Floor",
    post_code: "10121",
    contact_person_id: 6,
    company_mail: "eco@steel.it",
    latitude: 45.0703,
    longitude: 7.6869,
    remarks: "Supplier of recycled steel",
    emission_data_status: "",
    emission_data_valid_until: 1750720709,
    consulting: 0,
    lastUpdate: new Date().toISOString(),
  },
  {
    id:6,
    name: "Global Copper Ltd.",
    country: "Chile",
    city: "Santiago",
    street: "Avenida Apoquindo",
    street_num: "3000",
    addr_additional_line: "Edificio Central",
    post_code: "7550180",
    contact_person_id: 7,
    company_mail: "copper@global.cl",
    latitude: -33.4173,
    longitude: -70.6074,
    remarks: "Largest copper exporter in South America",
    emission_data_status: SupplierStatus.EmissionDataReceived,
    emission_data_valid_until: 1750720709,
    consulting: 1,
    lastUpdate: new Date().toISOString(),
  },
  {
    id:7,
    name: "Emirates Steel",
    country: "UAE",
    city: "Abu Dhabi",
    street: "Mussafah Industrial Area",
    street_num: "Zone 3",
    addr_additional_line: "Plant A",
    post_code: "34342",
    contact_person_id: 8,
    company_mail: "admin@emiratessteel.ae",
    latitude: 24.3215,
    longitude: 54.5185,
    remarks: "Steel supplier from the Middle East",
    emission_data_status: "",
    emission_data_valid_until: null,
    consulting: 1,
    lastUpdate: new Date().toISOString(),
  },
  {
    id:8,
    name: "South Korea Steelworks",
    country: "South Korea",
    city: "Busan",
    street: "Haeundae-daero",
    street_num: "105",
    addr_additional_line: "Suite 10",
    post_code: "48093",
    contact_person_id: 9,
    company_mail: "support@sksteel.kr",
    latitude: 35.1796,
    longitude: 129.0756,
    remarks: "Asian steel processing hub",
    emission_data_status: SupplierStatus.EmissionDataReceived,
    emission_data_valid_until: 1750720709,
    consulting: 0,
    lastUpdate: new Date().toISOString(),
  },
  {
    id:9,
    name: "Bharat Metal Co.",
    country: "India",
    city: "Mumbai",
    street: "Marine Drive",
    street_num: "501",
    addr_additional_line: "Opposite to Gateway Hotel",
    post_code: "400002",
    contact_person_id: 10,
    company_mail: "contact@bharatmetal.in",
    latitude: 18.9440,
    longitude: 72.8238,
    remarks: "Supplier of industrial metals in India",
    emission_data_status: SupplierStatus.EmissionDataReceived,
    emission_data_valid_until: 1750720709,
    consulting: 1,
    lastUpdate: new Date().toISOString(),
  },
];

const initialcnCodes = [
  {
    code: "72011090",
    good_category: "Pig iron",
    description:
      "Non-alloy pig iron in pigs, blocks or other primary forms, containing by weight <= 0.5% phosphorus, and <= 0.1% manganese",
    see_direct: 1.2,
    see_indirect: 0.3,
  },
  {
    code: "72021100",
    good_category: "Ferro-alloys",
    description: "Ferromanganese, containing by weight >2% carbon",
    see_direct: 2.1,
    see_indirect: 0.5,
  },
  {
    code: "72021910",
    good_category: "Ferro-alloys",
    description: "Ferrosilicon containing by weight >55% silicon",
    see_direct: 1.8,
    see_indirect: 0.4,
  },
  {
    code: "72042100",
    good_category: "Waste and scrap",
    description: "Waste and scrap of stainless steel",
    see_direct: 0.9,
    see_indirect: 0.2,
  },
  {
    code: "72071111",
    good_category: "Semi-finished steel",
    description: "Semi-finished products of iron/non-alloy steel, rectangular cross-section",
    see_direct: 2.5,
    see_indirect: 0.6,
  },
  {
    code: "72081000",
    good_category: "Flat-rolled steel",
    description: "Flat-rolled iron/non-alloy steel, width ≥600mm, hot-rolled, not clad/plated/coated",
    see_direct: 2.9,
    see_indirect: 0.8,
  },
  {
    code: "72091500",
    good_category: "Cold-rolled products",
    description: "Flat-rolled products of iron/non-alloy steel, width ≥600mm, cold-rolled",
    see_direct: 2.2,
    see_indirect: 0.7,
  },
  {
    code: "72103000",
    good_category: "Coated steel",
    description: "Flat-rolled iron/non-alloy steel, plated or coated with tin",
    see_direct: 1.7,
    see_indirect: 0.3,
  },
  {
    code: "72142000",
    good_category: "Bars and rods",
    description: "Bars and rods of iron or non-alloy steel, hot-rolled, forged, of circular cross-section",
    see_direct: 2.0,
    see_indirect: 0.4,
  },
  {
    code: "72253010",
    good_category: "Flat-rolled alloy steel",
    description: "Flat-rolled alloy steel, width <600mm, cold-rolled, containing boron",
    see_direct: 2.3,
    see_indirect: 0.5,
  },
];



const initialcnPersons = [
  {
    id: 1,
    name: "John Smith",
    email: "john@gmail.com",
    phone: "+1234567890",
  },
  {
    id: 2,
    name: "Amina Khan",
    email: "amina.khan@example.com",
    phone: "+441234567890",
  },
  {
    id: 3,
    name: "Carlos Mendes",
    email: "carlos.mendes@example.com",
    phone: "+5511987654321",
  },
  {
    id: 4,
    name: "Yuki Tanaka",
    email: "yuki.tanaka@example.jp",
    phone: "+81312345678",
  },
  {
    id: 5,
    name: "Fatima Al-Mansouri",
    email: "fatima.mansouri@example.ae",
    phone: "+971501234567",
  },
  {
    id: 6,
    name: "Liam O'Connor",
    email: "liam.oconnor@example.ie",
    phone: "+353851234567",
  },
];



const initialsupplierCnCodeMappings = [
  {
    supplier_id: 1,
    cn_code_id: 2,
  },
  {
    supplier_id: 1,
    cn_code_id: 3,
  },
  {
    supplier_id: 2,
    cn_code_id: 1,
  },
  {
    supplier_id: 2,
    cn_code_id: 4,
  },
  {
    supplier_id: 3,
    cn_code_id: 2,
  },
  {
    supplier_id: 3,
    cn_code_id: 5,
  },
  {
    supplier_id: 4,
    cn_code_id: 1,
  },
  {
    supplier_id: 4,
    cn_code_id: 3,
  },
  {
    supplier_id: 5,
    cn_code_id: 4,
  },
  {
    supplier_id: 5,
    cn_code_id: 5,
  },
];




const initialgoods = [
  {
    id: 1,
    supplier_id: 1,
    cn_code_id: 1,
    quantity: 20,
    production_method_code: "PM001",
    production_method_desc: "Electric Arc Furnace",
    customer_proc_code: "CP001",
    customer_proc_desc: "Customs Procedure A",
    remarks: "High quality steel",
    date: "1750720709",
    see_direct: 1.2,
    see_indirect: 0.3,
  },
  {
    id: 2,
    supplier_id: 2,
    cn_code_id: 3,
    quantity: 50,
    production_method_code: "PM002",
    production_method_desc: "Basic Oxygen Furnace",
    customer_proc_code: "CP002",
    customer_proc_desc: "Customs Procedure B",
    remarks: "Standard grade steel",
    date: "1750720800",
    see_direct: 1.5,
    see_indirect: 0.4,
  },
  {
    id: 3,
    supplier_id: 3,
    cn_code_id: 5,
    quantity: 35,
    production_method_code: "PM003",
    production_method_desc: "Continuous Casting",
    customer_proc_code: "CP003",
    customer_proc_desc: "Customs Procedure C",
    remarks: "Semi-finished product",
    date: "1750720900",
    see_direct: 1.1,
    see_indirect: 0.2,
  },
];


const initialsupplierFiles = [
  {
    id: 1,
    supplierId: 1,
    filename: "steel_data_2023.xlsx",
    dateReceived: "2023-04-01",
    documentType: "Emission Data",
    filesize: 204800,
    url: "https://example.com/files/steel_data_2023.xlsx",
  },
  {
    id: 2,
    supplierId: 2,
    filename: "aluminum_report_2023.pdf",
    dateReceived: "2023-05-15",
    documentType: "Production Report",
    filesize: 512000,
    url: "https://example.com/files/aluminum_report_2023.pdf",
  },
  {
    id: 3,
    supplierId: 3,
    filename: "copper_emissions_2023.csv",
    dateReceived: "2023-03-10",
    documentType: "Emission Data",
    filesize: 102400,
    url: "https://example.com/files/copper_emissions_2023.csv",
  },
  {
    id: 4,
    supplierId: 4,
    filename: "nickel_quality_2023.docx",
    dateReceived: "2023-06-01",
    documentType: "Quality Report",
    filesize: 307200,
    url: "https://example.com/files/nickel_quality_2023.docx",
  },
  {
    id: 5,
    supplierId: 5,
    filename: "zinc_data_2023.xlsx",
    dateReceived: "2023-07-20",
    documentType: "Emission Data",
    filesize: 256000,
    url: "https://example.com/files/zinc_data_2023.xlsx",
  },
];


export const initialgoodsImports = [
  {
    id: 1,
    supplier_id: 1,
    cn_code: "7201.10",
    goods_description: "Pig iron in pigs, blocks or other primary forms",
    quarter: "2023-Q1",
    imported_amount: 1500.5,
    unit: "tons",
    imported_value: 1200000,
    currency: "USD",
  },
  {
    id: 2,
    supplier_id: 2,
    cn_code: "7403.11",
    goods_description: "Copper cathodes and sections of cathodes",
    quarter: "2023-Q1",
    imported_amount: 800.75,
    unit: "tons",
    imported_value: 980000,
    currency: "USD",
  },
  {
    id: 3,
    supplier_id: 3,
    cn_code: "7601.10",
    goods_description: "Unwrought aluminium",
    quarter: "2023-Q2",
    imported_amount: 1200,
    unit: "tons",
    imported_value: 860000,
    currency: "EUR",
  },
  {
    id: 4,
    supplier_id: 4,
    cn_code: "7207.20",
    goods_description: "Semi-finished products of iron or non-alloy steel",
    quarter: "2023-Q2",
    imported_amount: 650,
    unit: "tons",
    imported_value: 450000,
    currency: "USD",
  },
  {
    id: 5,
    supplier_id: 5,
    cn_code: "7410.10",
    goods_description: "Copper wire",
    quarter: "2023-Q3",
    imported_amount: 1100,
    unit: "tons",
    imported_value: 720000,
    currency: "USD",
  },
];



export async function loadInitialData() {
  console.log("Loading initial data...")

  try {
    // Insert suppliers
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
    for (const person of initialcnPersons) {
      const result = await db.insert(persons).values(person).returning({ insertedId: persons.id })
      //console.log(`Inserted CN code ${cnCode.code} with ID ${result[0].insertedId}`)
    }

      //Insert supplierCnCodeMappings 
      for (const supplierCnCodeMapping  of initialsupplierCnCodeMappings ) {
        const result = await db.insert(supplierCnCodeMappings).values(supplierCnCodeMapping).returning({ insertedId: supplierCnCodeMappings.supplier_id })
        //console.log(`Inserted CN code ${cnCode.code} with ID ${result[0].insertedId}`)
      }

      //Insert goods 
      for (const good  of initialgoods ) {
        const result = await db.insert(goods).values(good).returning({ insertedId: goods.id })
        //console.log(`Inserted CN code ${cnCode.code} with ID ${result[0].insertedId}`)
      }

        //Insert goods 
        for (const file  of initialsupplierFiles ) {
          const result = await db.insert(supplierFiles).values(file).returning({ insertedId: supplierFiles.id })
          //console.log(`Inserted CN code ${cnCode.code} with ID ${result[0].insertedId}`)
        }

          //Insert goods 
          for (const gi  of initialgoodsImports ) {
            const result = await db.insert(goodsImports).values(gi).returning({ insertedId: goodsImports.id })
            //console.log(`Inserted CN code ${cnCode.code} with ID ${result[0].insertedId}`)
          }

    console.log("Initial data loaded successfully")
  } catch (error) {
    console.error("Error loading initial data:", error)
    throw error
  }
}

loadInitialData();
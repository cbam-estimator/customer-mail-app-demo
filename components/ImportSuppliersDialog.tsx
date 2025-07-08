"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import * as XLSX from "xlsx"
import { Download, Upload, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ImportPreviewDialog } from "./ImportPreviewDialog"
import { type Supplier, SupplierStatus } from "@/types/supplier"
import type { GoodsImportRow, ImportPreviewData } from "@/types/excel"
import { useCompany } from "@/context/company-context"
import type { CompanyInfo } from "@/types/company"
import { downloadTemplate } from "@/app/actions/downloadTemplate"

interface ImportSuppliersDialogProps {
  onImport: (data: { suppliers: Supplier[]; goodsImports: GoodsImportRow[]; period: string }) => void
}

interface ColumnMapping {
  [key: string]: number
}

const findHeaderRow = (sheet: XLSX.WorkSheet): number => {
  const range = XLSX.utils.decode_range(sheet["!ref"] || "A1")
  for (let R = range.s.r; R <= range.e.r; ++R) {
    const cell = sheet[XLSX.utils.encode_cell({ r: R, c: 2 })] // Column C
    if (cell && cell.v === "Nr.") {
      return R
    }
  }
  throw new Error("Header row not found. Expected 'Nr.' in column C.")
}

const findCompanyInfoRow = (sheet: XLSX.WorkSheet): number => {
  const range = XLSX.utils.decode_range(sheet["!ref"] || "A1")
  for (let R = range.s.r; R <= range.e.r; ++R) {
    const cell = sheet[XLSX.utils.encode_cell({ r: R, c: 2 })] // Column C
    if (cell && cell.v === "Unternehmen") {
      return R
    }
  }
  return -1
}

const processCompanyInfo = (sheet: XLSX.WorkSheet): Partial<CompanyInfo> => {
  const range = XLSX.utils.decode_range(sheet["!ref"] || "A1")
  const companyInfo: Partial<CompanyInfo> = {}
  const fieldMapping: { [key: string]: keyof CompanyInfo } = {
    Unternehmen: "name",
    Straße: "street",
    Hausnummer: "houseNumber",
    Adresszusatz: "additionalAddress",
    Postleitzahl: "postalCode",
    Stadt: "city",
    Land: "country",
    "EORI-Nummer": "eoriNumber",
    Ansprechpartner: "contactPerson",
    "Ansprechpartner - Position": "contactPosition",
  }

  for (let R = range.s.r; R <= range.e.r; ++R) {
    const labelCell = sheet[XLSX.utils.encode_cell({ r: R, c: 2 })] // Column C
    if (labelCell && labelCell.v && fieldMapping[labelCell.v]) {
      const valueCell = sheet[XLSX.utils.encode_cell({ r: R, c: 3 })] // Column D
      if (valueCell && valueCell.v) {
        companyInfo[fieldMapping[labelCell.v]] = valueCell.v.toString()
      }
    }
  }

  return companyInfo
}

const mapHerstellerColumns = (sheet: XLSX.WorkSheet, headerRow: number): ColumnMapping => {
  const mapping: ColumnMapping = {}
  const range = XLSX.utils.decode_range(sheet["!ref"] || "A1")
  const expectedColumns = [
    "Nr.",
    "Name",
    "Straße",
    "Hausnummer",
    "Adresszusatz",
    "Postleitzahl",
    "Stadt",
    "Land",
    "Ansprechpartner",
    "Email-Adresse",
    "Telefonnummer",
    "Anmerkungen",
  ]

  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cell = sheet[XLSX.utils.encode_cell({ r: headerRow, c: C })]
    if (cell && expectedColumns.includes(cell.v)) {
      mapping[cell.v] = C
    }
  }

  const missingColumns = expectedColumns.filter((col) => !(col in mapping))
  if (missingColumns.length > 0) {
    throw new Error(`Missing required columns in Hersteller: ${missingColumns.join(", ")}`)
  }

  return mapping
}

const mapWarenimporteColumns = (sheet: XLSX.WorkSheet, headerRow: number): ColumnMapping => {
  const mapping: ColumnMapping = {}
  const range = XLSX.utils.decode_range(sheet["!ref"] || "A1")
  const expectedColumns = [
    "Nr.",
    "Ihre Anmerkungen",
    "CN-Code",
    "Hersteller / Händler / Installation",
    "Warenmenge",
    "Einheit",
    "Produktionsmethode",
    "Zollverfahren",
  ]

  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cell = sheet[XLSX.utils.encode_cell({ r: headerRow, c: C })]
    if (cell && expectedColumns.includes(cell.v)) {
      mapping[cell.v] = C
    }
  }

  const missingColumns = expectedColumns.filter((col) => !(col in mapping))
  if (missingColumns.length > 0) {
    throw new Error(`Missing required columns in Warenimporte: ${missingColumns.join(", ")}`)
  }

  return mapping
}

const processHerstellerSheet = (sheet: XLSX.WorkSheet): Supplier[] => {
  const headerRow = findHeaderRow(sheet)
  const columnMapping = mapHerstellerColumns(sheet, headerRow)
  const range = XLSX.utils.decode_range(sheet["!ref"] || "A1")
  const suppliers: Supplier[] = []

  for (let R = headerRow + 1; R <= range.e.r; ++R) {
    const nameCell = sheet[XLSX.utils.encode_cell({ r: R, c: columnMapping["Name"] })]

    // Skip empty rows (where Name is empty)
    if (!nameCell || !nameCell.v) continue

    const supplier: Supplier = {
      id: Date.now() + Math.random(), // Generate a unique ID
      name: nameCell.v,
      country: sheet[XLSX.utils.encode_cell({ r: R, c: columnMapping["Land"] })]?.v || "",
      address: {
        country: sheet[XLSX.utils.encode_cell({ r: R, c: columnMapping["Land"] })]?.v || "",
        street: sheet[XLSX.utils.encode_cell({ r: R, c: columnMapping["Straße"] })]?.v || "",
        streetNumber: sheet[XLSX.utils.encode_cell({ r: R, c: columnMapping["Hausnummer"] })]?.v || "",
        additionalLine: sheet[XLSX.utils.encode_cell({ r: R, c: columnMapping["Adresszusatz"] })]?.v || "",
        postcode: sheet[XLSX.utils.encode_cell({ r: R, c: columnMapping["Postleitzahl"] })]?.v || "",
        city: sheet[XLSX.utils.encode_cell({ r: R, c: columnMapping["Stadt"] })]?.v || "",
      },
      contactPerson: {
        name: sheet[XLSX.utils.encode_cell({ r: R, c: columnMapping["Ansprechpartner"] })]?.v || "",
        email: sheet[XLSX.utils.encode_cell({ r: R, c: columnMapping["Email-Adresse"] })]?.v || "",
        phone: sheet[XLSX.utils.encode_cell({ r: R, c: columnMapping["Telefonnummer"] })]?.v || "",
      },
      cnCodes: [],
      remarks: sheet[XLSX.utils.encode_cell({ r: R, c: columnMapping["Anmerkungen"] })]?.v || "",
      status: SupplierStatus.None,
      lastUpdate: new Date().toISOString(),
      files: [],
    }
    suppliers.push(supplier)
  }

  return suppliers
}

const processWarenimporteSheet = (sheet: XLSX.WorkSheet, period: string): GoodsImportRow[] => {
  const headerRow = findHeaderRow(sheet)
  const columnMapping = mapWarenimporteColumns(sheet, headerRow)
  const range = XLSX.utils.decode_range(sheet["!ref"] || "A1")
  const goodsImports: GoodsImportRow[] = []

  const [quarter, year] = period.split("-")
  const date = new Date(Number.parseInt(year), (Number.parseInt(quarter.slice(1)) - 1) * 3, 1)

  for (let R = headerRow + 1; R <= range.e.r; ++R) {
    const cnCodeCell = sheet[XLSX.utils.encode_cell({ r: R, c: columnMapping["CN-Code"] })]

    // Skip empty rows (where CN-Code is empty)
    if (!cnCodeCell || !cnCodeCell.v) continue

    const goodsImport: GoodsImportRow = {
      remarks: sheet[XLSX.utils.encode_cell({ r: R, c: columnMapping["Ihre Anmerkungen"] })]?.v || "",
      cnCode: cnCodeCell.v,
      manufacturer:
        sheet[XLSX.utils.encode_cell({ r: R, c: columnMapping["Hersteller / Händler / Installation"] })]?.v || "",
      quantity: sheet[XLSX.utils.encode_cell({ r: R, c: columnMapping["Warenmenge"] })]?.v || 0,
      unit: sheet[XLSX.utils.encode_cell({ r: R, c: columnMapping["Einheit"] })]?.v || "",
      productionMethod: sheet[XLSX.utils.encode_cell({ r: R, c: columnMapping["Produktionsmethode"] })]?.v || "",
      customsProcedure: sheet[XLSX.utils.encode_cell({ r: R, c: columnMapping["Zollverfahren"] })]?.v || "",
      date: date,
      quarter: period,
      importFile: `Import_${new Date().toISOString().split("T")[0]}.xlsx`,
    }
    goodsImports.push(goodsImport)
  }

  return goodsImports
}

export function ImportSuppliersDialog({ onImport }: ImportSuppliersDialogProps) {
  const [loadedFile, setLoadedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [previewData, setPreviewData] = useState<ImportPreviewData | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const { toast } = useToast()
  const { updateCompany } = useCompany()

  const processExcelFile = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: "array" })

      // Check for required sheets
      if (!workbook.SheetNames.includes("Hersteller") || !workbook.SheetNames.includes("Warenimporte")) {
        throw new Error("Excel file must contain both 'Hersteller' and 'Warenimporte' sheets")
      }

      let period = "N/A"

      // Process company info if available
      if (workbook.SheetNames.includes("Allgemeine Informationen")) {
        const companyInfo = processCompanyInfo(workbook.Sheets["Allgemeine Informationen"])
        if (Object.keys(companyInfo).length > 0) {
          updateCompany(companyInfo)
          toast({
            title: "Company Information Updated",
            description: "Company details have been updated from the imported file.",
          })
        }

        // Extract period information
        const allgemeineInformationenSheet = workbook.Sheets["Allgemeine Informationen"]
        const year = allgemeineInformationenSheet["I6"]?.v
        const quarter = allgemeineInformationenSheet["I7"]?.v
        period = year && quarter ? `Q${quarter}-${year}` : "N/A"
      }

      // Process both sheets
      const suppliers = processHerstellerSheet(workbook.Sheets["Hersteller"])
      const goodsImports = processWarenimporteSheet(workbook.Sheets["Warenimporte"], period)

      if (suppliers.length === 0) {
        throw new Error("No valid data found in the Hersteller sheet")
      }

      setPreviewData({
        suppliers,
        goodsImports,
        totalSuppliers: suppliers.length,
        totalGoodsEntries: goodsImports.length,
        period,
      })
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to process Excel file"
      setError(errorMessage)
      setLoadedFile(null)
      setPreviewData(null)
    }
  }

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null)
    setUploadSuccess(false)

    if (rejectedFiles.length > 0) {
      setError("Please upload only Excel (.xlsx) files")
      return
    }

    const file = acceptedFiles[0]
    if (file) {
      setLoadedFile(file)
      processExcelFile(file)
      setUploadSuccess(true)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    maxFiles: 1,
    multiple: false,
  })

  const handleConfirmImport = () => {
    if (previewData) {
      onImport({
        suppliers: previewData.suppliers,
        goodsImports: previewData.goodsImports,
        period: previewData.period,
      })
      setLoadedFile(null)
      setPreviewData(null)
      toast({
        title: "Success",
        description: `Imported ${previewData.totalSuppliers} suppliers and ${previewData.totalGoodsEntries} goods entries successfully.`,
      })
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const buffer = await downloadTemplate()

      // Create a Blob from the buffer
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })

      // Create a download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "customer_template.xlsx"

      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: "Template downloaded successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download template",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-4 text-center rounded-lg transition-all duration-300 h-[250px] flex flex-col items-center justify-center
            ${isDragActive ? "border-green-500 bg-green-50" : "border-gray-300 bg-gray-100 hover:bg-gray-50"}`}
      >
        <input {...getInputProps()} />
        <Upload
          className={`h-12 w-12 mb-2 transition-colors duration-300 ${isDragActive ? "text-green-500" : "text-gray-400"}`}
        />
        <p className="text-sm text-gray-600">
          {uploadSuccess
            ? "File Upload Successful"
            : isDragActive
              ? "Drop File Here"
              : "Drag and Drop Customer Template Excel File here"}
        </p>
        {/*loadedFile && (
            <div className="mt-2">
              <div className="flex items-center justify-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                <p className="text-sm text-gray-600">{loadedFile.name}</p>
              </div>
              <Button 
                onClick={(e) => {
                  e.stopPropagation()
                  setLoadedFile(null)
                  setPreviewData(null)
                  setError(null)
                }} 
                variant="outline" 
                size="sm" 
                className="mt-2"
              >
                Remove File
              </Button>
            </div>
          )*/}
      </div>
      <div className="flex justify-start">
        <Button variant="outline" size="sm" className="mt-4" onClick={handleDownloadTemplate}>
          <Download className="mr-2 h-4 w-4" />
          Template
        </Button>
      </div>
      {previewData && (
        <ImportPreviewDialog
          isOpen={true}
          onClose={() => {
            setPreviewData(null)
            setLoadedFile(null)
            setUploadSuccess(false)
          }}
          onConfirm={handleConfirmImport}
          data={previewData}
        />
      )}
    </div>
  )
}

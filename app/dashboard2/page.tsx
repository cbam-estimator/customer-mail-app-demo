// "use client"

// import { useState, useEffect } from "react"
// import { AddEditSupplier } from "@/components/SupplierGoods/Suppliers/AddEditSupplier"
// import { type Supplier, SupplierStatus, type FilterState, type SupplierFile } from "@/types/supplier"
// import type { GoodsImportRow } from "@/types/excel"
// import { cnCodes } from "@/data/cnCodes"
// import { useRouter } from "next/navigation"
// import { ImportSuppliersDialog } from "@/components/ImportSuppliersDialog"
// import type { CheckedState } from "@/components/ui/three-way-checkbox"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { FileManagementDialog } from "@/components/FileManagementDialog"
// import { FileImportHistory } from "@/components/FileImportHistory"
// import { useToast } from "@/components/ui/use-toast"
// import { EditGoodsEntryDialog } from "@/components/SupplierGoods/Goods/EditGoodsEntryDialog"
// import { AddGoodsEntryDialog } from "@/components/SupplierGoods/Goods/AddGoodsEntryDialog"
// import { SupplierGoodRecords } from "@/components/SupplierGoods/SupplierGoodRecords"
// import { SupplierGoodStatistic } from "@/components/SupplierGoodStatistic"
// import { TooltipProvider } from "@/components/ui/tooltip"

// const assignRandomCnCodes = (): string[] => {
//   const numberOfCodes = Math.floor(Math.random() * 5) // 0 to 4
//   const shuffled = [...cnCodes].sort(() => 0.5 - Math.random())
//   return shuffled.slice(0, numberOfCodes).map((code) => code.code)
// }

// interface ImportedFile {
//   id: string
//   filename: string
//   importDate: string
//   suppliers: number
//   goodsEntries: number
//   selected?: boolean
//   supplierIds: number[]
//   goodsEntryIndices: number[]
//   period: string // Added period field
// }

// // Update the initialSuppliers array to include more CN Codes and a default document

// const initialSuppliers: Supplier[] = [
//   {
//     id: 1,
//     name: "St-Steel Trading",
//     country: "Turkey",
//     cnCodes: ["7230 4332", "7432 4323", "2523 2100", "3102 1000"], // 4 CN Codes
//     status: SupplierStatus.EmissionDataReceived,
//     lastUpdate: new Date().toISOString(),
//     validUntil: new Date(2026, 0, 1).toISOString(), // January 1, 2026
//     address: {
//       country: "Turkey",
//       street: "Atayolu Sk.",
//       streetNumber: "5 c",
//       additionalLine: "",
//       postcode: "34050",
//       city: "Istanbul",
//     },
//     contactPerson: {
//       name: "Elifnur Kunt",
//       email: "st.steel@info.com",
//       phone: "0090 123 45 67",
//     },
//     remarks: "Die Beispiele werden nicht erfasst. Bitte nicht löschen.",
//     files: [
//       {
//         id: "doc-1",
//         filename: "communication_documentation.pdf",
//         dateReceived: new Date(2023, 5, 15).toISOString(),
//         documentType: "other",
//         filesize: 1245000,
//         url: "#",
//       },
//     ],
//     consultationHours: 0,
//   },
//   {
//     id: 2,
//     name: "Alu-Prods Comp.",
//     country: "China",
//     cnCodes: ["7432 4323", "2804 4000", "3102 1000"], // 3 CN Codes
//     status: SupplierStatus.SupportingDocumentsReceived,
//     lastUpdate: new Date().toISOString(),
//     validUntil: new Date(2026, 0, 1).toISOString(), // January 1, 2026
//     address: {
//       country: "China",
//       street: "On Yin St",
//       streetNumber: "12",
//       additionalLine: "",
//       postcode: "999077",
//       city: "Shanghai",
//     },
//     contactPerson: {
//       name: "Chao Zhu",
//       email: "alu-prods@info.com",
//       phone: "+852 1234 5678",
//     },
//     remarks: "",
//     files: [
//       {
//         id: "doc-2",
//         filename: "communication_documentation.pdf",
//         dateReceived: new Date(2023, 6, 10).toISOString(),
//         documentType: "other",
//         filesize: 987000,
//         url: "#",
//       },
//     ],
//     consultationHours: 0,
//   },
//   {
//     id: 3,
//     name: "Jinhua Ruifeng",
//     country: "China",
//     cnCodes: ["73084000", "7230 4332", "2523 2100", "2804 4000", "3102 1000", "7432 4323", "76169990"], // 7 CN Codes
//     status: SupplierStatus.None,
//     lastUpdate: new Date().toISOString(),
//     address: {
//       country: "China",
//       street: "Renming West Road",
//       streetNumber: "139",
//       additionalLine: "",
//       postcode: "321004",
//       city: "Jinhua",
//     },
//     contactPerson: {
//       name: "Sun",
//       email: "sun@ruifengtrading.cn",
//       phone: "0086-579-82341508",
//     },
//     remarks: "",
//     files: [
//       {
//         id: "doc-3",
//         filename: "communication_documentation.pdf",
//         dateReceived: new Date(2023, 7, 5).toISOString(),
//         documentType: "other",
//         filesize: 1056000,
//         url: "#",
//       },
//     ],
//     consultationHours: 0,
//   },
//   {
//     id: 4,
//     name: "Jinhua Huagang Athletic Equipment",
//     country: "China",
//     cnCodes: ["73269098", "7230 4332", "2523 2100", "2804 4000", "3102 1000"], // 5 CN Codes
//     status: SupplierStatus.None,
//     lastUpdate: new Date().toISOString(),
//     address: {
//       country: "China",
//       street: "Xianyuan Road",
//       streetNumber: "1118",
//       additionalLine: "",
//       postcode: "321016",
//       city: "Jinhua",
//     },
//     contactPerson: {
//       name: "Mr. Wu",
//       email: "sales@huagangtools.com",
//       phone: "0086-579-82119661",
//     },
//     remarks: "",
//     files: [
//       {
//         id: "doc-4",
//         filename: "communication_documentation.pdf",
//         dateReceived: new Date(2023, 8, 20).toISOString(),
//         documentType: "other",
//         filesize: 876000,
//         url: "#",
//       },
//     ],
//     consultationHours: 0,
//   },
//   {
//     id: 5,
//     name: "Jinhua Zhenfei Tools Co., LTD",
//     country: "China",
//     cnCodes: ["76169990", "73269098", "7230 4332", "2523 2100", "2804 4000"], // 5 CN Codes
//     status: SupplierStatus.ContactFailed,
//     lastUpdate: new Date().toISOString(),
//     address: {
//       country: "China",
//       street: "Langfeng Road",
//       streetNumber: "66",
//       additionalLine: "",
//       postcode: "321000",
//       city: "Jinhua",
//     },
//     contactPerson: {
//       name: "Chen Maoyao",
//       email: "chen_maoyao@163.com",
//       phone: "0086-579-82261800",
//     },
//     remarks: "",
//     files: [
//       {
//         id: "doc-5",
//         filename: "communication_documentation.pdf",
//         dateReceived: new Date(2023, 9, 12).toISOString(),
//         documentType: "other",
//         filesize: 1123000,
//         url: "#",
//       },
//     ],
//     consultationHours: 0,
//   },
// ]

// const initialGoodsImports: GoodsImportRow[] = [
//   {
//     remarks: "",
//     cnCode: "73084000",
//     manufacturer: "Jinhua Ruifeng", // Matches supplier 3
//     quantity: 15048,
//     unit: "Kg",
//     productionMethod: "P34 - Eisen- oder Stahlprodukte",
//     customsProcedure: "40 - Zoll- und steuerfreier Verkehr",
//   },
//   {
//     remarks: "",
//     cnCode: "73269098",
//     manufacturer: "Jinhua Huagang Athletic Equipment", // Matches supplier 4
//     quantity: 16289,
//     unit: "Kg",
//     productionMethod: "P34 - Eisen- oder Stahlprodukte",
//     customsProcedure: "40 - Zoll- und steuerfreier Verkehr",
//   },
//   {
//     remarks: "",
//     cnCode: "76169990",
//     manufacturer: "Jinhua Zhenfei Tools Co., LTD", // Matches supplier 5
//     quantity: 36159,
//     unit: "Kg",
//     productionMethod: "P45 - Aluminiumprodukte",
//     customsProcedure: "40 - Zoll- und steuerfreier Verkehr",
//   },
//   {
//     remarks: "",
//     cnCode: "73269098",
//     manufacturer: "Jinhua Zhenfei Tools Co., LTD", // Matches supplier 5
//     quantity: 4,
//     unit: "Kg",
//     productionMethod: "P34 - Eisen- oder Stahlprodukte",
//     customsProcedure: "40 - Zoll- und steuerfreier Verkehr",
//   },
// ]

// type SortConfig = {
//   key: keyof Supplier | null
//   direction: "asc" | "desc"
// }

// // Shared state
// let sharedSuppliers = initialSuppliers
// let sharedGoodsImports = initialGoodsImports
// let sharedImportedFiles: ImportedFile[] = []

// export default function Dashboard() {
//   const router = useRouter()
//   const [suppliers, setSuppliers] = useState<Supplier[]>(sharedSuppliers)
//   const [goodsImports, setGoodsImports] = useState<GoodsImportRow[]>(sharedGoodsImports)
//   const [selectedSuppliers, setSelectedSuppliers] = useState<number[]>([])
//   const [isAddEditOpen, setIsAddEditOpen] = useState(false)
//   const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
//   const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: "asc" })
//   const [isAdmin, setIsAdmin] = useState(false)
//   const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
//   const [countryFilter, setCountryFilter] = useState<FilterState>({})
//   const [statusFilter, setStatusFilter] = useState<FilterState>({})
//   const [fileManagementOpen, setFileManagementOpen] = useState(false)
//   const [selectedSupplierFiles, setSelectedSupplierFiles] = useState<SupplierFile[]>([])
//   const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null)
//   const [isFileImportSectionOpen, setIsFileImportSectionOpen] = useState(false)
//   const [importedFiles, setImportedFiles] = useState<ImportedFile[]>(sharedImportedFiles)
//   const [goodsImportFilter, setGoodsImportFilter] = useState<FilterState>({})
//   const { toast } = useToast()
//   const [editingGoodsEntry, setEditingGoodsEntry] = useState<GoodsImportRow | null>(null)
//   const [isEditGoodsEntryOpen, setIsEditGoodsEntryOpen] = useState(false)
//   const [selectedGoodsEntries, setSelectedGoodsEntries] = useState<number[]>([])
//   const [isAddGoodsEntryOpen, setIsAddGoodsEntryOpen] = useState(false)

//   const cnCodesData = cnCodes

//   useEffect(() => {
//     const storedUser = localStorage.getItem("user")
//     if (storedUser) {
//       const user = JSON.parse(storedUser)
//       setIsAdmin(user.isAdmin)
//     } else {
//       router.push("/")
//     }
//   }, [router])

//   const handleAddSupplier = () => {
//     setEditingSupplier(null)
//     setIsAddEditOpen(true)
//   }

//   const handleEditSupplier = (supplier: Supplier) => {
//     setEditingSupplier(supplier)
//     setIsAddEditOpen(true)
//   }

//   // Update the handleSaveSupplier function to set validUntil based on status
//   const handleSaveSupplier = (supplier: Supplier) => {
//     // Set validUntil to January 1, 2026 if status is Emission Data or Supporting Docs
//     const updatedSupplier = { ...supplier }
//     if (
//       supplier.status === SupplierStatus.EmissionDataReceived ||
//       supplier.status === SupplierStatus.SupportingDocumentsReceived
//     ) {
//       updatedSupplier.validUntil = new Date(2026, 0, 1).toISOString() // January 1, 2026
//     } else {
//       // For other statuses, remove the validUntil property
//       updatedSupplier.validUntil = undefined
//     }

//     if (supplier.id) {
//       const updatedSuppliers = suppliers.map((s) => (s.id === supplier.id ? updatedSupplier : s))
//       setSuppliers(updatedSuppliers)
//       sharedSuppliers = updatedSuppliers
//     } else {
//       const newSupplier = {
//         ...updatedSupplier,
//         id: suppliers.length + 1,
//         cnCodes: supplier.cnCodes.length === 0 ? assignRandomCnCodes() : supplier.cnCodes,
//         consultationHours: 0, // Initialize consultationHours for new suppliers
//       }
//       const updatedSuppliers = [...suppliers, newSupplier]
//       setSuppliers(updatedSuppliers)
//       sharedSuppliers = updatedSuppliers
//     }
//     setIsAddEditOpen(false)
//   }

//   const handleSendMail = () => {
//     const updatedSuppliers = suppliers.map((s) =>
//       selectedSuppliers.includes(s.id!) ? { ...s, status: SupplierStatus.Contacted } : s,
//     )
//     setSuppliers(updatedSuppliers)
//     sharedSuppliers = updatedSuppliers
//     setSelectedSuppliers([])
//   }

//   const handleFilterChange = (filterType: "country" | "status", key: string, value: CheckedState) => {
//     if (filterType === "country") {
//       setCountryFilter((prev) => ({ ...prev, [key]: value }))
//     } else {
//       setStatusFilter((prev) => ({ ...prev, [key]: value }))
//     }
//   }

//   const handleSort = (key: keyof Supplier) => {
//     setSortConfig((prevConfig) => ({
//       key,
//       direction: prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc",
//     }))
//   }

//   const handleRemoveSuppliers = () => {
//     const updatedSuppliers = suppliers.filter((s) => !selectedSuppliers.includes(s.id!))
//     setSuppliers(updatedSuppliers)
//     sharedSuppliers = updatedSuppliers
//     setSelectedSuppliers([])
//   }

//   const handleSelectSupplier = (id: number, checked: boolean) => {
//     if (checked) {
//       setSelectedSuppliers((prev) => [...prev, id])
//     } else {
//       setSelectedSuppliers((prev) => prev.filter((supplierId) => supplierId !== id))
//     }
//   }

//   const handleImport = (data: { suppliers: Supplier[]; goodsImports: GoodsImportRow[]; period: string }) => {
//     // Update suppliers with the imported data, ensuring unique IDs and assigning random CN Codes
//     const lastId = suppliers.length > 0 ? Math.max(...suppliers.map((s) => s.id || 0)) : 0
//     const newSuppliers = data.suppliers.map((supplier, index) => ({
//       ...supplier,
//       id: lastId + index + 1,
//       cnCodes: supplier.cnCodes.length === 0 ? assignRandomCnCodes() : supplier.cnCodes,
//     }))
//     const updatedSuppliers = [...suppliers, ...newSuppliers]
//     setSuppliers(updatedSuppliers)
//     sharedSuppliers = updatedSuppliers

//     // Update goods imports
//     const lastGoodsIndex = goodsImports.length
//     const updatedGoodsImports = [...goodsImports, ...data.goodsImports]
//     setGoodsImports(updatedGoodsImports)
//     sharedGoodsImports = updatedGoodsImports

//     // Add the imported file to the history
//     const newImportedFile: ImportedFile = {
//       id: Date.now().toString(),
//       filename: `Import_${new Date().toISOString().split("T")[0]}.xlsx`,
//       importDate: new Date().toLocaleDateString("en-GB"),
//       period: data.period, // Add this line
//       suppliers: newSuppliers.length,
//       goodsEntries: data.goodsImports.length,
//       supplierIds: newSuppliers.map((s) => s.id as number),
//       goodsEntryIndices: Array.from({ length: data.goodsImports.length }, (_, i) => lastGoodsIndex + i),
//     }
//     const updatedImportedFiles = [newImportedFile, ...importedFiles]
//     setImportedFiles(updatedImportedFiles)
//     sharedImportedFiles = updatedImportedFiles

//     setIsImportDialogOpen(false)
//   }

//   const handleFileDownload = (fileId: string) => {
//     const file = importedFiles.find((f) => f.id === fileId)
//     if (file) {
//       // In a real application, you would generate the file content here
//       const fileContent = `Dummy content for ${file.filename}`
//       const blob = new Blob([fileContent], { type: "text/plain" })
//       const url = URL.createObjectURL(blob)
//       const link = document.createElement("a")
//       link.href = url
//       link.download = file.filename
//       document.body.appendChild(link)
//       link.click()
//       document.body.removeChild(link)
//       URL.revokeObjectURL(url)
//       toast({
//         title: "File Downloaded",
//         description: `${file.filename} has been downloaded.`,
//       })
//     }
//   }

//   const handleFileUndo = (fileId: string) => {
//     const file = importedFiles.find((f) => f.id === fileId)
//     if (file) {
//       // Remove the suppliers associated with this file
//       const updatedSuppliers = suppliers.filter((s) => !file.supplierIds.includes(s.id as number))
//       setSuppliers(updatedSuppliers)
//       sharedSuppliers = updatedSuppliers
//       // Remove the goods entries associated with this file
//       const updatedGoodsImports = goodsImports.filter((_, index) => !file.goodsEntryIndices.includes(index))
//       setGoodsImports(updatedGoodsImports)
//       sharedGoodsImports = updatedGoodsImports
//       // Remove the file from the import history
//       const updatedImportedFiles = importedFiles.filter((f) => f.id !== fileId)
//       setImportedFiles(updatedImportedFiles)
//       sharedImportedFiles = updatedImportedFiles
//       toast({
//         title: "Import Undone",
//         description: `The import of ${file.filename} has been undone.`,
//       })
//     }
//   }

//   const handleFileSelect = (fileId: string, selected: boolean) => {
//     const updatedImportedFiles = importedFiles.map((file) => (file.id === fileId ? { ...file, selected } : file))
//     setImportedFiles(updatedImportedFiles)
//     sharedImportedFiles = updatedImportedFiles

//     const selectedFile = importedFiles.find((f) => f.id === fileId)
//     if (selectedFile) {
//       setSelectedSuppliers((prevSelected) => {
//         if (selected) {
//           return [...new Set([...prevSelected, ...selectedFile.supplierIds])]
//         } else {
//           return prevSelected.filter((id) => !selectedFile.supplierIds.includes(id))
//         }
//       })
//       setSelectedGoodsEntries((prevSelected) => {
//         if (selected) {
//           return [...new Set([...prevSelected, ...selectedFile.goodsEntryIndices])]
//         } else {
//           return prevSelected.filter((index) => !selectedFile.goodsEntryIndices.includes(index))
//         }
//       })
//     }
//   }

//   const handleFileIconClick = (supplier: Supplier) => {
//     setSelectedSupplierFiles(supplier.files)
//     setSelectedSupplierId(supplier.id!)
//     setFileManagementOpen(true)
//   }

//   const handleFileUpload = (file: File, documentType: string) => {
//     const newFile: SupplierFile = {
//       id: Date.now().toString(),
//       filename: file.name,
//       dateReceived: new Date().toISOString(),
//       documentType: documentType as "emission data" | "supporting document" | "other",
//       filesize: file.size,
//       url: URL.createObjectURL(file),
//     }

//     const updatedSuppliers = suppliers.map((s) =>
//       s.id === selectedSupplierId ? { ...s, files: [...s.files, newFile] } : s,
//     )
//     setSuppliers(updatedSuppliers)
//     sharedSuppliers = updatedSuppliers

//     setSelectedSupplierFiles((prev) => [...prev, newFile])
//   }

//   const handleGoodsImportFilterChange = (key: string, value: CheckedState) => {
//     setGoodsImportFilter((prev) => ({ ...prev, [key]: value }))
//   }

//   const handleSelectAllGoodsEntries = (checked: boolean) => {
//     if (checked) {
//       setSelectedGoodsEntries(goodsImports.map((_, index) => index))
//     } else {
//       setSelectedGoodsEntries([])
//     }
//   }

//   const handleSelectGoodsEntry = (index: number, checked: boolean) => {
//     if (checked) {
//       setSelectedGoodsEntries((prev) => [...prev, index])
//     } else {
//       setSelectedGoodsEntries((prev) => prev.filter((i) => i !== index))
//     }
//   }

//   const handleEditGoodsEntry = (entry: GoodsImportRow) => {
//     setEditingGoodsEntry({ ...entry })
//     setIsEditGoodsEntryOpen(true)
//   }

//   const handleSaveGoodsEntry = (updatedEntry: GoodsImportRow) => {
//     setGoodsImports((prevGoodsImports) =>
//       prevGoodsImports.map((entry) =>
//         entry.cnCode === updatedEntry.cnCode && entry.manufacturer === updatedEntry.manufacturer ? updatedEntry : entry,
//       ),
//     )
//     setEditingGoodsEntry(null)
//     setIsEditGoodsEntryOpen(false)
//     toast({
//       title: "Entry Updated",
//       description: "The goods entry has been successfully updated.",
//     })
//   }

//   const handleAddGoodsEntry = () => {
//     setIsAddGoodsEntryOpen(true)
//   }

//   const handleSaveGoodsEntryNew = (newEntry: GoodsImportRow) => {
//     setGoodsImports((prevGoodsImports) => [...prevGoodsImports, newEntry])
//     toast({
//       title: "Entry Added",
//       description: "The new goods entry has been successfully added.",
//     })
//   }

//   const handleDeleteGoodsEntry = (index: number) => {
//     setGoodsImports((prevGoodsImports) => prevGoodsImports.filter((_, i) => i !== index))
//     toast({
//       title: "Entry Deleted",
//       description: "The goods entry has been successfully deleted.",
//     })
//   }

//   const handleDeleteSelectedGoodsEntries = () => {
//     setGoodsImports((prevGoodsImports) => prevGoodsImports.filter((_, index) => !selectedGoodsEntries.includes(index)))
//     setSelectedGoodsEntries([])
//     toast({
//       title: "Entries Deleted",
//       description: `${selectedGoodsEntries.length} goods entries have been successfully deleted.`,
//     })
//   }

//   // Also update the handleUpdateSupplier function to maintain the same logic
//   const handleUpdateSupplier = (updatedSupplier: Supplier) => {
//     // Apply the same validUntil logic
//     if (
//       updatedSupplier.status === SupplierStatus.EmissionDataReceived ||
//       updatedSupplier.status === SupplierStatus.SupportingDocumentsReceived
//     ) {
//       updatedSupplier.validUntil = new Date(2026, 0, 1).toISOString() // January 1, 2026
//     } else {
//       // For other statuses, remove the validUntil property
//       updatedSupplier.validUntil = undefined
//     }

//     const updatedSuppliers = suppliers.map((s) => (s.id === updatedSupplier.id ? updatedSupplier : s))
//     setSuppliers(updatedSuppliers)
//     sharedSuppliers = updatedSuppliers
//   }

//   const stats = {
//     existing: suppliers.length,
//     contacted: suppliers.filter((s) => s.status !== SupplierStatus.None).length,
//     pending: suppliers.filter((s) => s.status === SupplierStatus.Pending).length,
//     emissionDataReceived: suppliers.filter((s) => s.status === SupplierStatus.EmissionDataReceived).length,
//     supportingDocumentsReceived: suppliers.filter((s) => s.status === SupplierStatus.SupportingDocumentsReceived)
//       .length,
//     contactFailed: suppliers.filter((s) => s.status === SupplierStatus.ContactFailed).length,
//   }

//   return (
//     <TooltipProvider>
//       <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8">
//         <Card className="mt-8 mb-8">
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-xl font-semibold">Dashboard</CardTitle>
//           </CardHeader>
//           <CardContent className="border-t pt-4">
//             <SupplierGoodStatistic stats={stats} />
//           </CardContent>
//         </Card>

//         <Card className="mt-8 mb-8">
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-xl font-semibold">File Imports</CardTitle>
//           </CardHeader>
//           <CardContent className="border-t pt-4">
//             <div className="flex space-x-6">
//               <div className="w-1/3">
//                 <ImportSuppliersDialog onImport={(data) => handleImport(data)} />
//               </div>
//               <div className="w-2/3">
//                 <div className="overflow-auto max-h-[450px]">
//                   <FileImportHistory
//                     importedFiles={importedFiles}
//                     onDownload={handleFileDownload}
//                     onUndo={handleFileUndo}
//                     onSelect={handleFileSelect}
//                     hasImportedFiles={importedFiles.length > 0}
//                   />
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         <SupplierGoodRecords
//           suppliers={suppliers}
//           goodsImports={goodsImports}
//           selectedSuppliers={selectedSuppliers}
//           selectedGoodsEntries={selectedGoodsEntries}
//           isAdmin={isAdmin}
//           countryFilter={countryFilter}
//           statusFilter={statusFilter}
//           goodsImportFilter={goodsImportFilter}
//           sortConfig={sortConfig}
//           onAddSupplier={handleAddSupplier}
//           onEditSupplier={handleEditSupplier}
//           onRemoveSuppliers={handleRemoveSuppliers}
//           onSendMail={handleSendMail}
//           onSelectSupplier={handleSelectSupplier}
//           onSelectAllSuppliers={(checked) => {
//             if (checked) {
//               setSelectedSuppliers(suppliers.map((s) => s.id!))
//             } else {
//               setSelectedSuppliers([])
//             }
//           }}
//           onFilterChange={handleFilterChange}
//           onSort={handleSort}
//           onFileIconClick={handleFileIconClick}
//           onEditGoodsEntry={handleEditGoodsEntry}
//           onDeleteGoodsEntry={handleDeleteGoodsEntry}
//           onSelectGoodsEntry={handleSelectGoodsEntry}
//           onSelectAllGoodsEntries={handleSelectAllGoodsEntries}
//           onGoodsImportFilterChange={handleGoodsImportFilterChange}
//           onAddGoodsEntry={handleAddGoodsEntry}
//           onDeleteSelectedGoodsEntries={handleDeleteSelectedGoodsEntries}
//           onUpdateSupplier={handleUpdateSupplier}
//         />

//         {isAddEditOpen && (
//           <AddEditSupplier
//             supplier={editingSupplier}
//             onSave={handleSaveSupplier}
//             onCancel={() => setIsAddEditOpen(false)}
//             isAdmin={isAdmin}
//           />
//         )}
//         <FileManagementDialog
//           isOpen={fileManagementOpen}
//           onClose={() => setFileManagementOpen(false)}
//           files={selectedSupplierFiles}
//           onUpload={handleFileUpload}
//           isAdmin={isAdmin}
//         />
//         {editingGoodsEntry && (
//           <EditGoodsEntryDialog
//             isOpen={isEditGoodsEntryOpen}
//             onClose={() => setIsEditGoodsEntryOpen(false)}
//             onSave={handleSaveGoodsEntry}
//             entry={editingGoodsEntry}
//           />
//         )}
//         <AddGoodsEntryDialog
//           isOpen={isAddGoodsEntryOpen}
//           onClose={() => setIsAddGoodsEntryOpen(false)}
//           onSave={handleSaveGoodsEntryNew}
//         />
//       </div>
//     </TooltipProvider>
//   )
// }

"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ImportSuppliersDialog } from "./ImportSuppliersDialog"
import { FileImportHistory } from "./FileImportHistory"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileSpreadsheet, FileUp, Database, Clock, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { ImportedFile } from "@/types/excel"

interface ImportDataModalProps {
  isOpen: boolean
  onClose: () => void
  importedFiles: ImportedFile[]
  onImport: (data: { suppliers: any[]; goodsImports: any[]; period: string }) => void
  onDownload: (fileId: string) => void
  onUndo: (fileId: string) => void
  onSelect: (fileId: string, selected: boolean) => void
  title?: string
}

export function ImportDataModal({
  isOpen,
  onClose,
  importedFiles,
  onImport,
  onDownload,
  onUndo,
  onSelect,
  title = "Import Data",
}: ImportDataModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>([])
  const [remarks, setRemarks] = useState("")

  // Reset selected method when modal closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedMethod(null)
      setSelectedDataTypes([])
      setRemarks("")
      onClose()
    }
  }

  const handleBackClick = () => {
    setSelectedMethod(null)
  }

  const handleDataTypeToggle = (dataType: string) => {
    setSelectedDataTypes((prev) =>
      prev.includes(dataType) ? prev.filter((type) => type !== dataType) : [...prev, dataType],
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {selectedMethod ? (
              <div className="flex items-center">
                <Button variant="ghost" size="sm" className="mr-2 -ml-2" onClick={handleBackClick}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                {selectedMethod === "template" ? "Import from Template" : "Import from Other Sources"}
              </div>
            ) : (
              "Import Data"
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-auto max-h-[calc(80vh-120px)]">
          {!selectedMethod ? (
            // Initial selection screen
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 max-w-3xl mx-auto">
              <Card
                className="cursor-pointer hover:border-primary hover:shadow-md transition-all"
                onClick={() => setSelectedMethod("template")}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3">
                    <FileSpreadsheet className="h-9 w-9 text-green-600" />
                    Import from Template
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="min-h-[60px] text-sm">
                    Use the CBAM-Estimator Template as an easy and quick way to import your supplier and goods import
                    data
                  </CardDescription>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:border-primary hover:shadow-md transition-all"
                onClick={() => setSelectedMethod("other")}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3">
                    <Database className="h-9 w-9 text-purple-600" />
                    Import from Other Sources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="min-h-[60px] text-sm">
                    For example customs or import documents, pictures or pdf files
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Import method content
            <div className="flex flex-col space-y-6">
              {selectedMethod === "template" && (
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
                  <div className="w-full md:w-1/3">
                    <h3 className="text-lg font-medium mb-3">CBAM Template Import</h3>
                    <ImportSuppliersDialog onImport={onImport} />
                  </div>
                  <div className="w-full md:w-2/3">
                    <h3 className="text-lg font-medium mb-3">Import History</h3>
                    <div className="overflow-auto max-h-[450px]">
                      <FileImportHistory
                        importedFiles={importedFiles}
                        onDownload={onDownload}
                        onUndo={onUndo}
                        onSelect={onSelect}
                        hasImportedFiles={importedFiles.length > 0}
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedMethod === "other" && (
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
                  <div className="w-full md:w-1/3">
                    <h3 className="text-lg font-medium mb-3">Other Sources Import</h3>
                    <div className="border rounded-lg p-4 h-full">
                      <div className="flex flex-col space-y-4">
                        <div>
                          <p className="text-sm font-medium mb-2">Select data types to import:</p>
                          <div className="space-y-2">
                            {[
                              "Supplier Data",
                              "Goods Imports Data",
                              "Emission Data",
                              "Supporting Documents",
                              "Other",
                            ].map((type) => (
                              <div key={type} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`data-type-${type}`}
                                  checked={selectedDataTypes.includes(type)}
                                  onCheckedChange={() => handleDataTypeToggle(type)}
                                />
                                <Label htmlFor={`data-type-${type}`}>{type}</Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="remarks" className="text-sm font-medium">
                            Remarks
                          </Label>
                          <Textarea
                            id="remarks"
                            placeholder="Add any additional context or comments here..."
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className="mt-1"
                          />
                        </div>

                        <div className="flex items-center justify-center w-full mt-2">
                          <label
                            htmlFor="dropzone-file-other"
                            className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <FileUp className="w-10 h-10 mb-3 text-gray-400" />
                              <p className="mb-2 text-sm text-gray-500 text-center">
                                <span className="font-semibold">Drag and Drop your Files here</span>
                              </p>
                              <p className="text-xs text-gray-500 text-center">.xlsx, .pdf, .word, .zip are allowed</p>
                            </div>
                            <input id="dropzone-file-other" type="file" className="hidden" />
                          </label>
                        </div>
                        <div className="flex items-center text-amber-600 bg-amber-50 p-3 rounded-lg w-full">
                          <Clock className="h-5 w-5 mr-2" />
                          <span className="text-sm">Our Experts are reviewing your files within 24 hours.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full md:w-2/3">
                    <h3 className="text-lg font-medium mb-3">Upload History</h3>
                    <div className="overflow-auto max-h-[450px]">
                      <FileImportHistory
                        importedFiles={importedFiles.filter((file) => file.filename.includes("other"))}
                        onDownload={onDownload}
                        onUndo={onUndo}
                        onSelect={onSelect}
                        hasImportedFiles={importedFiles.some((file) => file.filename.includes("other"))}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

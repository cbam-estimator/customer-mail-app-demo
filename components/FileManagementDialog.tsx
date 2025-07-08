"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { SupplierFile } from "@/types/supplier"
import { FileIcon, DownloadIcon, UploadIcon, Trash2, Calendar, FileType, HardDrive, FolderOpen } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface FileManagementDialogProps {
  isOpen: boolean
  onClose: () => void
  files: SupplierFile[]
  onUpload: (file: File, documentType: string) => void
  onDelete?: (fileId: string) => void
  isAdmin: boolean
}

export function FileManagementDialog({
  isOpen,
  onClose,
  files,
  onUpload,
  onDelete = () => {},
  isAdmin,
}: FileManagementDialogProps) {
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<string>("other")
  const [viewMode, setViewMode] = useState<"table" | "card">("card")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0])
    }
  }

  const handleUpload = () => {
    if (uploadFile) {
      onUpload(uploadFile, documentType)
      setUploadFile(null)
      setDocumentType("other")
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB"
    else return (bytes / 1048576).toFixed(2) + " MB"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] p-0">
        <div className="flex flex-row items-center justify-between space-y-0 py-4 px-6 border-b">
          <DialogTitle className="text-xl font-semibold my-0">File Management</DialogTitle>
          <div className="flex space-x-2">
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("table")}
            >
              Table View
            </Button>
            <Button variant={viewMode === "card" ? "default" : "outline"} size="sm" onClick={() => setViewMode("card")}>
              Card View
            </Button>
          </div>
        </div>

        <div className="px-6 py-4">
          {viewMode === "table" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Filename</TableHead>
                  <TableHead>Date Received</TableHead>
                  <TableHead>Document Type</TableHead>
                  <TableHead>File Size</TableHead>
                  <TableHead>Download</TableHead>
                  {isAdmin && <TableHead>Delete</TableHead>}
                </TableRow>
              </TableHeader>
              {/* Table body removed in favor of card view */}
            </Table>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
              {files.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
                  <div className="relative mb-6">
                    <div
                      className="absolute inset-0 bg-blue-50 rounded-full opacity-30"
                      style={{ transform: "scale(0.85)" }}
                    ></div>
                    <FolderOpen className="h-24 w-24 text-blue-400 relative z-10" strokeWidth={1.5} />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/3">
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-blue-200"
                      >
                        <path d="M12 9V15M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No files yet</h3>
                  <p className="text-center text-gray-500 max-w-xs">
                    Upload your first file using the form below to get started.
                  </p>
                </div>
              ) : (
                files.map((file) => (
                  <Card key={file.id} className="shadow-sm hover:shadow transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start mb-3">
                        <div className="bg-blue-50 p-2 rounded-lg mr-3">
                          <FileIcon className="h-6 w-6 text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1 line-clamp-1">{file.filename}</h4>
                          <div className="flex items-center text-sm text-gray-500 mb-1">
                            <FileType className="h-3.5 w-3.5 mr-1.5" />
                            <span className="capitalize">{file.documentType}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center text-gray-500">
                          <Calendar className="h-3.5 w-3.5 mr-1.5" />
                          <span>{new Date(file.dateReceived).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-gray-500">
                          <HardDrive className="h-3.5 w-3.5 mr-1.5" />
                          <span>{formatFileSize(file.filesize)}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="px-4 py-3 bg-gray-50 flex justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(file.url, "_blank")}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      >
                        <DownloadIcon className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(file.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          )}

          {isAdmin && (
            <div className="mt-6 border-t pt-4">
              <h3 className="font-medium mb-3">Upload New File</h3>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Input type="file" onChange={handleFileChange} className="max-w-[300px]" />
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Document Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emission data">Emission Data</SelectItem>
                    <SelectItem value="supporting document">Supporting Document</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleUpload} disabled={!uploadFile}>
                  <UploadIcon className="mr-2 h-4 w-4" />
                  Upload File
                </Button>
              </div>
              <div className="text-xs text-gray-500 mb-2">Select a file and document type before uploading</div>
            </div>
          )}
        </div>

        {/* Footer removed since upload button was moved to content area */}
        <div className="flex justify-end items-center gap-2 px-6 py-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

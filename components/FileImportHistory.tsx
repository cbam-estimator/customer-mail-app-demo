"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, Undo, Package } from "lucide-react"

interface ImportedFile {
  id: string
  filename: string
  importDate: string
  period: string
  suppliers: number
  goodsEntries: number
  selected?: boolean
}

interface FileImportHistoryProps {
  importedFiles: ImportedFile[]
  onDownload: (fileId: string) => void
  onUndo: (fileId: string) => void
  onSelect: (fileId: string, selected: boolean) => void
  hasImportedFiles: boolean
}

export function FileImportHistory({
  importedFiles,
  onDownload,
  onUndo,
  onSelect,
  hasImportedFiles,
}: FileImportHistoryProps) {
  const filledRows = importedFiles.slice(0, 4)
  const emptyRows = Array(Math.max(0, 4 - filledRows.length)).fill(null)
  return (
    <div className="border rounded-lg overflow-hidden relative">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">Select</TableHead>
            <TableHead>Filename</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Period</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hasImportedFiles ? (
            <>
              {filledRows.map((file) => (
                <TableRow key={file.id} className="h-[60px]">
                  <TableCell>
                    <Checkbox
                      checked={file.selected}
                      onCheckedChange={(checked) => onSelect(file.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{file.filename}</TableCell>
                  <TableCell>{file.importDate}</TableCell>
                  <TableCell>{file.period}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => onDownload(file.id)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => onUndo(file.id)}>
                        <Undo className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {emptyRows.map((_, index) => (
                <TableRow key={`empty-${index}`} className="h-[60px]">
                  <TableCell colSpan={5}></TableCell>
                </TableRow>
              ))}
            </>
          ) : (
            <TableRow className="h-[300px]">
              <TableCell colSpan={5} className="relative"></TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {!hasImportedFiles && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">Nothing imported yet</p>
          </div>
        </div>
      )}
    </div>
  )
}

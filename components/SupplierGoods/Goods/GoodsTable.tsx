"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import type { GoodsImportRow } from "@/types/excel"
import { Edit, Trash2, ChevronRight } from "lucide-react"
import { isValid } from "date-fns"

interface GoodsTableProps {
  goodsImports: GoodsImportRow[]
  selectedGoodsEntries: number[]
  onEditGoodsEntry: (entry: GoodsImportRow) => void
  onDeleteGoodsEntry: (index: number) => void
  onSelectGoodsEntry: (index: number, checked: boolean) => void
  onSelectAllGoodsEntries: (checked: boolean) => void
  availableQuarters: string[]
  activeQuarter: string | null
  onQuarterFilterChange: (quarter: string) => void
}

export function GoodsTable({
  goodsImports,
  selectedGoodsEntries,
  onEditGoodsEntry,
  onDeleteGoodsEntry,
  onSelectGoodsEntry,
  onSelectAllGoodsEntries,
  availableQuarters,
  activeQuarter,
  onQuarterFilterChange,
}: GoodsTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  const toggleRowExpansion = (index: number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  // Calculate emissions for a goods entry
  const calculateEmissions = (entry: GoodsImportRow) => {
    const seeDirect = entry.seeDirect || 0
    const seeIndirect = entry.seeIndirect || 0
    const quantity = entry.quantity || 0
    return (seeDirect + seeIndirect) * quantity
  }

  return (
    <>
      <div className="mb-4 flex space-x-2">
        {availableQuarters.map((quarter) => (
          <Button
            key={quarter}
            variant={activeQuarter === quarter ? "default" : "outline"}
            onClick={() => onQuarterFilterChange(quarter)}
          >
            {quarter}
          </Button>
        ))}
      </div>

      <div className="overflow-hidden border rounded-md">
        <div className="overflow-x-auto">
          <Table className="min-w-[1500px]">
            <TableHeader className="sticky top-0 z-10 bg-white">
              <TableRow>
                <TableHead className="w-[60px]">#</TableHead>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedGoodsEntries.length === goodsImports.length && goodsImports.length > 0}
                    onCheckedChange={(checked) => onSelectAllGoodsEntries(checked as boolean)}
                  />
                </TableHead>
                <TableHead className="w-[120px]">CN Code</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="w-[150px]">Quantity</TableHead>
                <TableHead>Production Method</TableHead>
                <TableHead>Customs Procedure</TableHead>
                <TableHead>SEE Direct</TableHead>
                <TableHead>SEE Indirect</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Quarter</TableHead>
                <TableHead>Import File</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {goodsImports.map((goodsImport, index) => (
                <>
                  <TableRow key={index} className={expandedRows.has(index) ? "border-b-0" : ""}>
                    <TableCell className="text-gray-400 font-mono text-sm w-12">
                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 mr-2 h-6 w-6"
                          onClick={() => toggleRowExpansion(index)}
                        >
                          <ChevronRight
                            className={`h-4 w-4 transition-transform ${expandedRows.has(index) ? "rotate-90" : ""}`}
                          />
                        </Button>
                        {String(index + 1).padStart(3, "0")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={selectedGoodsEntries.includes(index)}
                        onCheckedChange={(checked) => onSelectGoodsEntry(index, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-mono">{goodsImport.cnCode || "-"}</TableCell>
                    <TableCell>{goodsImport.manufacturer || "-"}</TableCell>
                    <TableCell>
                      <div className="flex justify-end font-mono">
                        <span className="text-right">
                          {goodsImport.quantity !== undefined ? goodsImport.quantity : "-"}
                        </span>
                        <span className="text-gray-500 ml-2">{goodsImport.unit || "Kg"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {goodsImport.productionMethod ? (
                        goodsImport.productionMethod.match(/^P\d{2} - /) ? (
                          <div>
                            <span className="font-bold">{goodsImport.productionMethod.slice(0, 3)}</span>
                            <br />
                            <span className="text-gray-500">{goodsImport.productionMethod.slice(5)}</span>
                          </div>
                        ) : (
                          goodsImport.productionMethod
                        )
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {goodsImport.customsProcedure ? (
                        goodsImport.customsProcedure.match(/^\d{2} - /) ? (
                          <div>
                            <span className="font-bold">{goodsImport.customsProcedure.slice(0, 2)}</span>
                            <br />
                            <span className="text-gray-500">{goodsImport.customsProcedure.slice(5)}</span>
                          </div>
                        ) : (
                          goodsImport.customsProcedure
                        )
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="font-mono">
                      {goodsImport.seeDirect !== undefined ? goodsImport.seeDirect.toFixed(2) : "-"}
                    </TableCell>
                    <TableCell className="font-mono">
                      {goodsImport.seeIndirect !== undefined ? goodsImport.seeIndirect.toFixed(2) : "-"}
                    </TableCell>
                    <TableCell>{goodsImport.remarks || "-"}</TableCell>
                    <TableCell>
                      {goodsImport.date && isValid(new Date(goodsImport.date))
                        ? new Date(goodsImport.date).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>{goodsImport.quarter || "-"}</TableCell>
                    <TableCell>{goodsImport.importFile || "-"}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => onEditGoodsEntry(goodsImport)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the goods entry.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDeleteGoodsEntry(index)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedRows.has(index) && (
                    <TableRow key={`expanded-${index}`} className="bg-gray-50">
                      <TableCell colSpan={13} className="p-4">
                        <div className="pl-8">
                          <h4 className="font-medium mb-2">Emissions Details</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded border">
                              <h5 className="text-sm font-medium mb-2">Emissions Factors</h5>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <div className="text-xs text-gray-500">SEE Direct</div>
                                  <div className="font-medium">
                                    {goodsImport.seeDirect?.toFixed(2) || "-"} kg CO₂e/kg
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">SEE Indirect</div>
                                  <div className="font-medium">
                                    {goodsImport.seeIndirect?.toFixed(2) || "-"} kg CO₂e/kg
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Total Factor</div>
                                  <div className="font-medium">
                                    {((goodsImport.seeDirect || 0) + (goodsImport.seeIndirect || 0)).toFixed(2)} kg
                                    CO₂e/kg
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="bg-white p-4 rounded border">
                              <h5 className="text-sm font-medium mb-2">Total Emissions</h5>
                              <div className="text-2xl font-bold text-green-600">
                                {calculateEmissions(goodsImport).toLocaleString()} kg CO₂e
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Based on {goodsImport.quantity.toLocaleString()} kg of material
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  )
}

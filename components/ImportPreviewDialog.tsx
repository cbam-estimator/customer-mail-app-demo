"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ImportPreviewData, Supplier, GoodsImportRow } from "@/types/excel"

interface ImportPreviewDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: { suppliers: Supplier[]; goodsImports: GoodsImportRow[]; period: string }) => void
  data: ImportPreviewData
}

export function ImportPreviewDialog({ isOpen, onClose, onConfirm, data }: ImportPreviewDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Preview</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">Suppliers to import</div>
              <div className="text-2xl font-bold">{data.totalSuppliers}</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">Goods entries</div>
              <div className="text-2xl font-bold">{data.totalGoodsEntries}</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">Period</div>
              <div className="text-2xl font-bold">{data.period}</div>
            </div>
          </div>

          <Tabs defaultValue="suppliers">
            <TabsList className="mb-4">
              <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
              <TabsTrigger value="goods">Goods Entries</TabsTrigger>
            </TabsList>

            <TabsContent value="suppliers">
              <ScrollArea className="h-[400px] rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Contact Person</TableHead>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.suppliers.map((supplier, index) => (
                      <TableRow key={supplier.id || index}>
                        <TableCell className="font-medium">{supplier.name}</TableCell>
                        <TableCell>
                          {supplier.address.street} {supplier.address.streetNumber}
                          {supplier.address.additionalLine && (
                            <div className="text-sm text-muted-foreground">{supplier.address.additionalLine}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          {supplier.address.postcode} {supplier.address.city}
                        </TableCell>
                        <TableCell>{supplier.address.country}</TableCell>
                        <TableCell>{supplier.contactPerson.name}</TableCell>
                        <TableCell>{supplier.contactPerson.email}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="goods">
              <ScrollArea className="h-[400px] rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>CN Code</TableHead>
                      <TableHead>Manufacturer</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Production Method</TableHead>
                      <TableHead>Customs Procedure</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.goodsImports.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{entry.cnCode}</TableCell>
                        <TableCell>{entry.manufacturer}</TableCell>
                        <TableCell>{entry.quantity}</TableCell>
                        <TableCell>{entry.unit}</TableCell>
                        <TableCell>{entry.productionMethod}</TableCell>
                        <TableCell>{entry.customsProcedure}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              onConfirm({
                suppliers: data.suppliers,
                goodsImports: data.goodsImports,
                period: data.period,
              })
            }
          >
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

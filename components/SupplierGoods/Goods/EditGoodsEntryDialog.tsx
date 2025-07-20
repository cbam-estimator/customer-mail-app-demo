"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { GoodsImportRow } from "@/types/excel";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, isValid } from "date-fns";
import { cn } from "@/lib/utils";

interface EditGoodsEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedEntry: GoodsImportRow) => void;
  entry: GoodsImportRow | null;
}

export function EditGoodsEntryDialog({
  isOpen,
  onClose,
  onSave,
  entry,
}: EditGoodsEntryDialogProps) {
  const [editedEntry, setEditedEntry] = useState<GoodsImportRow>({
    id: 1,
    remarks: "",
    cnCode: "",
    manufacturer: "",
    quantity: 0,
    unit: "",
    productionMethod: "",
    customsProcedure: "",
    date: new Date(),
    quarter: "",
    importFile: "",
    seeDirect: 0,
    seeIndirect: 0,
    supplierId: 1,
  });
  const [date, setDate] = useState<Date>(editedEntry.date || new Date());

  useEffect(() => {
    if (entry) {
      // If the entry doesn't have SEE values, add default ones
      const entryWithSEE = {
        ...entry,
        seeDirect:
          entry.seeDirect !== undefined
            ? entry.seeDirect
            : Number.parseFloat((Math.random() * 3 + 1.5).toFixed(2)),
        seeIndirect:
          entry.seeIndirect !== undefined
            ? entry.seeIndirect
            : Number.parseFloat((Math.random() * 3 + 1.5).toFixed(2)),
      };
      setEditedEntry(entryWithSEE);
      setDate(
        entry.date && isValid(new Date(entry.date))
          ? new Date(entry.date)
          : new Date()
      );
    }
  }, [entry]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedEntry((prev) => ({
      ...prev,
      [name]:
        name === "quantity" || name === "seeDirect" || name === "seeIndirect"
          ? Number.parseFloat(value)
          : value,
    }));
  };

  const getQuarter = (date: Date) => {
    const month = date.getMonth();
    return `Q${Math.floor(month / 3) + 1}-${date.getFullYear()}`;
  };

  const handleSave = () => {
    onSave({
      ...editedEntry,
      date: isValid(date) ? date : new Date(),
      quarter: getQuarter(isValid(date) ? date : new Date()),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Goods Entry</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cnCode" className="text-right">
              CN Code
            </Label>
            <Input
              id="cnCode"
              name="cnCode"
              value={editedEntry.cnCode}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="manufacturer" className="text-right">
              Manufacturer
            </Label>
            <Input
              id="manufacturer"
              name="manufacturer"
              value={editedEntry.manufacturer}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Quantity
            </Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              value={editedEntry.quantity}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="unit" className="text-right">
              Unit
            </Label>
            <Input
              id="unit"
              name="unit"
              value={editedEntry.unit}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="productionMethod" className="text-right">
              Production Method
            </Label>
            <Input
              id="productionMethod"
              name="productionMethod"
              value={editedEntry.productionMethod}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="customsProcedure" className="text-right">
              Customs Procedure
            </Label>
            <Input
              id="customsProcedure"
              name="customsProcedure"
              value={editedEntry.customsProcedure}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="seeDirect" className="text-right">
              SEE Direct
            </Label>
            <Input
              id="seeDirect"
              name="seeDirect"
              type="number"
              step="0.01"
              min="0"
              value={editedEntry.seeDirect}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="seeIndirect" className="text-right">
              SEE Indirect
            </Label>
            <Input
              id="seeIndirect"
              name="seeIndirect"
              type="number"
              step="0.01"
              min="0"
              value={editedEntry.seeIndirect}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="remarks" className="text-right">
              Remarks
            </Label>
            <Input
              id="remarks"
              name="remarks"
              value={editedEntry.remarks}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quarter" className="text-right">
              Quarter
            </Label>
            <Input
              id="quarter"
              value={getQuarter(date)}
              className="col-span-3"
              readOnly
            />
          </div>
          {editedEntry.importFile && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="importFile" className="text-right">
                Import File
              </Label>
              <Input
                id="importFile"
                value={editedEntry.importFile}
                className="col-span-3"
                readOnly
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

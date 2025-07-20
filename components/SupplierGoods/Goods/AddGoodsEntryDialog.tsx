"use client";

import type React from "react";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GoodsImportRow } from "@/types/excel";
import { cnCodes } from "@/data/cnCodes";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, isValid } from "date-fns";
import { cn } from "@/lib/utils";

interface AddGoodsEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newEntry: GoodsImportRow) => void;
}

// Helper function to generate a random number between min and max with 2 decimal places
const generateRandomValue = (min: number, max: number): number => {
  return Number.parseFloat((Math.random() * (max - min) + min).toFixed(2));
};

export function AddGoodsEntryDialog({
  isOpen,
  onClose,
  onSave,
}: AddGoodsEntryDialogProps) {
  const [newEntry, setNewEntry] = useState<GoodsImportRow>({
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
    seeDirect: generateRandomValue(1.5, 4.5),
    seeIndirect: generateRandomValue(1.5, 4.5),
    supplierId: 1, // Assuming a default supplier ID, adjust as needed
  });
  const [date, setDate] = useState<Date>(new Date());

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEntry((prev) => ({
      ...prev,
      [name]:
        name === "quantity" || name === "seeDirect" || name === "seeIndirect"
          ? Number.parseFloat(value)
          : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewEntry((prev) => ({ ...prev, [name]: value }));
  };

  const getQuarter = (date: Date) => {
    const month = date.getMonth();
    return `Q${Math.floor(month / 3) + 1}-${date.getFullYear()}`;
  };

  const handleSave = () => {
    onSave({
      ...newEntry,
      date: isValid(date) ? date : new Date(),
      quarter: getQuarter(isValid(date) ? date : new Date()),
    });
    setNewEntry({
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
      seeDirect: generateRandomValue(1.5, 4.5),
      seeIndirect: generateRandomValue(1.5, 4.5),
      supplierId: 1, // Assuming a default supplier ID, adjust as needed
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Goods Entry</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cnCode" className="text-right">
              CN Code
            </Label>
            <Select
              value={newEntry.cnCode}
              onValueChange={(value) => handleSelectChange("cnCode", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select CN Code" />
              </SelectTrigger>
              <SelectContent>
                {cnCodes.map((cnCode) => (
                  <SelectItem key={cnCode.code} value={cnCode.code}>
                    {cnCode.code} - {cnCode.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="manufacturer" className="text-right">
              Manufacturer
            </Label>
            <Input
              id="manufacturer"
              name="manufacturer"
              value={newEntry.manufacturer}
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
              value={newEntry.quantity}
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
              value={newEntry.unit}
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
              value={newEntry.productionMethod}
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
              value={newEntry.customsProcedure}
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
              value={newEntry.seeDirect}
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
              value={newEntry.seeIndirect}
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
              value={newEntry.remarks}
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
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>
            Add Entry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

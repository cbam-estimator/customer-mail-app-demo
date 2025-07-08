"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCompany } from "@/context/company-context"
import type { CompanyInfo } from "@/types/company"

interface CompanyDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function CompanyDialog({ isOpen, onClose }: CompanyDialogProps) {
  const { company, updateCompany } = useCompany()
  const [editedCompany, setEditedCompany] = useState<CompanyInfo>(company)

  useEffect(() => {
    setEditedCompany(company)
  }, [company])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditedCompany((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    updateCompany(editedCompany)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Company Profile</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Company Name</Label>
            <Input id="name" name="name" value={editedCompany.name} onChange={handleInputChange} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2 col-span-2">
              <Label htmlFor="street">Street</Label>
              <Input id="street" name="street" value={editedCompany.street} onChange={handleInputChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="houseNumber">House Number</Label>
              <Input
                id="houseNumber"
                name="houseNumber"
                value={editedCompany.houseNumber}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="additionalAddress">Additional Address</Label>
            <Input
              id="additionalAddress"
              name="additionalAddress"
              value={editedCompany.additionalAddress}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input id="postalCode" name="postalCode" value={editedCompany.postalCode} onChange={handleInputChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" value={editedCompany.city} onChange={handleInputChange} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="country">Country</Label>
            <Input id="country" name="country" value={editedCompany.country} onChange={handleInputChange} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="eoriNumber">EORI Number</Label>
            <Input id="eoriNumber" name="eoriNumber" value={editedCompany.eoriNumber} onChange={handleInputChange} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contactPerson">Contact Person</Label>
            <Input
              id="contactPerson"
              name="contactPerson"
              value={editedCompany.contactPerson}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contactPosition">Contact Position</Label>
            <Input
              id="contactPosition"
              name="contactPosition"
              value={editedCompany.contactPosition}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

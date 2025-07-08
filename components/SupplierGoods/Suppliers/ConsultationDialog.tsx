"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Supplier } from "@/types/supplier"
import { SupplierStatus } from "@/types/supplier"
import { Handshake, Clock } from "lucide-react"

interface ConsultationDialogProps {
  isOpen: boolean
  onClose: () => void
  supplier: Supplier | null
  onBookConsultation: (updatedSupplier: Supplier) => void
}

export function ConsultationDialog({ isOpen, onClose, supplier, onBookConsultation }: ConsultationDialogProps) {
  if (!supplier) return null

  const handleBookConsultation = () => {
    // Create updated supplier with increased consultation hours
    const updatedSupplier = {
      ...supplier,
      consultationHours: (supplier.consultationHours ?? 0) + 3,
    }

    // If the supplier status is "Consultation Requested", change it to "Under Consultation"
    if (supplier.status === SupplierStatus.ConsultationRequested) {
      updatedSupplier.status = SupplierStatus.UnderConsultation
    }

    onBookConsultation(updatedSupplier)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Handshake className="h-6 w-6 text-green-500" />
            Schedule Consultation
          </DialogTitle>
        </DialogHeader>
        <div className="mt-6 space-y-6">
          <div className="flex justify-center">
            <div className="bg-green-100 rounded-full p-6">
              <Handshake className="h-16 w-16 text-green-600" />
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">{supplier.name}</h3>
            <p className="text-sm text-gray-600">
              Book consultation hours with our experts to ensure accurate and meaningful data collection.
            </p>
          </div>
          <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Current booked hours:</span>
            </div>
            <span className="text-2xl font-bold">{supplier.consultationHours ?? 0}</span>
          </div>
        </div>
        <DialogFooter className="mt-6">
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleBookConsultation} className="bg-green-600 hover:bg-green-700">
            Book 3 Hours
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

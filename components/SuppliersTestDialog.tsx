"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DatabaseTestPopup } from "./DatabaseTestPopup"

interface SuppliersTestDialogProps {
  className?: string
}

export function SuppliersTestDialog({ className = "" }: SuppliersTestDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          Test Database Tables
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Database Test</DialogTitle>
          <DialogDescription>Test the database tables and their relationships.</DialogDescription>
        </DialogHeader>
        <DatabaseTestPopup />
      </DialogContent>
    </Dialog>
  )
}

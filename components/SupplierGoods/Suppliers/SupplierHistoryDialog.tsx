import type React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { type Supplier, SupplierStatus } from "@/types/supplier"
import { CheckCircle, Clock, Mail, FileText, Handshake, AlertCircle, Plus, MessageCircle } from "lucide-react"

interface SupplierHistoryDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  supplier: Supplier
}

interface HistoryEntry {
  date: string
  status: string
  remark: string
  icon: React.ReactNode
  color: string
}

const getStatusHistory = (supplier: Supplier): HistoryEntry[] => {
  const baseHistory: HistoryEntry[] = []

  switch (supplier.status) {
    case SupplierStatus.ContactFailed:
      baseHistory.push(
        {
          date: "2023-07-15",
          status: "Contact Failed",
          remark: "Unable to establish contact after multiple attempts",
          icon: <AlertCircle className="h-4 w-4" />,
          color: "bg-red-100 text-red-800",
        },
        {
          date: "2023-07-10",
          status: "Mail No. 3 Sent",
          remark: "Third follow-up mail sent",
          icon: <Mail className="h-4 w-4" />,
          color: "bg-purple-100 text-purple-800",
        },
        {
          date: "2023-07-05",
          status: "Mail No. 2 Sent",
          remark: "Second follow-up mail sent",
          icon: <Mail className="h-4 w-4" />,
          color: "bg-purple-100 text-purple-800",
        },
        {
          date: "2023-07-01",
          status: "Mail No. 1 Sent",
          remark: "First follow-up mail sent",
          icon: <Mail className="h-4 w-4" />,
          color: "bg-purple-100 text-purple-800",
        },
        {
          date: "2023-06-25",
          status: "Initial Mail Sent",
          remark: "Initial contact mail sent",
          icon: <Mail className="h-4 w-4" />,
          color: "bg-purple-100 text-purple-800",
        },
      )
      break

    case SupplierStatus.SupportingDocumentsReceived:
      baseHistory.push(
        {
          date: "2023-07-15",
          status: "Supporting Docs Received",
          remark: "Supporting documents received and validated",
          icon: <FileText className="h-4 w-4" />,
          color: "bg-green-100 text-green-800",
        },
        {
          date: "2023-07-10",
          status: "Answer Received",
          remark: "Supplier responded with additional information",
          icon: <MessageCircle className="h-4 w-4" />,
          color: "bg-blue-100 text-blue-800",
        },
        {
          date: "2023-07-05",
          status: "Mail Sent",
          remark: "Mail sent requesting supporting documents",
          icon: <Mail className="h-4 w-4" />,
          color: "bg-purple-100 text-purple-800",
        },
        {
          date: "2023-07-01",
          status: "Document Added",
          remark: "Initial document added to supplier profile",
          icon: <FileText className="h-4 w-4" />,
          color: "bg-blue-100 text-blue-800",
        },
      )
      break

    case SupplierStatus.ConsultationRequested:
      baseHistory.push(
        {
          date: "2023-07-20",
          status: "Consultation Requested",
          remark: "Supplier requested consultation",
          icon: <Handshake className="h-4 w-4" />,
          color: "bg-orange-100 text-orange-800",
        },
        {
          date: "2023-07-15",
          status: "Answer Received",
          remark: "Dear Mr. Haak, Currently we are not able to [...]",
          icon: <MessageCircle className="h-4 w-4" />,
          color: "bg-blue-100 text-blue-800",
        },
        {
          date: "2023-07-10",
          status: "Mail No. 2 Sent",
          remark: "Follow-up mail sent",
          icon: <Mail className="h-4 w-4" />,
          color: "bg-purple-100 text-purple-800",
        },
        {
          date: "2023-07-05",
          status: "Mail Sent",
          remark: "Initial mail sent",
          icon: <Mail className="h-4 w-4" />,
          color: "bg-purple-100 text-purple-800",
        },
        {
          date: "2023-07-01",
          status: "Document Added",
          remark: "Initial document added to supplier profile",
          icon: <FileText className="h-4 w-4" />,
          color: "bg-blue-100 text-blue-800",
        },
      )
      break

    case SupplierStatus.EmissionDataReceived:
      // Keep the existing logic for Emission Data status
      const hasConsultationHours = (supplier.consultationHours ?? 0) > 0
      if (hasConsultationHours) {
        baseHistory.push(
          {
            date: "2023-07-10",
            status: "Emission Data Received",
            remark: "Emission Data received and validated",
            icon: <CheckCircle className="h-4 w-4" />,
            color: "bg-green-100 text-green-800",
          },
          {
            date: "2023-07-05",
            status: "Consultation Booked",
            remark: "3 Hours of consultation booked for supplier",
            icon: <Handshake className="h-4 w-4" />,
            color: "bg-blue-100 text-blue-800",
          },
          {
            date: "2023-07-03",
            status: "Consultation Request",
            remark:
              'Supplier requested Consultation. Remark: "Dear CBAM-Estimator, Dear Customer, we are currently not able to map [...]"',
            icon: <Handshake className="h-4 w-4" />,
            color: "bg-orange-100 text-orange-800",
          },
          {
            date: "2023-07-01",
            status: "Answer Received",
            remark: "Dear CBAM-Estimator Team, we recognize the need to [...]",
            icon: <Mail className="h-4 w-4" />,
            color: "bg-blue-100 text-blue-800",
          },
          {
            date: "2023-06-28",
            status: "Mail No. 1 Sent",
            remark: "Mail with standard request sent",
            icon: <Mail className="h-4 w-4" />,
            color: "bg-purple-100 text-purple-800",
          },
          {
            date: "2023-06-25",
            status: "Supplier Added",
            remark: "Beispiel GmbH 2 customer_template 1.XIsx",
            icon: <Plus className="h-4 w-4" />,
            color: "bg-gray-100 text-gray-800",
          },
        )
      } else {
        baseHistory.push(
          {
            date: "2023-07-10",
            status: "Emission Data Received",
            remark: "Emission Data received and validated",
            icon: <CheckCircle className="h-4 w-4" />,
            color: "bg-green-100 text-green-800",
          },
          {
            date: "2023-07-05",
            status: "Pending Info",
            remark: "Supplier asked for clarification regarding requested material numbers",
            icon: <Clock className="h-4 w-4" />,
            color: "bg-yellow-100 text-yellow-800",
          },
          {
            date: "2023-07-03",
            status: "Answer Received",
            remark: "Dear CBAM-Estimator Team, we recognize the need to [...]",
            icon: <Mail className="h-4 w-4" />,
            color: "bg-blue-100 text-blue-800",
          },
          {
            date: "2023-07-01",
            status: "Mail No. 2 Sent",
            remark: "Follow up mail sent",
            icon: <Mail className="h-4 w-4" />,
            color: "bg-purple-100 text-purple-800",
          },
          {
            date: "2023-06-28",
            status: "Mail No. 1 Sent",
            remark: "Mail with standard request sent",
            icon: <Mail className="h-4 w-4" />,
            color: "bg-purple-100 text-purple-800",
          },
          {
            date: "2023-06-25",
            status: "Supplier Added",
            remark: "Beispiel GmbH 2 customer_template 1.XIsx",
            icon: <Plus className="h-4 w-4" />,
            color: "bg-gray-100 text-gray-800",
          },
        )
      }
      break

    default:
      // For other statuses, you can add a default history or leave it empty
      break
  }

  return baseHistory
}

export function SupplierHistoryDialog({ isOpen, onOpenChange, supplier }: SupplierHistoryDialogProps) {
  const history = getStatusHistory(supplier)

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Status History for {supplier.name}</DialogTitle>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Remark</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((entry, index) => (
              <TableRow key={index}>
                <TableCell>{entry.date}</TableCell>
                <TableCell>
                  <Badge className={`flex items-center space-x-1 ${entry.color}`}>
                    {entry.icon}
                    <span>{entry.status}</span>
                  </Badge>
                </TableCell>
                <TableCell>{entry.remark}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  )
}
